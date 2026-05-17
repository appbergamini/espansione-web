import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { computeMaturidade360, agregateMaturidades } from '../../lib/maturidade/computeMaturidade360';

const FORM_TIPO_BY_PAPEL = {
  socios: 'intake_socios',
  colaboradores: 'intake_colaboradores',
  clientes: 'intake_clientes',
};

// Tipos de formulário que preservam anonimato do respondente.
// Para estes, _respondente_id e _respondente_email NÃO são persistidos em
// respostas_json (o vínculo fica apenas em respondentes.respondido_em).
const TIPOS_ANONIMOS = new Set([
  'intake_colaboradores',
  'entrevista_colaboradores',
]);

// Mapa do tipo de formulário para o tipo de opt-in (quando o payload contém
// um bloco _opt_in com aceito === true).
const TIPO_OPT_IN_POR_FORMULARIO = {
  intake_colaboradores: 'colaborador',
  entrevista_colaboradores: 'colaborador',
  intake_clientes: 'cliente',
  entrevista_cliente: 'cliente',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { projetoId: projetoIdBody, tipo: tipoBody, respostas, token } = req.body;
    if (!respostas) return res.status(400).json({ error: 'respostas obrigatórias' });

    const db = supabaseAdmin;
    let projetoId = projetoIdBody;
    let tipo = tipoBody;
    let respondenteRow = null;

    if (token) {
      const { data: r, error: rErr } = await db
        .from('respondentes')
        .select('*')
        .eq('token', String(token).trim())
        .maybeSingle();
      if (rErr) throw rErr;
      if (!r) return res.status(403).json({ error: 'Token inválido' });
      respondenteRow = r;
      projetoId = r.projeto_id;
      if (!tipo) tipo = FORM_TIPO_BY_PAPEL[r.papel] || null;
    }

    if (!projetoId || !tipo) {
      return res.status(400).json({ error: 'projetoId e tipo obrigatórios (ou token válido)' });
    }

    const { data: projeto, error: projErr } = await db
      .from('projetos')
      .select('id')
      .eq('id', projetoId)
      .single();
    if (projErr && projErr.code !== 'PGRST116') throw projErr;
    if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado.' });

    const respondenteNome = respondenteRow?.nome || respostas.respondente || 'Anonimo';
    const { respondente: _r, ...respostasLimpas } = respostas;

    // Extrai _opt_in do payload ANTES de qualquer persistência. Defensivo:
    // acontece mesmo se o frontend não deveria ter enviado.
    const optInPayload = respostasLimpas._opt_in || null;
    delete respostasLimpas._opt_in;

    const anonimo = TIPOS_ANONIMOS.has(tipo);

    if (anonimo) {
      // Formulário anônimo — remover qualquer vínculo identificável do JSON.
      delete respostasLimpas._respondente_id;
      delete respostasLimpas._respondente_email;
    } else if (respondenteRow) {
      // Formulário identificado — manter a associação.
      respostasLimpas._respondente_id = respondenteRow.id;
      respostasLimpas._respondente_email = respondenteRow.email;
    }

    const { error } = await db.from('formularios').insert([{
      projeto_id: projetoId,
      tipo,
      // Para tipos anônimos, não gravamos o nome do respondente no registro
      // do formulário (preserva anonimato consistente).
      respondente: anonimo ? 'Anonimo' : respondenteNome,
      respostas_json: respostasLimpas,
    }]);
    if (error) throw error;

    // Atualiza status do respondente — vale para TODOS os tipos (anônimos ou não).
    // Aqui guardamos "quem respondeu e quando" sem guardar "o que respondeu".
    if (respondenteRow) {
      await db
        .from('respondentes')
        .update({ status_convite: 'respondido', respondido_em: new Date().toISOString() })
        .eq('id', respondenteRow.id);
    }

    // Hook pós-gravação: intake_socios → computa maturidade_360 agregada.
    // Agrega todos os intake_socios do projeto (opção b da spec): média por
    // pilar + divergência entre sócios como metadado.
    // Falha não aborta o request — o agregado é derivado.
    if (tipo === 'intake_socios') {
      try {
        const { data: intakesSocios } = await db
          .from('formularios')
          .select('respostas_json')
          .eq('projeto_id', projetoId)
          .eq('tipo', 'intake_socios');

        if (intakesSocios && intakesSocios.length > 0) {
          const maturidades = intakesSocios
            .map(i => computeMaturidade360(i.respostas_json))
            .filter(m => m !== null && m.completude.respondidas > 0);

          if (maturidades.length > 0) {
            const agregado = agregateMaturidades(maturidades);
            // intake_data: chave = `campo`, valor = `text` (JSON serializado)
            const { error: errIntake } = await db
              .from('intake_data')
              .upsert(
                { projeto_id: projetoId, campo: 'maturidade_360', valor: JSON.stringify(agregado) },
                { onConflict: 'projeto_id,campo' }
              );
            if (errIntake) console.error('Erro ao upsert maturidade_360:', errIntake);
          }
        }
      } catch (err) {
        console.error('Erro ao computar maturidade_360:', err);
      }
    }

    // Opt-in para entrevista em profundidade — tabela separada,
    // desacoplada da resposta do formulário.
    if (optInPayload && optInPayload.aceito === true) {
      const tipoOptIn = TIPO_OPT_IN_POR_FORMULARIO[tipo] || null;
      if (tipoOptIn && optInPayload.nome && optInPayload.contato) {
        const { error: errOptIn } = await db
          .from('opt_in_entrevistas')
          .insert({
            projeto_id: projetoId,
            tipo: tipoOptIn,
            nome: optInPayload.nome,
            contato: optInPayload.contato,
            area: optInPayload.area ?? respostas.area ?? null,
            tempo_casa: optInPayload.tempo_casa ?? respostas.tempo_casa ?? null,
            canal_preferido: optInPayload.canal_preferido ?? null,
            horario_preferido: optInPayload.horario_preferido ?? null,
            consentimento_texto: optInPayload.consentimento_texto ?? null,
          });
        if (errOptIn) {
          // Falha no opt-in não deve abortar o submit principal — logar e seguir.
          console.error('Erro ao gravar opt-in:', errOptIn);
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('ERRO Form API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

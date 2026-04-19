import { supabaseAdmin } from '../../lib/supabaseAdmin';

const FORM_TIPO_BY_PAPEL = {
  socios: 'intake_socios',
  colaboradores: 'intake_colaboradores',
  clientes: 'intake_clientes',
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
      tipo = FORM_TIPO_BY_PAPEL[r.papel] || tipo;
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

    if (respondenteRow) {
      respostasLimpas._respondente_id = respondenteRow.id;
      respostasLimpas._respondente_email = respondenteRow.email;
    }

    const { error } = await db.from('formularios').insert([{
      projeto_id: projetoId,
      tipo,
      respondente: respondenteNome,
      respostas_json: respostasLimpas,
    }]);
    if (error) throw error;

    if (respondenteRow) {
      await db
        .from('respondentes')
        .update({ status_convite: 'respondido', respondido_em: new Date().toISOString() })
        .eq('id', respondenteRow.id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('ERRO Form API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

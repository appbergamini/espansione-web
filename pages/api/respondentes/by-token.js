import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { tokenValido, ERROS_TOKEN } from '../../../lib/tokens/respondenteToken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const token = req.query.token;
  if (!token) {
    // 400 mantido (cliente enviou request malformada) — body carrega
    // o código canônico para a UI montar mensagem amigável.
    return res.status(400).json({ success: false, ...ERROS_TOKEN.AUSENTE });
  }

  try {
    const db = supabaseAdmin;
    const { data: resp, error } = await db
      .from('respondentes')
      .select('id, projeto_id, nome, email, papel, status_convite, respondido_em, token_expira_em')
      .eq('token', String(token).trim())
      .maybeSingle();
    if (error) throw error;
    if (!resp) {
      return res.status(404).json({ success: false, ...ERROS_TOKEN.NAO_EXISTE });
    }

    // 410 Gone — recurso existiu mas não está mais disponível.
    // Semanticamente correto pra token expirado; diferente de 404
    // (nunca existiu) e 401 (auth). Browsers não cacheiam nem
    // re-tentam automaticamente.
    if (!tokenValido(resp.token_expira_em)) {
      return res.status(410).json({ success: false, ...ERROS_TOKEN.EXPIRADO });
    }

    const { data: projeto } = await db
      .from('projetos')
      .select('cliente, nome, tipo_negocio')
      .eq('id', resp.projeto_id)
      .single();

    const nomeMarca = projeto?.cliente || projeto?.nome || '';
    const tipoNegocio = projeto?.tipo_negocio || 'B2C';

    // Count de colaboradores do projeto — usado pelo form de colaboradores v3
    // para o aviso condicional de equipes pequenas (≤10). Não vaza identidades.
    let totalColaboradores = null;
    if (resp.papel === 'colaboradores') {
      const { count } = await db
        .from('respondentes')
        .select('id', { count: 'exact', head: true })
        .eq('projeto_id', resp.projeto_id)
        .eq('papel', 'colaboradores');
      if (typeof count === 'number') totalColaboradores = count;
    }

    return res.status(200).json({
      success: true,
      respondente: {
        id: resp.id,
        projeto_id: resp.projeto_id,
        nome: resp.nome,
        email: resp.email,
        papel: resp.papel,
        status_convite: resp.status_convite,
        respondido_em: resp.respondido_em || null,
        projeto_nome: nomeMarca,
      },
      // Meta do projeto usada por formulários públicos
      // (intake_clientes v2 lê daqui para placeholders e condicionais)
      projeto: {
        id: resp.projeto_id,
        nome_marca: nomeMarca,
        tipo_negocio: tipoNegocio,
        total_colaboradores: totalColaboradores,
      },
    });
  } catch (err) {
    console.error('[by-token] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const token = req.query.token;
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  try {
    const db = supabaseAdmin;
    const { data: resp, error } = await db
      .from('respondentes')
      .select('id, projeto_id, nome, email, papel, status_convite, respondido_em')
      .eq('token', String(token).trim())
      .maybeSingle();
    if (error) throw error;
    if (!resp) return res.status(404).json({ success: false, error: 'Token inválido' });

    const { data: projeto } = await db
      .from('projetos')
      .select('cliente, nome, tipo_negocio')
      .eq('id', resp.projeto_id)
      .single();

    const nomeMarca = projeto?.cliente || projeto?.nome || '';
    const tipoNegocio = projeto?.tipo_negocio || 'B2C';

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
      },
    });
  } catch (err) {
    console.error('[by-token] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

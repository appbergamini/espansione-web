import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const token = req.query.token;
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  try {
    const db = supabaseAdmin;
    const { data: p, error } = await db
      .from('cis_participantes')
      .select('id, projeto_id, nome, email, cargo, liberado, respondido')
      .eq('token', String(token).trim())
      .maybeSingle();
    if (error) throw error;
    if (!p) return res.status(404).json({ success: false, error: 'Token inválido' });
    if (!p.liberado) return res.status(403).json({ success: false, error: 'Acesso bloqueado.' });

    return res.status(200).json({
      success: true,
      participante: {
        id: p.id,
        projeto_id: p.projeto_id,
        nome: p.nome,
        email: p.email,
        cargo: p.cargo,
        respondido: p.respondido,
      },
    });
  } catch (err) {
    console.error('[cis/by-token] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

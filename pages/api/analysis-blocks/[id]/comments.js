// FIX.24 — comentários no bloco de curadoria.
// GET   /api/analysis-blocks/:id/comments — lista
// POST  /api/analysis-blocks/:id/comments  body: { comentario, autor_tipo? }

import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('analysis_block_comments')
      .select('*')
      .eq('block_id', id)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, comentarios: data || [] });
  }

  if (req.method === 'POST') {
    const { comentario, autor_tipo } = req.body || {};
    if (!comentario || !String(comentario).trim()) {
      return res.status(400).json({ success: false, error: 'comentario obrigatório' });
    }
    const tipo = autor_tipo === 'cliente' ? 'cliente' : 'consultor';
    const { data, error } = await db
      .from('analysis_block_comments')
      .insert({
        block_id: id,
        autor_tipo: tipo,
        autor_id: user.id,
        comentario: String(comentario).trim(),
      })
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, comentario: data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

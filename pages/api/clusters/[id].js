// FIX.29 (Fase B) — GET / PATCH / DELETE de um cluster de comunicação.

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// FIX.30 — meta_json agora aceito.
const CAMPOS_PERMITIDOS = ['nome', 'descricao', 'afinidades', 'motivacoes', 'objetivo_negocio', 'mensagem_ancora', 'ordem', 'meta_json'];

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
    const { data, error } = await db.from('clusters_comunicacao').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ success: false, error: 'Cluster não encontrado' });
    return res.status(200).json({ success: true, cluster: data });
  }

  if (req.method === 'PATCH') {
    const update = {};
    for (const k of CAMPOS_PERMITIDOS) {
      if (k in (req.body || {})) update[k] = req.body[k];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum campo para atualizar' });
    }
    const { data, error } = await db
      .from('clusters_comunicacao')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, cluster: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await db.from('clusters_comunicacao').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

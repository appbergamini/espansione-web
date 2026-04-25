// FIX.29 (Fase B) — CRUD de clusters de comunicação por projeto.
// GET  /api/clusters?projeto_id=...  → lista
// POST /api/clusters                  → cria  body: { projeto_id, nome, ...campos opcionais }

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// FIX.30 — meta_json agora aceito; permite o agente Lean Clusters
// gravar campos ricos (nivel_confianca, base_analise, mensagem_chave,
// provas_necessarias, canais_prioritarios, evidencias, etc.).
const CAMPOS_PERMITIDOS = ['nome', 'descricao', 'afinidades', 'motivacoes', 'objetivo_negocio', 'mensagem_ancora', 'ordem', 'meta_json'];

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db
    .from('profiles')
    .select('role,empresa_id')
    .eq('id', user.id)
    .single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  if (req.method === 'GET') {
    const { projeto_id } = req.query || {};
    if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });

    const { data, error } = await db
      .from('clusters_comunicacao')
      .select('*')
      .eq('projeto_id', projeto_id)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, clusters: data || [] });
  }

  if (req.method === 'POST') {
    const { projeto_id, ...rest } = req.body || {};
    if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });
    if (!rest.nome || !String(rest.nome).trim()) {
      return res.status(400).json({ success: false, error: 'nome obrigatório' });
    }

    const insert = { projeto_id };
    for (const k of CAMPOS_PERMITIDOS) {
      if (k in rest) insert[k] = rest[k];
    }

    const { data, error } = await db
      .from('clusters_comunicacao')
      .insert(insert)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, cluster: data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

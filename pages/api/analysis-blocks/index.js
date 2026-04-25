// FIX.24 — lista blocos de curadoria por projeto.
// GET /api/analysis-blocks?projeto_id=...&status=...&categoria=...&q=...
// Retorna sempre ordenados por agent_num, depois categoria, depois titulo.

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

  const { projeto_id, status, categoria, q } = req.query || {};
  if (!projeto_id) {
    return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });
  }

  // Master vê qualquer projeto; admin só vê da própria empresa
  if (profile.role === 'admin') {
    const { data: proj } = await db
      .from('projetos')
      .select('empresa_id')
      .eq('id', projeto_id)
      .single();
    if (!proj || proj.empresa_id !== profile.empresa_id) {
      return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
    }
  }

  let query = db
    .from('analysis_blocks')
    .select('*')
    .eq('projeto_id', projeto_id);

  if (status)    query = query.eq('status', status);
  if (categoria) query = query.eq('categoria', categoria);
  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`titulo.ilike.${term},edited_titulo.ilike.${term},ai_evidencia.ilike.${term},ai_interpretacao.ilike.${term},ai_recomendacao.ilike.${term}`);
  }

  query = query.order('agent_num', { ascending: true })
               .order('categoria',   { ascending: true })
               .order('created_at',  { ascending: true });

  const { data: blocks, error } = await query;
  if (error) {
    console.error('[API analysis-blocks] erro:', error);
    return res.status(500).json({ success: false, error: error.message });
  }

  // Métricas resumo (sempre úteis pra UI)
  const counts = {
    total: blocks.length,
    pendente_revisao: 0,
    aprovado: 0,
    editado: 0,
    excluido: 0,
    somente_bastidor: 0,
    levar_discussao: 0,
    reanalise_solicitada: 0,
    validado_cliente: 0,
    incluidos: 0,
  };
  for (const b of blocks) {
    counts[b.status] = (counts[b.status] || 0) + 1;
    if (b.incluir_no_relatorio) counts.incluidos += 1;
  }

  return res.status(200).json({ success: true, blocks, counts });
}

// FIX.24 — backfill de analysis_blocks a partir de outputs existentes.
// POST /api/curadoria/backfill  body: { projeto_id }
// Idempotente: materializarFindings pula outputs que já têm blocos.
// Para outputs legados (sem findings_json), usa parser heurístico do
// conteudo markdown.

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { materializarFindings } from '../../../lib/curadoria/extractFindings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

  const { projeto_id } = req.body || {};
  if (!projeto_id) {
    return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });
  }

  // Restringe admin à própria empresa
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

  const { data: outputs, error: errOut } = await db
    .from('outputs')
    .select('*')
    .eq('projeto_id', projeto_id)
    .order('agent_num', { ascending: true });

  if (errOut) return res.status(500).json({ success: false, error: errOut.message });

  let totalInserted = 0;
  let totalSkipped = 0;
  const detalhes = [];

  for (const out of (outputs || [])) {
    try {
      const r = await materializarFindings(db, out);
      if (r.skipped) totalSkipped += 1;
      totalInserted += r.inserted || 0;
      detalhes.push({ output_id: out.id, agent_num: out.agent_num, ...r });
    } catch (e) {
      detalhes.push({ output_id: out.id, agent_num: out.agent_num, error: e.message });
    }
  }

  return res.status(200).json({
    success: true,
    projeto_id,
    totalOutputs: (outputs || []).length,
    totalInserted,
    totalSkipped,
    detalhes,
  });
}

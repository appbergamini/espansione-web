// FIX.24 — restaura versão original da IA (zera campos edited_*).
// POST /api/analysis-blocks/:id/restore

import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
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

  const { data: anterior } = await db
    .from('analysis_blocks')
    .select('*')
    .eq('id', id)
    .single();
  if (!anterior) return res.status(404).json({ success: false, error: 'Bloco não encontrado' });

  const { data: novo, error } = await db
    .from('analysis_blocks')
    .update({
      edited_titulo: null,
      edited_evidencia: null,
      edited_interpretacao: null,
      edited_recomendacao: null,
      status: 'pendente_revisao',
      reviewed_at: null,
      reviewed_by: null,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ success: false, error: error.message });

  await db.from('analysis_block_versions').insert({
    block_id: id,
    tipo: 'edicao_consultor',
    snapshot_json: { acao: 'restore', anterior, restaurado_para: novo },
    created_by: user.id,
  });

  return res.status(200).json({ success: true, block: novo });
}

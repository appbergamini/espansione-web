import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import {
  approveLearningSuggestion,
  archiveLearningSuggestion,
  rejectLearningSuggestion,
} from '../../../../lib/agency/learning';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const { id } = req.query || {};

    if (req.method === 'PATCH' || req.method === 'POST') {
      const { action, reason } = req.body || {};
      let suggestion;
      if (action === 'approve') suggestion = await approveLearningSuggestion(supabaseAdmin, id);
      else if (action === 'reject') suggestion = await rejectLearningSuggestion(supabaseAdmin, id, reason);
      else if (action === 'archive') suggestion = await archiveLearningSuggestion(supabaseAdmin, id);
      else return res.status(400).json({ success: false, error: 'action inválida' });
      return res.status(200).json({ success: true, suggestion });
    }

    if (req.method === 'DELETE') {
      const suggestion = await archiveLearningSuggestion(supabaseAdmin, id);
      return res.status(200).json({ success: true, suggestion });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/learnings/:id]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

import { getServerUser } from '../../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../../lib/agency/runtime';
import { saveAgencyOutputToLibrary } from '../../../../../lib/agency/library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const { id } = req.query || {};
    const { itemType, sourceStepId, notes, title, tags } = req.body || {};
    const item = await saveAgencyOutputToLibrary(supabaseAdmin, id, itemType, {
      sourceStepId,
      notes,
      title,
      tags,
    });
    return res.status(200).json({ success: true, item });
  } catch (error) {
    console.error('[agency/runs/:id/library]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

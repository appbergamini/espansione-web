import { getServerUser } from '../../../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../../../lib/supabaseAdmin';
import { approveAgencyBriefing } from '../../../../../../lib/agency/briefingApproval';
import { requireAgencyUser } from '../../../../../../lib/agency/runtime';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const request = await approveAgencyBriefing(supabaseAdmin, req.query.id, {
      editedBriefing: req.body?.editedBriefing,
      approvedBy: user.id,
    });
    return res.status(200).json({ success: true, request, approvedBriefing: request.approved_briefing_json });
  } catch (error) {
    console.error('[agency/briefing/approve]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}


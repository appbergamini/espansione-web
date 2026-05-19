import { getServerUser } from '../../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../../lib/agency/runtime';
import { regenerateAgencyStep } from '../../../../../lib/agency/workflow';

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
    const { agentId, confirmApproved = false, modelSelection } = req.body || {};
    if (!id || !agentId) return res.status(400).json({ success: false, error: 'runId e agentId são obrigatórios' });

    const result = await regenerateAgencyStep(supabaseAdmin, id, agentId, undefined, { confirmApproved, modelSelection });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[agency/runs/:id/regenerate-step]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

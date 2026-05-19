import { getServerUser } from '../../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../../lib/agency/runtime';
import { runAgencyWorkflow } from '../../../../../lib/agency/workflow';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const { modelSelection } = req.body || {};
    const result = await runAgencyWorkflow(supabaseAdmin, req.query.id, undefined, { modelSelection });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[agency/run-workflow]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}


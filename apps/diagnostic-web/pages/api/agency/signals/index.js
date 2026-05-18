import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import {
  createAgencySignal,
  listAgencySignals,
  summarizeAgencySignalsBySlice,
} from '../../../../lib/agency/agencySignals';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method === 'GET') {
      const {
        brand_id,
        affected_slice,
        signal_type,
        severity,
        status,
        agency_run_id,
        agency_request_id,
        source_agent_id,
        search,
      } = req.query || {};
      const signals = await listAgencySignals(supabaseAdmin, brand_id, {
        affectedSlice: affected_slice,
        signalType: signal_type,
        severity,
        status,
        agencyRunId: agency_run_id,
        agencyRequestId: agency_request_id,
        sourceAgentId: source_agent_id,
        search,
      });
      return res.status(200).json({
        success: true,
        signals,
        summary: summarizeAgencySignalsBySlice(signals),
      });
    }

    if (req.method === 'POST') {
      const signal = await createAgencySignal(supabaseAdmin, req.body || {});
      return res.status(200).json({ success: true, signal });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/signals]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

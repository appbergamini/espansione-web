import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import {
  getAgencyReadiness,
  normalizeStringArray,
  REQUEST_STATUSES,
  requireAgencyUser,
  validateAgencyRequestPayload,
} from '../../../../lib/agency/runtime';

const EDITABLE_FIELDS = [
  'request_type',
  'execution_profile_id',
  'channel',
  'objective',
  'audience_cluster',
  'offer',
  'context',
  'desired_cta',
  'restrictions',
  'reference_material',
  'status',
];

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    const { data: current, error: currentError } = await supabaseAdmin
      .from('agency_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (currentError) throw currentError;
    if (!current) return res.status(404).json({ success: false, error: 'Pedido não encontrado' });

    if (req.method === 'GET') {
      const { data: runs, error: runsError } = await supabaseAdmin
        .from('agency_runs')
        .select('*, agency_steps(*)')
        .eq('request_id', current.id)
        .order('created_at', { ascending: false });
      if (runsError) throw runsError;
      return res.status(200).json({ success: true, request: current, runs: runs || [] });
    }

    if (req.method === 'DELETE') {
      const { data, error } = await supabaseAdmin
        .from('agency_requests')
        .update({ status: 'archived' })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, request: data });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const patch = {};
      for (const field of EDITABLE_FIELDS) {
        if (field in (req.body || {})) patch[field] = req.body[field];
      }

      if ('restrictions' in patch) patch.restrictions = normalizeStringArray(patch.restrictions);
      if ('reference_material' in patch) patch.reference_material = normalizeStringArray(patch.reference_material);
      if (patch.status && !REQUEST_STATUSES.includes(patch.status)) {
        return res.status(400).json({ success: false, error: 'status inválido' });
      }

      const next = { ...current, ...patch };
      const { readiness } = await getAgencyReadiness(supabaseAdmin, current.brand_id);
      const errors = validateAgencyRequestPayload(next, readiness);
      if (errors.length) {
        return res.status(400).json({ success: false, error: errors.join('; '), readiness });
      }

      patch.readiness_warnings = readiness.warnings;

      const { data, error } = await supabaseAdmin
        .from('agency_requests')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, request: data, readiness });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/requests/:id]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

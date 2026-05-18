import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const { id } = req.query || {};
    const { data: run, error: runError } = await supabaseAdmin
      .from('agency_runs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) return res.status(404).json({ success: false, error: 'Run não encontrada' });

    const { data: steps, error: stepsError } = await supabaseAdmin
      .from('agency_steps')
      .select('*')
      .eq('run_id', id)
      .order('created_at', { ascending: true });
    if (stepsError) throw stepsError;

    return res.status(200).json({ success: true, run, steps: steps || [] });
  } catch (error) {
    console.error('[agency/runs/:id]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}


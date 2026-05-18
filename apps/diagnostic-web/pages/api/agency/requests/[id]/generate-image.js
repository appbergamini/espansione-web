import { getServerUser } from '../../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../../lib/agency/runtime';
import { buildApprovedArtworkOverlay, buildApprovedArtworkPrompt, generateApprovedArtwork, normalizeDecision } from '../../../../../lib/agency/imageGeneration';

export const config = {
  api: {
    responseLimit: '16mb',
  },
  maxDuration: 120,
};

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
    const { data: request, error: requestError } = await supabaseAdmin
      .from('agency_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (requestError) throw requestError;
    if (!request) return res.status(404).json({ success: false, error: 'Pedido não encontrado' });

    const { data: runs, error: runsError } = await supabaseAdmin
      .from('agency_runs')
      .select('*, agency_steps(*)')
      .eq('request_id', request.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (runsError) throw runsError;

    const approvedRun = (runs || []).find((run) => {
      const approver = (run.agency_steps || []).find((step) => step.agent_id === 'approver');
      const payload = approver?.output?.data || approver?.output || {};
      return normalizeDecision(payload.decisao || payload.decision) === 'approved';
    });

    if (!approvedRun) {
      return res.status(400).json({ success: false, error: 'Nenhuma run aprovada encontrada para este pedido.' });
    }

    const stepByAgent = new Map((approvedRun.agency_steps || []).map((step) => [step.agent_id, step]));
    const prompt = buildApprovedArtworkPrompt({
      request,
      copyStep: stepByAgent.get('copywriter'),
      visualStep: stepByAgent.get('visual_director'),
      editorStep: stepByAgent.get('editor'),
      approverStep: stepByAgent.get('approver'),
    });
    const overlayText = buildApprovedArtworkOverlay({
      copyStep: stepByAgent.get('copywriter'),
      editorStep: stepByAgent.get('editor'),
    });

    const image = await generateApprovedArtwork({ prompt });
    return res.status(200).json({
      success: true,
      image,
      overlayText,
      compositionMode: 'baked_text',
      prompt,
      runId: approvedRun.id,
    });
  } catch (error) {
    console.error('[agency/generate-image]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

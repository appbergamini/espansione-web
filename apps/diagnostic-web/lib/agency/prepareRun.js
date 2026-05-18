import { buildAccountDirectorPromptPack } from '@espansione/agents';
import { getAgencyReadiness } from './runtime';

export async function prepareAgencyRun(db, requestId) {
  if (!requestId) {
    const err = new Error('requestId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  const { data: request, error: requestError } = await db
    .from('agency_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (requestError) throw requestError;
  if (!request) {
    const err = new Error('Pedido não encontrado');
    err.statusCode = 404;
    throw err;
  }

  const { readiness, brandKernel } = await getAgencyReadiness(db, request.brand_id);
  if (!brandKernel || !['ready_for_content', 'ready_for_campaigns'].includes(readiness.status)) {
    const err = new Error('Brand Memory insuficiente para preparar briefing operacional');
    err.statusCode = 400;
    err.readiness = readiness;
    throw err;
  }

  if (!readiness.allowedRequestTypes.includes(request.request_type)) {
    const err = new Error(`Tipo de pedido não permitido para status ${readiness.status}`);
    err.statusCode = 400;
    err.readiness = readiness;
    throw err;
  }

  const agencyRequest = mapDbRequestToAgencyRequest(request);
  const promptPack = buildAccountDirectorPromptPack({
    brandKernel,
    agencyRequest,
  });

  const { data: run, error: runError } = await db
    .from('agency_runs')
    .insert({
      request_id: request.id,
      brand_id: request.brand_id,
      brand_kernel_version: brandKernel.source?.schemaVersion || '2.0',
      status: 'ready',
    })
    .select('*')
    .single();

  if (runError) throw runError;

  const stepInput = {
    brandKernel,
    agencyRequest,
    promptPack,
  };

  const { data: step, error: stepError } = await db
    .from('agency_steps')
    .insert({
      run_id: run.id,
      agent_id: 'account_director',
      input: stepInput,
      status: 'ready',
    })
    .select('*')
    .single();

  if (stepError) throw stepError;

  await db
    .from('agency_requests')
    .update({ status: 'briefing_pending', readiness_warnings: readiness.warnings })
    .eq('id', request.id);

  return { request, run, step, promptPack, readiness };
}

export function mapDbRequestToAgencyRequest(row) {
  return {
    id: row.id,
    brandId: row.brand_id,
    requestType: row.request_type,
    channel: row.channel,
    objective: row.objective,
    audienceCluster: row.audience_cluster || undefined,
    offer: row.offer || undefined,
    context: row.context,
    desiredCta: row.desired_cta || undefined,
    restrictions: row.restrictions || [],
    referenceMaterial: row.reference_material || [],
    status: row.status,
    createdBy: row.created_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


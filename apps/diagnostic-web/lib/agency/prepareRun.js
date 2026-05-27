import { buildAccountDirectorPromptPack } from '../../../../packages/agents/src/prompt-packs.ts';
import {
  buildAgencyExecutionPlan,
  selectAgencyExecutionProfile,
} from '../../../../packages/agents/src/execution-profiles.ts';
import { getDefaultAgencyModelSelection } from '../../../../packages/agents/src/model-registry.ts';
import { getAgencyReadiness } from './runtime.js';
import {
  assertActiveBrandMemoryVersion,
  createInitialAgencyRun,
  createInitialAgencyStep,
} from './runPersistence.js';

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

  const { readiness, brandKernel, brandMemoryVersion } = await getAgencyReadiness(db, request.brand_id);
  assertActiveBrandMemoryVersion(brandMemoryVersion, readiness);

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
  const selectedProfile = selectAgencyExecutionProfile({
    agencyRequest,
    brandReadiness: readiness,
  });
  const executionPlan = buildAgencyExecutionPlan({
    agencyRequest,
    brandKernel,
    selectedProfile,
  });
  const promptPack = buildAccountDirectorPromptPack({
    brandKernel,
    agencyRequest,
  });

  const stepInput = {
    brandKernel,
    agencyRequest,
    executionPlan,
    promptPack,
  };

  const modelSelection = getDefaultAgencyModelSelection(process.env.NODE_ENV);
  const run = await createInitialAgencyRun(db, { request, brandKernel, brandMemoryVersion, executionPlan, modelSelection });
  const step = await createInitialAgencyStep(db, { run, stepInput });

  await db
    .from('agency_requests')
    .update({ status: 'briefing_pending', readiness_warnings: readiness.warnings })
    .eq('id', request.id);

  return { request, run, step, promptPack, readiness, executionPlan };
}

export function mapDbRequestToAgencyRequest(row) {
  return {
    id: row.id,
    brandId: row.brand_id,
    executionProfileId: row.execution_profile_id || undefined,
    requestType: row.request_type,
    channel: row.request_type === 'landing_page_copy' ? 'website' : row.channel,
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


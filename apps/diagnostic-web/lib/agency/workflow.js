import {
  buildApproverPromptPack,
  buildCopywriterPromptPack,
  buildEditorPromptPack,
  buildVisualDirectorPromptPack,
} from '../../../../packages/agents/src/prompt-packs.ts';
import { getAgencyModelGateway } from './modelGateway.js';
import { prepareAgencyRun } from './prepareRun.js';
import { assertBriefingApproved } from './briefingApproval.js';
import {
  buildStepUpdateFromExecution,
  calculateAgencyRunExecutionSummary,
  updateRunExecutionMetadata,
} from './executionMetadata.js';

export const AGENCY_AGENT_ORDER = [
  'account_director',
  'copywriter',
  'visual_director',
  'editor',
  'approver',
];

export async function runAgencyWorkflow(db, requestId, modelGateway = getAgencyModelGateway()) {
  const prepared = await getOrPrepareRun(db, requestId);
  const run = prepared.run;
  const accountStep = prepared.step;
  const { brandKernel, agencyRequest } = accountStep.input;
  const { approvedBriefing } = await assertBriefingApproved(db, requestId);

  try {
    await db.from('agency_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', run.id);
    await db.from('agency_requests').update({ status: 'generation_running' }).eq('id', requestId);

    await ensureApprovedAccountStep(db, accountStep, approvedBriefing);

    const copyOutput = await createAndCompleteStep(db, run.id, 'copywriter', buildStepInput({
      agentId: 'copywriter',
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
    }), modelGateway);

    const visualOutput = await createAndCompleteStep(db, run.id, 'visual_director', buildStepInput({
      agentId: 'visual_director',
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
    }), modelGateway);

    const editorOutput = await createAndCompleteStep(db, run.id, 'editor', buildStepInput({
      agentId: 'editor',
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput: copyOutput.data,
      visualDirectorOutput: visualOutput.data,
    }), modelGateway);

    await db.from('agency_requests').update({ status: 'approval_pending' }).eq('id', requestId);

    const approverOutput = await createAndCompleteStep(db, run.id, 'approver', buildStepInput({
      agentId: 'approver',
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput: copyOutput.data,
      visualDirectorOutput: visualOutput.data,
      editorOutput: editorOutput.data,
    }), modelGateway);

    const finalDecision = approverOutput.data?.decisao || 'revision_requested';
    await completeRunAndRequest(db, run.id, requestId, finalDecision);

    const steps = await listRunSteps(db, run.id);
    return { run: { ...run, status: 'completed', execution_metadata: calculateAgencyRunExecutionSummary(steps) }, steps, finalDecision };
  } catch (error) {
    await failRun(db, run.id, requestId, error);
    throw error;
  }
}

export async function regenerateAgencyStep(
  db,
  runId,
  agentId,
  modelGateway = getAgencyModelGateway(),
  { confirmApproved = false } = {}
) {
  assertKnownAgent(agentId);
  const { run, request, steps } = await loadRunContext(db, runId);
  assertCanMutateRequest(request, confirmApproved);

  const currentByAgent = getCurrentStepMap(steps);
  const accountStep = currentByAgent.get('account_director');
  if (!accountStep) throw new Error('Run sem step de account_director.');
  const { brandKernel, agencyRequest } = accountStep.input || {};

  if (agentId !== 'account_director') {
    await assertBriefingApproved(db, request.id);
  }

  const output = await createVersionedStep(db, {
    run,
    request,
    steps,
    agentId,
    brandKernel,
    agencyRequest,
    modelGateway,
  });

  return {
    run: await markRunPartial(db, run.id),
    step: output.step,
    output: output.output,
    invalidatedAgents: downstreamAgents(agentId),
  };
}

export async function regenerateFromAgencyStep(
  db,
  runId,
  agentId,
  modelGateway = getAgencyModelGateway(),
  { confirmApproved = false } = {}
) {
  assertKnownAgent(agentId);
  const first = await regenerateAgencyStep(db, runId, agentId, modelGateway, { confirmApproved });
  if (agentId === 'account_director') return { ...first, steps: await listRunSteps(db, runId) };

  const generated = [first.step];
  const startIndex = AGENCY_AGENT_ORDER.indexOf(agentId);
  for (const nextAgentId of AGENCY_AGENT_ORDER.slice(startIndex + 1)) {
    const { run, request, steps } = await loadRunContext(db, runId);
    const currentByAgent = getCurrentStepMap(steps);
    const accountStep = currentByAgent.get('account_director');
    const { brandKernel, agencyRequest } = accountStep.input || {};
    const result = await createVersionedStep(db, {
      run,
      request,
      steps,
      agentId: nextAgentId,
      brandKernel,
      agencyRequest,
      modelGateway,
      skipDownstreamInvalidation: true,
    });
    generated.push(result.step);
  }

  const latestSteps = await listRunSteps(db, runId);
  const approverStep = getCurrentStepMap(latestSteps).get('approver');
  const finalDecision = approverStep?.output?.data?.decisao || 'revision_requested';
  await completeRunAndRequest(db, runId, first.run.request_id || first.run.requestId, finalDecision);

  return { run: await getRun(db, runId), steps: latestSteps, generatedSteps: generated, finalDecision };
}

export async function createAgencyRunVariation(db, runId, label) {
  const { run, request, steps } = await loadRunContext(db, runId);
  const currentByAgent = getCurrentStepMap(steps);
  const accountStep = currentByAgent.get('account_director');
  if (!accountStep) throw new Error('Run original sem briefing operacional para variar.');

  const { data: variation, error } = await db
    .from('agency_runs')
    .insert({
      request_id: run.request_id,
      brand_id: run.brand_id,
      brand_memory_version_id: run.brand_memory_version_id || null,
      brand_kernel_snapshot: run.brand_kernel_snapshot || null,
      brand_kernel_version: run.brand_kernel_version || '2.0',
      parent_run_id: run.parent_run_id || run.id,
      branch_label: label || makeVariationLabel(run),
      status: 'pending',
    })
    .select('*')
    .single();
  if (error) throw error;

  const briefing = request.approved_briefing_json || accountStep.output?.data || accountStep.output;
  const { data: step, error: stepError } = await db
    .from('agency_steps')
    .insert({
      run_id: variation.id,
      agent_id: 'account_director',
      input: accountStep.input || {},
      output: briefing ? {
        agentId: 'account_director',
        data: briefing,
        warnings: ['Briefing copiado da run original para variação.'],
      } : accountStep.output,
      status: briefing ? 'completed' : 'pending',
      version_number: 1,
      is_current: true,
      parent_step_id: accountStep.id,
    })
    .select('*')
    .single();
  if (stepError) throw stepError;

  return { run: variation, step };
}

export function getCurrentStepMap(steps = []) {
  const byAgent = new Map();
  for (const step of [...steps].sort(compareStepsForCurrent)) {
    if (step.is_current === false) continue;
    byAgent.set(step.agent_id, step);
  }
  return byAgent;
}

export function downstreamAgents(agentId) {
  const index = AGENCY_AGENT_ORDER.indexOf(agentId);
  if (index < 0) return [];
  return AGENCY_AGENT_ORDER.slice(index + 1);
}

async function createVersionedStep(db, {
  run,
  request,
  steps,
  agentId,
  brandKernel,
  agencyRequest,
  modelGateway,
  skipDownstreamInvalidation = false,
}) {
  const currentByAgent = getCurrentStepMap(steps);
  const previous = currentByAgent.get(agentId) || latestStepForAgent(steps, agentId);
  const input = await buildVersionedStepInput(db, {
    run,
    request,
    steps,
    agentId,
    brandKernel,
    agencyRequest,
  });
  const nextVersion = Math.max(0, ...steps.filter((step) => step.agent_id === agentId).map((step) => Number(step.version_number || 1))) + 1;

  const { data: step, error } = await db
    .from('agency_steps')
    .insert({
      run_id: run.id,
      agent_id: agentId,
      input,
      status: 'pending',
      prompt_version: input?.promptPack?.promptVersion || null,
      attempt_count: 0,
      parent_step_id: previous?.id || null,
      version_number: nextVersion,
      is_current: true,
    })
    .select('*')
    .single();
  if (error) throw error;

  if (previous) {
    await db
      .from('agency_steps')
      .update({ is_current: false, status: 'regenerated', superseded_by_step_id: step.id })
      .eq('id', previous.id);
  }

  if (!skipDownstreamInvalidation) {
    await invalidateDownstreamSteps(db, steps, agentId, step.id);
  }

  const output = await completeStep(db, step, modelGateway);

  if (agentId === 'account_director') {
    await db
      .from('agency_requests')
      .update({
        status: 'briefing_generated',
        briefing_original_json: output.data,
        approved_briefing_json: null,
        briefing_source: null,
        briefing_approved_at: null,
        briefing_approved_by: null,
      })
      .eq('id', request.id);
  } else if (agentId === 'approver') {
    const finalDecision = output.data?.decisao || 'revision_requested';
    await completeRunAndRequest(db, run.id, request.id, finalDecision);
  } else {
    await db.from('agency_requests').update({ status: 'generation_pending' }).eq('id', request.id);
  }

  return { step: { ...step, output, status: 'completed' }, output };
}

async function buildVersionedStepInput(db, {
  run,
  request,
  steps,
  agentId,
  brandKernel,
  agencyRequest,
}) {
  const currentByAgent = getCurrentStepMap(steps);
  const { approvedBriefing } = agentId === 'account_director'
    ? { approvedBriefing: null }
    : await assertBriefingApproved(db, request.id);

  if (agentId === 'account_director') {
    const existing = currentByAgent.get('account_director');
    return existing?.input || {
      brandKernel,
      agencyRequest,
      promptPack: {},
    };
  }

  if (agentId === 'copywriter') {
    return buildStepInput({ agentId, brandKernel, agencyRequest, accountDirectorOutput: approvedBriefing });
  }

  if (agentId === 'visual_director') {
    return buildStepInput({ agentId, brandKernel, agencyRequest, accountDirectorOutput: approvedBriefing });
  }

  const copywriterOutput = getRequiredStepOutput(currentByAgent, 'copywriter');
  const visualDirectorOutput = getRequiredStepOutput(currentByAgent, 'visual_director');

  if (agentId === 'editor') {
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput,
      visualDirectorOutput,
    });
  }

  if (agentId === 'approver') {
    const editorOutput = getRequiredStepOutput(currentByAgent, 'editor');
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput,
      visualDirectorOutput,
      editorOutput,
    });
  }

  throw new Error(`Agente inválido para Agência: ${agentId}`);
}

function buildStepInput({
  agentId,
  brandKernel,
  agencyRequest,
  accountDirectorOutput,
  copywriterOutput,
  visualDirectorOutput,
  editorOutput,
}) {
  if (agentId === 'copywriter') {
    const promptPack = buildCopywriterPromptPack({ brandKernel, agencyRequest, accountDirectorOutput });
    return { brandKernel, agencyRequest, accountDirectorOutput, promptPack };
  }

  if (agentId === 'visual_director') {
    const promptPack = buildVisualDirectorPromptPack({ brandKernel, agencyRequest, accountDirectorOutput });
    return { brandKernel, agencyRequest, accountDirectorOutput, promptPack };
  }

  if (agentId === 'editor') {
    const promptPack = buildEditorPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      visualDirectorOutput,
    });
    return { brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput, visualDirectorOutput, promptPack };
  }

  if (agentId === 'approver') {
    const promptPack = buildApproverPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      visualDirectorOutput,
      editorOutput,
    });
    return {
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      visualDirectorOutput,
      editorOutput,
      promptPack,
    };
  }

  throw new Error(`Agente inválido para montar input: ${agentId}`);
}

async function ensureApprovedAccountStep(db, accountStep, approvedBriefing) {
  if (accountStep.status === 'completed' && accountStep.output) return;

  await db
    .from('agency_steps')
    .update({
      output: {
        agentId: 'account_director',
        data: approvedBriefing,
        warnings: ['Briefing aprovado manualmente antes da geração criativa.'],
      },
      status: 'completed',
      is_current: true,
      version_number: accountStep.version_number || 1,
    })
    .eq('id', accountStep.id);
}

async function getOrPrepareRun(db, requestId) {
  const { data: existingRuns, error } = await db
    .from('agency_runs')
    .select('*, agency_steps(*)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  const existing = existingRuns?.[0];
  const steps = existing?.agency_steps || await (existing ? listRunSteps(db, existing.id) : Promise.resolve([]));
  const accountStep = getCurrentStepMap(steps).get('account_director');
  if (existing && accountStep && ['pending', 'running', 'partial', 'completed'].includes(existing.status)) {
    return { run: existing, step: accountStep };
  }

  return prepareAgencyRun(db, requestId);
}

async function createAndCompleteStep(db, runId, agentId, input, modelGateway) {
  const steps = await listRunSteps(db, runId);
  const existing = getCurrentStepMap(steps).get(agentId);
  if (existing) return completeStep(db, existing, modelGateway);

  const { data: step, error } = await db
    .from('agency_steps')
    .insert({
      run_id: runId,
      agent_id: agentId,
      input,
      status: 'pending',
      prompt_version: input?.promptPack?.promptVersion || null,
      attempt_count: 0,
      version_number: 1,
      is_current: true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return completeStep(db, step, modelGateway);
}

async function completeStep(db, step, modelGateway) {
  if (step.status === 'completed' && step.output) return step.output;

  const attemptCount = Number(step.attempt_count || 0) + 1;
  const startedAt = Date.now();
  await db.from('agency_steps').update({ status: 'running', attempt_count: attemptCount }).eq('id', step.id);
  try {
    const output = await modelGateway.generateStructuredOutput({
      agentId: step.agent_id,
      promptPack: step.input?.promptPack,
    });
    const executionUpdate = buildStepUpdateFromExecution({
      output,
      promptPack: step.input?.promptPack,
      durationMs: Date.now() - startedAt,
      attemptCount,
    });
    const { data, error } = await db
      .from('agency_steps')
      .update({
        output,
        status: 'completed',
        is_current: true,
        ...executionUpdate,
      })
      .eq('id', step.id)
      .select('*')
      .single();
    if (error) throw error;
    await updateRunExecutionMetadata(db, step.run_id);
    return data.output;
  } catch (error) {
    const executionUpdate = buildStepUpdateFromExecution({
      output: {
        model: step.model_used || 'unknown',
        provider: step.provider,
        promptVersion: step.input?.promptPack?.promptVersion || step.prompt_version,
        tokens: step.tokens || { input: 0, output: 0, total: 0 },
        estimatedCost: step.cost_estimate || 0,
      },
      promptPack: step.input?.promptPack,
      durationMs: Date.now() - startedAt,
      attemptCount,
      error,
    });
    await db.from('agency_steps').update({
      status: 'failed',
      error: error.message,
      ...executionUpdate,
    }).eq('id', step.id);
    await updateRunExecutionMetadata(db, step.run_id);
    throw error;
  }
}

async function invalidateDownstreamSteps(db, steps, agentId, invalidatedByStepId) {
  const downstream = new Set(downstreamAgents(agentId));
  const updates = steps
    .filter((step) => step.is_current !== false && downstream.has(step.agent_id))
    .map((step) => db
      .from('agency_steps')
      .update({ is_current: false, status: 'skipped', invalidated_by_step_id: invalidatedByStepId })
      .eq('id', step.id));
  await Promise.all(updates);
}

async function loadRunContext(db, runId) {
  const run = await getRun(db, runId);
  const { data: request, error: requestError } = await db
    .from('agency_requests')
    .select('*')
    .eq('id', run.request_id)
    .maybeSingle();
  if (requestError) throw requestError;
  if (!request) throw new Error('Pedido da run não encontrado.');

  const steps = await listRunSteps(db, run.id);
  return { run, request, steps };
}

async function getRun(db, runId) {
  const { data: run, error } = await db
    .from('agency_runs')
    .select('*')
    .eq('id', runId)
    .maybeSingle();
  if (error) throw error;
  if (!run) throw new Error('Run não encontrada.');
  return run;
}

async function listRunSteps(db, runId) {
  const { data: steps, error } = await db
    .from('agency_steps')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return steps || [];
}

async function completeRunAndRequest(db, runId, requestId, finalDecision) {
  const steps = await listRunSteps(db, runId);
  const executionMetadata = calculateAgencyRunExecutionSummary(steps);
  await Promise.all([
    db
      .from('agency_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString(), execution_metadata: executionMetadata })
      .eq('id', runId),
    db
      .from('agency_requests')
      .update({ status: finalDecision === 'approved' ? 'approved' : finalDecision })
      .eq('id', requestId),
  ]);
}

async function markRunPartial(db, runId) {
  const steps = await listRunSteps(db, runId);
  const executionMetadata = calculateAgencyRunExecutionSummary(steps);
  const { data, error } = await db
    .from('agency_runs')
    .update({ status: 'partial', completed_at: null, execution_metadata: executionMetadata })
    .eq('id', runId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function failRun(db, runId, requestId, error) {
  const steps = await listRunSteps(db, runId);
  const executionMetadata = calculateAgencyRunExecutionSummary(steps);
  await Promise.all([
    db
      .from('agency_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: error.message,
        execution_metadata: executionMetadata,
      })
      .eq('id', runId),
    db
      .from('agency_requests')
      .update({ status: 'revision_requested' })
      .eq('id', requestId),
  ]);
}

function assertKnownAgent(agentId) {
  if (!AGENCY_AGENT_ORDER.includes(agentId)) {
    throw new Error(`Agente inválido para Agência: ${agentId}`);
  }
}

function assertCanMutateRequest(request, confirmApproved) {
  if (request.status === 'approved' && !confirmApproved) {
    const err = new Error('Pedido aprovado exige confirmação explícita antes de regenerar.');
    err.statusCode = 409;
    throw err;
  }
}

function latestStepForAgent(steps, agentId) {
  return [...steps]
    .filter((step) => step.agent_id === agentId)
    .sort(compareStepsForCurrent)
    .at(-1) || null;
}

function getRequiredStepOutput(currentByAgent, agentId) {
  const step = currentByAgent.get(agentId);
  const data = step?.output?.data || step?.output;
  if (!data) throw new Error(`Step ${agentId} precisa estar concluído antes desta etapa.`);
  return data;
}

function compareStepsForCurrent(a, b) {
  const av = Number(a.version_number || 1);
  const bv = Number(b.version_number || 1);
  if (av !== bv) return av - bv;
  return String(a.created_at || '').localeCompare(String(b.created_at || ''));
}

function makeVariationLabel(run) {
  const base = run.branch_label ? `${run.branch_label} · variação` : 'Variação';
  return `${base} ${new Date().toLocaleString('pt-BR')}`;
}

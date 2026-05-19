import {
  buildApproverPromptPack,
  buildBrandCompliancePromptPack,
  buildChannelAdapterPromptPack,
  buildCopywriterPromptPack,
  buildEditorPromptPack,
  buildVisualDirectorPromptPack,
} from '../../../../packages/agents/src/prompt-packs.ts';
import {
  buildAgencyExecutionPlan,
  DEFAULT_AGENCY_AGENT_SEQUENCE,
  getAgencyExecutionProfile,
  selectAgencyExecutionProfile,
} from '../../../../packages/agents/src/execution-profiles.ts';
import {
  normalizeModelSelection,
  resolveModelForAgencyStep,
  validateModelSelection,
} from '../../../../packages/agents/src/model-registry.ts';
import { getAgencyModelGateway, MockModelGateway } from './modelGateway.js';
import { prepareAgencyRun } from './prepareRun.js';
import { assertBriefingApproved } from './briefingApproval.js';
import {
  buildStepUpdateFromExecution,
  buildOutputQualityAssessment,
  calculateAgencyRunExecutionSummary,
  updateRunExecutionMetadata,
} from './executionMetadata.js';
import { createAgencySignalsFromStep } from './agencySignals.js';

export const AGENCY_AGENT_ORDER = [
  ...DEFAULT_AGENCY_AGENT_SEQUENCE,
];

export async function runAgencyWorkflow(db, requestId, modelGateway = getAgencyModelGateway(), { modelSelection } = {}) {
  const prepared = await getOrPrepareRun(db, requestId);
  const run = prepared.run;
  const accountStep = prepared.step;
  const { brandKernel, agencyRequest } = accountStep.input;
  const { approvedBriefing } = await assertBriefingApproved(db, requestId);
  const executionPlan = await ensureRunExecutionPlan(db, run, agencyRequest, brandKernel, approvedBriefing);
  const agentSequence = getRunAgentSequence({ ...run, execution_plan_json: executionPlan });
  const resolvedModelSelection = await saveRunModelSelection(db, run.id, modelSelection || run.model_selection_json);

  try {
    await db.from('agency_runs').update({
      status: 'running',
      started_at: new Date().toISOString(),
      execution_mode: resolvedModelSelection.execution_mode,
      model_selection_json: resolvedModelSelection,
      max_tokens_per_step: resolvedModelSelection.max_tokens_per_step || null,
      max_estimated_cost_per_run: resolvedModelSelection.max_estimated_cost_per_run || null,
    }).eq('id', run.id);
    await db.from('agency_requests').update({ status: 'generation_running' }).eq('id', requestId);

    await ensureApprovedAccountStep(db, accountStep, approvedBriefing);

    const outputsByAgent = new Map([['account_director', approvedBriefing]]);
    let approverOutput = null;
    for (const agentId of agentSequence.filter((item) => item !== 'account_director')) {
      if (agentId === 'approver') {
        await db.from('agency_requests').update({ status: 'approval_pending' }).eq('id', requestId);
      }
      const output = await createAndCompleteStep(db, run.id, agentId, buildStepInput({
        agentId,
        brandKernel,
        agencyRequest,
        accountDirectorOutput: approvedBriefing,
        copywriterOutput: outputsByAgent.get('copywriter'),
        channelAdapterOutput: outputsByAgent.get('channel_adapter'),
        visualDirectorOutput: outputsByAgent.get('visual_director'),
        editorOutput: outputsByAgent.get('editor'),
        brandComplianceOutput: outputsByAgent.get('brand_compliance'),
        approvedBriefing,
      }), modelGateway, {
        run: { ...run, execution_plan_json: executionPlan, model_selection_json: resolvedModelSelection },
        request: agencyRequest,
        modelSelection: resolvedModelSelection,
      });
      outputsByAgent.set(agentId, output.data);
      if (agentId === 'approver') approverOutput = output;
    }

    const finalDecision = approverOutput?.data?.decisao || 'revision_requested';
    await completeRunAndRequest(db, run.id, requestId, finalDecision);

    const steps = await listRunSteps(db, run.id);
    return {
      run: {
        ...run,
        execution_profile_id: executionPlan.profile_id,
        execution_plan_json: executionPlan,
        status: 'completed',
        execution_metadata: calculateAgencyRunExecutionSummary(steps),
      },
      steps,
      finalDecision,
    };
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
  { confirmApproved = false, modelSelection } = {}
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
    modelSelection: await saveRunModelSelection(db, run.id, modelSelection || run.model_selection_json),
  });

  return {
    run: await markRunPartial(db, run.id),
    step: output.step,
    output: output.output,
    invalidatedAgents: downstreamAgents(agentId, getRunAgentSequence(run)),
  };
}

export async function regenerateFromAgencyStep(
  db,
  runId,
  agentId,
  modelGateway = getAgencyModelGateway(),
  { confirmApproved = false, modelSelection } = {}
) {
  assertKnownAgent(agentId);
  const first = await regenerateAgencyStep(db, runId, agentId, modelGateway, { confirmApproved, modelSelection });
  if (agentId === 'account_director') return { ...first, steps: await listRunSteps(db, runId) };

  const generated = [first.step];
  const sequence = getRunAgentSequence(first.run);
  const startIndex = sequence.indexOf(agentId);
  for (const nextAgentId of sequence.slice(startIndex + 1)) {
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
      modelSelection: normalizeModelSelection(modelSelection || run.model_selection_json, process.env.NODE_ENV),
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
      execution_profile_id: run.execution_profile_id || null,
      execution_plan_json: run.execution_plan_json || null,
      execution_mode: run.execution_mode || null,
      model_selection_json: run.model_selection_json || null,
      max_tokens_per_step: run.max_tokens_per_step || null,
      max_estimated_cost_per_run: run.max_estimated_cost_per_run || null,
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
      technical_status: briefing ? 'completed' : 'pending',
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

export function downstreamAgents(agentId, sequence = AGENCY_AGENT_ORDER) {
  const index = sequence.indexOf(agentId);
  if (index < 0) return [];
  return sequence.slice(index + 1);
}

async function createVersionedStep(db, {
  run,
  request,
  steps,
  agentId,
  brandKernel,
  agencyRequest,
  modelGateway,
  modelSelection,
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
      technical_status: 'pending',
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
      .update({ is_current: false, status: 'regenerated', technical_status: 'skipped', superseded_by_step_id: step.id })
      .eq('id', previous.id);
  }

  if (!skipDownstreamInvalidation) {
    await invalidateDownstreamSteps(db, steps, agentId, step.id, getRunAgentSequence(run));
  }

  const output = await completeStep(db, step, modelGateway, { run, request, modelSelection });

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
  const agentSequence = getRunAgentSequence(run);
  const legacyWithoutPlan = isLegacyRunWithoutExecutionPlan(run);
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

  const copywriterOutput = getRequiredStepOutput(currentByAgent, 'copywriter');

  if (agentId === 'channel_adapter') {
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput,
      approvedBriefing,
    });
  }

  const channelAdapterOutput = agentSequence.includes('channel_adapter') && !legacyWithoutPlan
    ? getRequiredStepOutput(currentByAgent, 'channel_adapter')
    : getOptionalStepOutput(currentByAgent, 'channel_adapter');

  if (agentId === 'visual_director') {
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      channelAdapterOutput,
    });
  }

  const visualDirectorOutput = agentSequence.includes('visual_director') && !legacyWithoutPlan
    ? getRequiredStepOutput(currentByAgent, 'visual_director')
    : getOptionalStepOutput(currentByAgent, 'visual_director');

  if (agentId === 'editor') {
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
    });
  }

  const editorOutput = getRequiredStepOutput(currentByAgent, 'editor');

  if (agentId === 'brand_compliance') {
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
      approvedBriefing,
    });
  }

  if (agentId === 'approver') {
    const brandComplianceOutput = agentSequence.includes('brand_compliance') && !legacyWithoutPlan
      ? getRequiredStepOutput(currentByAgent, 'brand_compliance')
      : getOptionalStepOutput(currentByAgent, 'brand_compliance');
    return buildStepInput({
      agentId,
      brandKernel,
      agencyRequest,
      accountDirectorOutput: approvedBriefing,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
      brandComplianceOutput,
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
  channelAdapterOutput,
  visualDirectorOutput,
  editorOutput,
  brandComplianceOutput,
  approvedBriefing,
}) {
  if (agentId === 'copywriter') {
    const promptPack = buildCopywriterPromptPack({ brandKernel, agencyRequest, accountDirectorOutput });
    return { brandKernel, agencyRequest, accountDirectorOutput, promptPack };
  }

  if (agentId === 'visual_director') {
    const promptPack = buildVisualDirectorPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      channelAdapterOutput,
    });
    return { brandKernel, agencyRequest, accountDirectorOutput, channelAdapterOutput, promptPack };
  }

  if (agentId === 'channel_adapter') {
    const promptPack = buildChannelAdapterPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      approvedBriefing,
    });
    return { brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput, approvedBriefing, promptPack };
  }

  if (agentId === 'editor') {
    const promptPack = buildEditorPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
    });
    return { brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput, channelAdapterOutput, visualDirectorOutput, promptPack };
  }

  if (agentId === 'approver') {
    const promptPack = buildApproverPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
      brandComplianceOutput,
    });
    return {
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
      brandComplianceOutput,
      promptPack,
    };
  }

  if (agentId === 'brand_compliance') {
    const promptPack = buildBrandCompliancePromptPack({
      brandKernel,
      agencyRequest,
      approvedBriefing,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
    });
    return {
      brandKernel,
      agencyRequest,
      approvedBriefing,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
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
      technical_status: 'completed',
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

async function saveRunModelSelection(db, runId, selection) {
  const normalized = normalizeModelSelection(selection, process.env.NODE_ENV);
  const errors = validateModelSelection(normalized);
  if (errors.length) {
    const err = new Error(errors.join(' '));
    err.statusCode = 400;
    throw err;
  }

  await db
    .from('agency_runs')
    .update({
      execution_mode: normalized.execution_mode,
      model_selection_json: normalized,
      max_tokens_per_step: normalized.max_tokens_per_step || null,
      max_estimated_cost_per_run: normalized.max_estimated_cost_per_run || null,
    })
    .eq('id', runId);

  return normalized;
}

async function ensureRunExecutionPlan(db, run, agencyRequest, brandKernel, approvedBriefing) {
  if (run.execution_plan_json?.agent_sequence?.length) return run.execution_plan_json;

  if (!run.execution_profile_id) {
    return {
      profile_id: 'custom',
      request_id: agencyRequest.id || run.request_id || '',
      brand_id: agencyRequest.brandId || run.brand_id || '',
      agent_sequence: DEFAULT_AGENCY_AGENT_SEQUENCE,
      skipped_agents: [],
      required_gates: ['briefing_approval', 'brand_compliance_before_approver', 'human_approval_before_publication'],
      rationale: 'Run legada sem execution_profile_id; usando sequência completa histórica para compatibilidade.',
      created_at: run.created_at || new Date().toISOString(),
    };
  }

  const selectedProfile = getAgencyExecutionProfile(run.execution_profile_id)
    || selectAgencyExecutionProfile({ agencyRequest });
  const executionPlan = buildAgencyExecutionPlan({
    agencyRequest,
    brandKernel,
    selectedProfile,
    approvedBriefing,
  });

  await db
    .from('agency_runs')
    .update({
      execution_profile_id: executionPlan.profile_id,
      execution_plan_json: executionPlan,
    })
    .eq('id', run.id);

  return executionPlan;
}

async function assertCostLimits(db, runId, modelSelection, executionUpdate) {
  const maxTokens = Number(modelSelection?.max_tokens_per_step || 0);
  const stepTokens = Number(executionUpdate?.tokens?.total || 0);
  if (maxTokens > 0 && stepTokens > maxTokens) {
    const err = new Error(`Step excedeu o limite de tokens (${stepTokens}/${maxTokens}).`);
    err.statusCode = 400;
    throw err;
  }

  const maxCost = Number(modelSelection?.max_estimated_cost_per_run || 0);
  if (maxCost <= 0) return;

  const steps = await listRunSteps(db, runId);
  const currentCost = calculateAgencyRunExecutionSummary(steps).estimated_cost_total || 0;
  const nextCost = currentCost + Number(executionUpdate?.cost_estimate || 0);
  if (nextCost > maxCost) {
    const err = new Error(`Run excederia o limite de custo estimado (${formatCost(nextCost)}/${formatCost(maxCost)}).`);
    err.statusCode = 400;
    throw err;
  }
}

function formatCost(value) {
  return `US$ ${Number(value || 0).toFixed(4)}`;
}

function getRunAgentSequence(run = {}) {
  const sequence = run.execution_plan_json?.agent_sequence;
  return Array.isArray(sequence) && sequence.length ? sequence : DEFAULT_AGENCY_AGENT_SEQUENCE;
}

function isLegacyRunWithoutExecutionPlan(run = {}) {
  return !run.execution_profile_id && !run.execution_plan_json?.agent_sequence?.length;
}

async function createAndCompleteStep(db, runId, agentId, input, modelGateway, context = {}) {
  const steps = await listRunSteps(db, runId);
  const existing = getCurrentStepMap(steps).get(agentId);
  if (existing) return completeStep(db, existing, modelGateway, context);

  const { data: step, error } = await db
    .from('agency_steps')
    .insert({
      run_id: runId,
      agent_id: agentId,
      input,
      status: 'pending',
      technical_status: 'pending',
      prompt_version: input?.promptPack?.promptVersion || null,
      attempt_count: 0,
      version_number: 1,
      is_current: true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return completeStep(db, step, modelGateway, context);
}

async function completeStep(db, step, modelGateway, context = {}) {
  if (step.status === 'completed' && step.output) return step.output;

  const attemptCount = Number(step.attempt_count || 0) + 1;
  const startedAt = Date.now();
  const modelSelection = normalizeModelSelection(
    context.modelSelection || context.run?.model_selection_json,
    process.env.NODE_ENV
  );
  const model = resolveModelForAgencyStep({
    agentId: step.agent_id,
    modelSelection,
  });
  const isMock = model.provider === 'mock' || model.model_id === 'mock-model';
  const explicitMockGateway = process.env.AGENCY_MODEL_GATEWAY === 'mock';
  const stepGateway = isMock
    ? new MockModelGateway()
    : modelGateway instanceof MockModelGateway && !explicitMockGateway
      ? getAgencyModelGateway({ forceReal: true })
      : modelGateway;

  await db.from('agency_steps').update({
    status: 'running',
    technical_status: 'running',
    attempt_count: attemptCount,
    provider: model.provider,
    model_id: model.model_id,
    model_used: model.display_name || model.model_id,
    is_mock: isMock,
  }).eq('id', step.id);
  try {
    const output = await stepGateway.generateStructuredOutput({
      agentId: step.agent_id,
      promptPack: step.input?.promptPack,
      provider: model.provider,
      modelId: model.model_id,
      systemPrompt: step.input?.promptPack?.systemPrompt,
      userPrompt: step.input?.promptPack?.userPrompt,
      schema: step.input?.promptPack?.expectedOutputSchema,
      temperature: isMock ? 0 : Number(process.env.AGENCY_MODEL_TEMPERATURE || 0.2),
      maxTokens: modelSelection.max_tokens_per_step,
      metadata: {
        executionMode: modelSelection.execution_mode,
        agentId: step.agent_id,
        runId: step.run_id,
      },
    });
    const normalizedOutput = {
      ...output,
      provider: output?.provider || model.provider,
      model: output?.model || model.display_name || model.model_id,
      modelId: output?.modelId || output?.model_id || model.model_id,
      isMock: output?.isMock ?? output?.is_mock ?? isMock,
    };
    const executionUpdate = buildStepUpdateFromExecution({
      output: normalizedOutput,
      promptPack: step.input?.promptPack,
      durationMs: Date.now() - startedAt,
      attemptCount,
    });
    await assertCostLimits(db, step.run_id, modelSelection, executionUpdate);

    const qualityAssessment = buildOutputQualityAssessment({ agentId: step.agent_id, output: normalizedOutput });
    const outputData = normalizedOutput?.data && typeof normalizedOutput.data === 'object' && !Array.isArray(normalizedOutput.data) ? normalizedOutput.data : {};
    const outputWithAssessment = qualityAssessment
      ? { ...normalizedOutput, qualityAssessment, data: { ...outputData, quality_assessment: outputData.quality_assessment || qualityAssessment } }
      : normalizedOutput;
    const { data, error } = await db
      .from('agency_steps')
      .update({
        output: outputWithAssessment,
        status: 'completed',
        technical_status: 'completed',
        quality_assessment: qualityAssessment,
        is_current: true,
        ...executionUpdate,
      })
      .eq('id', step.id)
      .select('*')
      .single();
    if (error) throw error;
    try {
      await createAgencySignalsFromStep(db, {
        run: context.run,
        request: context.request,
        step: data,
        output: outputWithAssessment,
        qualityAssessment,
      });
    } catch (signalError) {
      console.warn('[agency/signals] Falha ao registrar sinais da Agência:', signalError.message);
    }
    await updateRunExecutionMetadata(db, step.run_id);
    return data.output;
  } catch (error) {
    const executionUpdate = buildStepUpdateFromExecution({
      output: {
        model: step.model_used || model.display_name || model.model_id || 'unknown',
        modelId: step.model_id || model.model_id,
        provider: step.provider || model.provider,
        isMock,
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
      technical_status: 'failed',
      error: error.message,
      ...executionUpdate,
    }).eq('id', step.id);
    await updateRunExecutionMetadata(db, step.run_id);
    throw error;
  }
}

async function invalidateDownstreamSteps(db, steps, agentId, invalidatedByStepId, sequence = AGENCY_AGENT_ORDER) {
  const downstream = new Set(downstreamAgents(agentId, sequence));
  const updates = steps
    .filter((step) => step.is_current !== false && downstream.has(step.agent_id))
    .map((step) => db
      .from('agency_steps')
      .update({ is_current: false, status: 'skipped', technical_status: 'skipped', invalidated_by_step_id: invalidatedByStepId })
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

function getOptionalStepOutput(currentByAgent, agentId) {
  const step = currentByAgent.get(agentId);
  return step?.output?.data || step?.output || undefined;
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

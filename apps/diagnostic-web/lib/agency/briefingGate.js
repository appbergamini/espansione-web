import { getAgencyModelGateway } from './modelGateway.js';
import { prepareAgencyRun } from './prepareRun.js';
import {
  getLatestAccountDirectorStep,
  getStepPayload,
  saveGeneratedBriefing,
} from './briefingApproval.js';
import {
  buildStepUpdateFromExecution,
  updateRunExecutionMetadata,
} from './executionMetadata.js';

export async function generateAccountDirectorBriefing(db, requestId, modelGateway = getAgencyModelGateway()) {
  const existingStep = await getReusableAccountStep(db, requestId);
  const prepared = existingStep
    ? { run: existingStep.run, step: existingStep }
    : await prepareAgencyRun(db, requestId);

  const step = prepared.step;
  const output = step.output
    ? getStepPayload(step)
    : await completeAccountDirectorStep(db, step, modelGateway);

  const request = await saveGeneratedBriefing(db, requestId, output);
  return {
    request,
    run: prepared.run,
    step: {
      ...step,
      output: step.output || { agentId: 'account_director', data: output },
      status: 'completed',
    },
    briefing: output,
  };
}

async function getReusableAccountStep(db, requestId) {
  const step = await getLatestAccountDirectorStep(db, requestId);
  if (!step) return null;
  if (step.status === 'completed' && step.output) return step;
  if (['pending', 'running'].includes(step.status)) return step;
  return null;
}

async function completeAccountDirectorStep(db, step, modelGateway) {
  const attemptCount = Number(step.attempt_count || 0) + 1;
  const startedAt = Date.now();
  await db.from('agency_steps').update({ status: 'running', attempt_count: attemptCount }).eq('id', step.id);

  try {
    const output = await modelGateway.generateStructuredOutput({
      agentId: 'account_director',
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
        ...executionUpdate,
      })
      .eq('id', step.id)
      .select('*')
      .single();

    if (error) throw error;
    await updateRunExecutionMetadata(db, step.run_id);
    return getStepPayload(data);
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
    await db.from('agency_steps').update({ status: 'failed', error: error.message, ...executionUpdate }).eq('id', step.id);
    await updateRunExecutionMetadata(db, step.run_id);
    throw error;
  }
}

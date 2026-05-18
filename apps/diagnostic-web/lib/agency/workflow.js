import {
  buildApproverPromptPack,
  buildCopywriterPromptPack,
  buildEditorPromptPack,
  buildVisualDirectorPromptPack,
} from '@espansione/agents';
import { MockModelGateway } from './modelGateway';
import { prepareAgencyRun } from './prepareRun';

export async function runAgencyWorkflow(db, requestId, modelGateway = new MockModelGateway()) {
  const prepared = await getOrPrepareRun(db, requestId);
  const run = prepared.run;
  const accountStep = prepared.step;
  const { brandKernel, agencyRequest } = accountStep.input;

  await db.from('agency_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', run.id);
  await db.from('agency_requests').update({ status: 'generation_pending' }).eq('id', requestId);

  const accountOutput = await completeStep(db, accountStep, modelGateway);

  const copyPromptPack = buildCopywriterPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput: accountOutput.data,
  });
  const copyOutput = await createAndCompleteStep(db, run.id, 'copywriter', { brandKernel, agencyRequest, accountDirectorOutput: accountOutput.data, promptPack: copyPromptPack }, modelGateway);

  const visualPromptPack = buildVisualDirectorPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput: accountOutput.data,
  });
  const visualOutput = await createAndCompleteStep(db, run.id, 'visual_director', { brandKernel, agencyRequest, accountDirectorOutput: accountOutput.data, promptPack: visualPromptPack }, modelGateway);

  const editorPromptPack = buildEditorPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput: accountOutput.data,
    copywriterOutput: copyOutput.data,
    visualDirectorOutput: visualOutput.data,
  });
  const editorOutput = await createAndCompleteStep(db, run.id, 'editor', {
    brandKernel,
    agencyRequest,
    accountDirectorOutput: accountOutput.data,
    copywriterOutput: copyOutput.data,
    visualDirectorOutput: visualOutput.data,
    promptPack: editorPromptPack,
  }, modelGateway);

  const approverPromptPack = buildApproverPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput: accountOutput.data,
    copywriterOutput: copyOutput.data,
    visualDirectorOutput: visualOutput.data,
    editorOutput: editorOutput.data,
  });
  const approverOutput = await createAndCompleteStep(db, run.id, 'approver', {
    brandKernel,
    agencyRequest,
    accountDirectorOutput: accountOutput.data,
    copywriterOutput: copyOutput.data,
    visualDirectorOutput: visualOutput.data,
    editorOutput: editorOutput.data,
    promptPack: approverPromptPack,
  }, modelGateway);

  const finalDecision = approverOutput.data?.decisao || 'revision_requested';
  await Promise.all([
    db
      .from('agency_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', run.id),
    db
      .from('agency_requests')
      .update({ status: finalDecision === 'approved' ? 'approved' : finalDecision })
      .eq('id', requestId),
  ]);

  const { data: steps } = await db
    .from('agency_steps')
    .select('*')
    .eq('run_id', run.id)
    .order('created_at', { ascending: true });

  return { run: { ...run, status: 'completed' }, steps: steps || [], finalDecision };
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
  const accountStep = existing?.agency_steps?.find?.((step) => step.agent_id === 'account_director');
  if (existing && accountStep) {
    return { run: existing, step: accountStep };
  }

  return prepareAgencyRun(db, requestId);
}

async function createAndCompleteStep(db, runId, agentId, input, modelGateway) {
  const { data: existingSteps, error: existingError } = await db
    .from('agency_steps')
    .select('*')
    .eq('run_id', runId)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingError) throw existingError;
  if (existingSteps?.[0]) {
    return completeStep(db, existingSteps[0], modelGateway);
  }

  const { data: step, error } = await db
    .from('agency_steps')
    .insert({ run_id: runId, agent_id: agentId, input, status: 'ready' })
    .select('*')
    .single();
  if (error) throw error;
  return completeStep(db, step, modelGateway);
}

async function completeStep(db, step, modelGateway) {
  if (step.status === 'completed' && step.output) return step.output;

  await db.from('agency_steps').update({ status: 'running' }).eq('id', step.id);
  try {
    const output = await modelGateway.generateStructuredOutput({
      agentId: step.agent_id,
      promptPack: step.input?.promptPack,
    });
    const { data, error } = await db
      .from('agency_steps')
      .update({
        output,
        status: 'completed',
        model_used: 'mock',
        tokens: { input: 0, output: 0, total: 0 },
      })
      .eq('id', step.id)
      .select('*')
      .single();
    if (error) throw error;
    return data.output;
  } catch (error) {
    await db.from('agency_steps').update({ status: 'failed', error: error.message }).eq('id', step.id);
    throw error;
  }
}

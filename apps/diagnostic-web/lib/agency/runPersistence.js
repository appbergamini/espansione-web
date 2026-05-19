export function assertActiveBrandMemoryVersion(brandMemoryVersion, readiness) {
  if (!brandMemoryVersion || brandMemoryVersion.status !== 'active') {
    const err = new Error('Nenhuma versão ativa válida da Brand Memory encontrada para esta marca');
    err.statusCode = 400;
    err.readiness = readiness;
    throw err;
  }
}

export async function createInitialAgencyRun(db, { request, brandKernel, brandMemoryVersion, executionPlan, modelSelection }) {
  assertActiveBrandMemoryVersion(brandMemoryVersion);

  const { data: run, error: runError } = await db
    .from('agency_runs')
    .insert({
      request_id: request.id,
      brand_id: request.brand_id,
      brand_memory_version_id: brandMemoryVersion.id,
      brand_kernel_snapshot: brandKernel,
      brand_kernel_version: brandKernel.source?.schemaVersion || '2.0',
      execution_profile_id: executionPlan?.profile_id || null,
      execution_plan_json: executionPlan || null,
      execution_mode: modelSelection?.execution_mode || null,
      model_selection_json: modelSelection || null,
      max_tokens_per_step: modelSelection?.max_tokens_per_step || null,
      max_estimated_cost_per_run: modelSelection?.max_estimated_cost_per_run || null,
      branch_label: 'Original',
      status: 'pending',
    })
    .select('*')
    .single();

  if (runError) throw runError;

  return run;
}

export async function createInitialAgencyStep(db, { run, stepInput }) {
  const { data: step, error: stepError } = await db
    .from('agency_steps')
    .insert({
      run_id: run.id,
      agent_id: 'account_director',
      input: stepInput,
      status: 'pending',
      technical_status: 'pending',
      prompt_version: stepInput?.promptPack?.promptVersion || 'account_director_v1',
      attempt_count: 0,
      version_number: 1,
      is_current: true,
    })
    .select('*')
    .single();

  if (stepError) throw stepError;

  return step;
}

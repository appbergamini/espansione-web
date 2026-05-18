export function buildStepExecutionMetadata({
  provider,
  model,
  promptVersion,
  tokens,
  estimatedCost,
  durationMs,
  attemptCount = 1,
  temperature,
  structuredOutput = true,
  error,
  traceId,
} = {}) {
  const normalizedTokens = normalizeTokens(tokens);
  return compactObject({
    provider,
    model,
    prompt_version: promptVersion,
    input_tokens: normalizedTokens.input,
    output_tokens: normalizedTokens.output,
    total_tokens: normalizedTokens.total,
    estimated_cost: normalizeNumber(estimatedCost),
    duration_ms: normalizeInteger(durationMs),
    attempt_count: normalizeInteger(attemptCount) || 1,
    temperature: normalizeNumber(temperature),
    structured_output: structuredOutput,
    error_code: error?.code || error?.name,
    error_message: error?.message || (typeof error === 'string' ? error : undefined),
    trace_id: traceId,
  });
}

export function buildStepUpdateFromExecution({
  output,
  promptPack,
  durationMs,
  attemptCount = 1,
  error,
} = {}) {
  const tokens = normalizeTokens(output?.tokens);
  const promptVersion = output?.promptVersion || output?.prompt_version || promptPack?.promptVersion;
  const provider = output?.provider || inferProvider(output?.model);
  const model = output?.model || 'unknown';
  const estimatedCost = output?.estimatedCost ?? output?.estimated_cost ?? output?.costEstimate ?? output?.cost_estimate ?? 0;
  const metadata = buildStepExecutionMetadata({
    provider,
    model,
    promptVersion,
    tokens,
    estimatedCost,
    durationMs,
    attemptCount,
    temperature: output?.temperature,
    structuredOutput: true,
    error,
    traceId: output?.traceId || output?.trace_id,
  });

  return {
    provider,
    model_used: model,
    prompt_version: promptVersion || null,
    tokens,
    cost_estimate: metadata.estimated_cost || 0,
    duration_ms: metadata.duration_ms || 0,
    attempt_count: metadata.attempt_count || attemptCount,
    execution_metadata: metadata,
  };
}

export function calculateAgencyRunExecutionSummary(steps = []) {
  const relevant = (steps || []).filter((step) => step && step.status !== 'skipped' && step.status !== 'regenerated');
  const completed = relevant.filter((step) => step.status === 'completed');
  const failed = relevant.filter((step) => step.status === 'failed');
  const totals = relevant.reduce((acc, step) => {
    const tokens = normalizeTokens(step.tokens || step.execution_metadata);
    acc.estimated_cost_total += normalizeNumber(step.cost_estimate ?? step.execution_metadata?.estimated_cost) || 0;
    acc.input_tokens_total += tokens.input;
    acc.output_tokens_total += tokens.output;
    acc.total_tokens += tokens.total;
    acc.duration_ms_total += normalizeInteger(step.duration_ms ?? step.execution_metadata?.duration_ms) || 0;
    return acc;
  }, {
    estimated_cost_total: 0,
    input_tokens_total: 0,
    output_tokens_total: 0,
    total_tokens: 0,
    duration_ms_total: 0,
  });

  return {
    total_steps: relevant.length,
    completed_steps: completed.length,
    failed_steps: failed.length,
    estimated_cost_total: roundMoney(totals.estimated_cost_total),
    input_tokens_total: totals.input_tokens_total,
    output_tokens_total: totals.output_tokens_total,
    total_tokens: totals.total_tokens,
    duration_ms_total: totals.duration_ms_total,
  };
}

export async function updateRunExecutionMetadata(db, runId) {
  const { data: steps, error: stepsError } = await db
    .from('agency_steps')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: true });
  if (stepsError) throw stepsError;

  const executionMetadata = calculateAgencyRunExecutionSummary(steps || []);
  const { data, error } = await db
    .from('agency_runs')
    .update({ execution_metadata: executionMetadata })
    .eq('id', runId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export function normalizeTokens(tokens = {}) {
  const input = normalizeInteger(tokens.input ?? tokens.input_tokens ?? tokens.tokensIn ?? tokens.tokens_in) || 0;
  const output = normalizeInteger(tokens.output ?? tokens.output_tokens ?? tokens.tokensOut ?? tokens.tokens_out) || 0;
  const total = normalizeInteger(tokens.total ?? tokens.total_tokens) || input + output;
  return { input, output, total };
}

function inferProvider(model = '') {
  const value = String(model || '').toLowerCase();
  if (value.includes('gemini')) return 'google';
  if (value.includes('gpt') || value.includes('openai')) return 'openai';
  if (value === 'mock') return 'mock';
  return undefined;
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== '')
  );
}

function normalizeInteger(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.round(numeric));
}

function normalizeNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return numeric;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 1_000_000) / 1_000_000;
}

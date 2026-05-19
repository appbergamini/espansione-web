export function buildStepExecutionMetadata({
  provider,
  model,
  modelId,
  isMock,
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
  const normalizedModelId = modelId || model;
  const normalizedIsMock = Boolean(isMock || provider === 'mock' || normalizedModelId === 'mock-model');
  return compactObject({
    provider,
    model,
    model_id: normalizedModelId,
    is_mock: normalizedIsMock,
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
  const modelId = output?.modelId || output?.model_id || output?.model || 'unknown';
  const provider = output?.provider || inferProvider(modelId);
  const model = output?.model || modelId || 'unknown';
  const isMock = Boolean(output?.isMock || output?.is_mock || provider === 'mock' || modelId === 'mock-model');
  const estimatedCost = output?.estimatedCost ?? output?.estimated_cost ?? output?.costEstimate ?? output?.cost_estimate ?? 0;
  const metadata = buildStepExecutionMetadata({
    provider,
    model,
    modelId,
    isMock,
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
    model_id: modelId,
    is_mock: isMock,
    prompt_version: promptVersion || null,
    tokens,
    cost_estimate: metadata.estimated_cost || 0,
    duration_ms: metadata.duration_ms || 0,
    attempt_count: metadata.attempt_count || attemptCount,
    execution_metadata: metadata,
    execution_metadata_json: metadata,
  };
}

export function calculateAgencyRunExecutionSummary(steps = []) {
  const relevant = (steps || []).filter((step) => {
    const technicalStatus = getTechnicalExecutionStatus(step);
    return step && technicalStatus !== 'skipped';
  });
  const completed = relevant.filter((step) => getTechnicalExecutionStatus(step) === 'completed');
  const failed = relevant.filter((step) => getTechnicalExecutionStatus(step) === 'failed');
  const totals = relevant.reduce((acc, step) => {
    const metadata = step.execution_metadata_json || step.execution_metadata || {};
    const tokens = normalizeTokens(step.tokens || metadata);
    acc.estimated_cost_total += normalizeNumber(step.cost_estimate ?? metadata.estimated_cost) || 0;
    acc.input_tokens_total += tokens.input;
    acc.output_tokens_total += tokens.output;
    acc.total_tokens += tokens.total;
    acc.duration_ms_total += normalizeInteger(step.duration_ms ?? metadata.duration_ms) || 0;
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

export function getTechnicalExecutionStatus(step = {}) {
  if (step.technical_status) return step.technical_status;
  if (step.technicalStatus) return step.technicalStatus;
  if (['pending', 'running', 'completed', 'failed', 'cancelled', 'skipped'].includes(step.status)) {
    return step.status;
  }
  if (step.status === 'regenerated') return 'skipped';
  return 'pending';
}

export function buildOutputQualityAssessment({ agentId, output, assessedAt = new Date().toISOString() } = {}) {
  const data = output?.data || output || {};
  const existing = data.quality_assessment || output?.qualityAssessment || output?.quality_assessment;
  if (existing?.quality_status) {
    return normalizeQualityAssessment(existing, assessedAt);
  }

  if (agentId === 'editor') {
    return assessEditorOutput(data, assessedAt);
  }

  if (agentId === 'brand_compliance') {
    return assessBrandComplianceOutput(data, assessedAt);
  }

  if (agentId === 'approver') {
    return assessApproverOutput(data, assessedAt);
  }

  return null;
}

export function normalizeQualityAssessment(input, assessedAt = new Date().toISOString()) {
  if (!input || typeof input !== 'object') return null;
  const status = normalizeQualityStatus(input.quality_status);
  return {
    quality_status: status,
    quality_score: normalizeScore(input.quality_score),
    quality_issues: normalizeStringArray(input.quality_issues),
    strategic_alignment_score: normalizeScore(input.strategic_alignment_score),
    voice_alignment_score: normalizeScore(input.voice_alignment_score),
    visual_alignment_score: normalizeScore(input.visual_alignment_score),
    evidence_risk_score: normalizeScore(input.evidence_risk_score),
    review_reason: firstString(input.review_reason),
    assessed_by: ['agent', 'human', 'system'].includes(input.assessed_by) ? input.assessed_by : 'system',
    assessed_at: firstString(input.assessed_at) || assessedAt,
  };
}

function assessEditorOutput(data, assessedAt) {
  const score = normalizeScore(data.score_aderencia);
  const issues = [
    ...normalizeStringArray(data.riscos_de_incoerencia),
    ...normalizeStringArray(data.warnings),
  ];
  const evidenceRisk = hasEvidenceRisk(issues) ? 80 : 20;
  const qualityStatus = evidenceRisk >= 70
    ? 'risky'
    : score !== undefined && score < 70
      ? 'needs_revision'
      : issues.length
        ? 'needs_revision'
        : 'acceptable';

  return {
    quality_status: qualityStatus,
    quality_score: score,
    quality_issues: issues,
    strategic_alignment_score: score,
    evidence_risk_score: evidenceRisk,
    review_reason: qualityStatus === 'acceptable'
      ? 'Editor não apontou riscos relevantes.'
      : 'Editor apontou riscos, lacunas ou aderência insuficiente.',
    assessed_by: 'system',
    assessed_at: assessedAt,
  };
}

function assessBrandComplianceOutput(data, assessedAt) {
  const decision = normalizeBrandComplianceDecision(data.decision);
  const checklist = Array.isArray(data.checklist) ? data.checklist : [];
  const violations = Array.isArray(data.violations) ? data.violations : [];
  const issues = [
    ...normalizeStringArray(data.required_adjustments),
    ...normalizeStringArray(data.warnings),
    ...checklist
      .filter((item) => ['warning', 'fail'].includes(String(item?.status || '').toLowerCase()))
      .map((item) => [
        item.criterion,
        item.observation,
        item.required_adjustment,
      ].filter(Boolean).join(': ')),
    ...violations.map((item) => [
      item.type,
      item.description,
      item.suggested_fix,
    ].filter(Boolean).join(': ')),
  ].filter(Boolean);
  const hasHighSeverity = violations.some((item) => item?.severity === 'high');
  const evidenceRisk = hasEvidenceRisk(issues) || checklist.some((item) => item?.criterion === 'claims' && item?.status !== 'pass')
    ? 85
    : 20;
  const qualityStatus = decision === 'pass'
    ? (evidenceRisk >= 70 ? 'risky' : 'acceptable')
    : decision === 'fail'
      ? (hasHighSeverity ? 'rejected' : 'risky')
      : evidenceRisk >= 70
        ? 'risky'
        : 'needs_revision';

  return {
    quality_status: qualityStatus,
    quality_score: normalizeScore(data.overall_brand_alignment_score),
    quality_issues: issues,
    strategic_alignment_score: scoreCriterion(checklist, 'strategy', data.overall_brand_alignment_score),
    voice_alignment_score: averageScores([
      scoreCriterion(checklist, 'voice'),
      scoreCriterion(checklist, 'forbidden_words'),
    ]),
    visual_alignment_score: scoreCriterion(checklist, 'visual_identity'),
    evidence_risk_score: evidenceRisk,
    review_reason: decision === 'pass'
      ? 'Brand compliance não encontrou violações relevantes.'
      : 'Brand compliance encontrou warnings, violações ou ajustes obrigatórios.',
    assessed_by: 'agent',
    assessed_at: assessedAt,
  };
}

function assessApproverOutput(data, assessedAt) {
  const decision = normalizeDecision(data.decisao || data.decision);
  const checklist = Array.isArray(data.checklist) ? data.checklist : [];
  const issues = [
    ...normalizeStringArray(data.ajustes_obrigatorios),
    ...normalizeStringArray(data.warnings),
    ...checklist
      .filter((item) => ['warning', 'fail'].includes(String(item?.status || '').toLowerCase()))
      .map((item) => [item.criterio, item.observacao].filter(Boolean).join(': ')),
  ].filter(Boolean);
  const evidenceRisk = hasEvidenceRisk([...issues, data.risco_principal, data.justificativa]) ? 85 : 20;
  const qualityStatus = decision === 'approved'
    ? (evidenceRisk >= 70 ? 'risky' : 'acceptable')
    : decision === 'rejected'
      ? 'rejected'
      : evidenceRisk >= 70
        ? 'risky'
        : 'needs_revision';

  return {
    quality_status: qualityStatus,
    quality_score: qualityStatus === 'acceptable' ? 90 : qualityStatus === 'needs_revision' ? 60 : qualityStatus === 'risky' ? 45 : 20,
    quality_issues: issues,
    evidence_risk_score: evidenceRisk,
    review_reason: data.justificativa || data.risco_principal || 'Avaliação final do aprovador.',
    assessed_by: 'agent',
    assessed_at: assessedAt,
  };
}

function normalizeQualityStatus(value) {
  return ['not_reviewed', 'acceptable', 'needs_revision', 'rejected', 'risky'].includes(value)
    ? value
    : 'not_reviewed';
}

function normalizeDecision(value) {
  if (value === 'approved' || value === 'rejected' || value === 'revision_requested') return value;
  return 'revision_requested';
}

function normalizeBrandComplianceDecision(value) {
  if (value === 'pass' || value === 'warning' || value === 'fail') return value;
  return 'warning';
}

function scoreCriterion(checklist = [], criterion, fallback) {
  const item = checklist.find((entry) => entry?.criterion === criterion);
  if (!item) return normalizeScore(fallback);
  if (item.status === 'pass') return 90;
  if (item.status === 'warning') return 60;
  if (item.status === 'fail') return 25;
  return normalizeScore(fallback);
}

function averageScores(scores = []) {
  const valid = scores.filter((score) => typeof score === 'number');
  if (!valid.length) return undefined;
  return Math.round(valid.reduce((sum, score) => sum + score, 0) / valid.length);
}

function hasEvidenceRisk(items = []) {
  return items.some((item) => /claim|prova|evid[eê]ncia|sustenta|n[uú]mero|garantid/i.test(String(item || '')));
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

function normalizeScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function firstString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 1_000_000) / 1_000_000;
}

import { createLearningSuggestion } from './learning.js';

export const AGENCY_SIGNAL_AFFECTED_SLICES = [
  'decodificacao',
  'plataforma_branding',
  'voice_profile',
  'visual_identity',
  'experiencia',
  'plano_comunicacao',
  'strategic_tensions',
  'executional_readiness',
  'other',
];

export const AGENCY_SIGNAL_TYPES = [
  'missing_information',
  'vague_guideline',
  'contradiction',
  'weak_proof',
  'tone_gap',
  'visual_gap',
  'audience_gap',
  'channel_gap',
  'repeated_manual_edit',
  'performance_learning',
];

export const AGENCY_SIGNAL_SEVERITIES = ['low', 'medium', 'high'];
export const AGENCY_SIGNAL_STATUSES = ['open', 'reviewed', 'converted_to_learning', 'dismissed', 'archived'];

export async function createAgencySignal(db, input = {}) {
  const source = await resolveSignalSource(db, input);
  const payload = normalizeSignalPayload(input, source);

  const { data, error } = await db
    .from('agency_signals')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function listAgencySignals(db, brandId, filters = {}) {
  if (!brandId) {
    const err = new Error('brandId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  let query = db
    .from('agency_signals')
    .select('*')
    .eq('brand_id', brandId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.affectedSlice) query = query.eq('affected_slice', filters.affectedSlice);
  if (filters.signalType) query = query.eq('signal_type', filters.signalType);
  if (filters.severity) query = query.eq('severity', filters.severity);
  if (filters.agencyRunId) query = query.eq('agency_run_id', filters.agencyRunId);
  if (filters.agencyRequestId) query = query.eq('agency_request_id', filters.agencyRequestId);
  if (filters.sourceAgentId) query = query.eq('source_agent_id', filters.sourceAgentId);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const search = String(filters.search || '').trim().toLowerCase();
  if (!search) return data || [];
  return (data || []).filter((item) => [
    item.affected_slice,
    item.signal_type,
    item.severity,
    item.title,
    item.description,
    item.recommendation,
    ...(Array.isArray(item.evidence_json) ? item.evidence_json : []),
  ].filter(Boolean).join(' ').toLowerCase().includes(search));
}

export async function markAgencySignalReviewed(db, id) {
  return updateSignalStatus(db, id, 'reviewed');
}

export async function dismissAgencySignal(db, id) {
  return updateSignalStatus(db, id, 'dismissed');
}

export async function archiveAgencySignal(db, id) {
  return updateSignalStatus(db, id, 'archived');
}

export async function convertAgencySignalToLearningSuggestion(db, id, input = {}) {
  const signal = await getAgencySignal(db, id);
  if (!signal) throw notFoundError();

  const suggestion = await createLearningSuggestion(db, {
    brandId: signal.brand_id,
    sourceAgencyRunId: signal.agency_run_id,
    sourceAgencyRequestId: signal.agency_request_id,
    sourceAgencySignalId: signal.id,
    learningType: input.learningType || input.learning_type || mapSignalTypeToLearningType(signal),
    content: input.content || buildLearningContent(signal),
    rationale: input.rationale || buildLearningRationale(signal),
    confidenceScore: input.confidenceScore ?? input.confidence_score ?? severityToConfidence(signal.severity),
  });

  const updatedSignal = await updateSignalStatus(db, id, 'converted_to_learning');
  return { signal: updatedSignal, suggestion };
}

export function summarizeAgencySignalsBySlice(signals = []) {
  const summary = {};
  for (const signal of signals || []) {
    const slice = AGENCY_SIGNAL_AFFECTED_SLICES.includes(signal?.affected_slice) ? signal.affected_slice : 'other';
    if (!summary[slice]) {
      summary[slice] = {
        affected_slice: slice,
        total: 0,
        open: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
    }
    summary[slice].total += 1;
    if (signal.status === 'open') summary[slice].open += 1;
    if (signal.severity === 'high') summary[slice].high += 1;
    if (signal.severity === 'medium') summary[slice].medium += 1;
    if (signal.severity === 'low') summary[slice].low += 1;
  }
  return Object.values(summary).sort((a, b) => b.open - a.open || b.high - a.high || b.total - a.total);
}

export async function createAgencySignalsFromStep(db, { run, request, step, output, qualityAssessment } = {}) {
  const payloads = buildSignalPayloadsFromStep({ run, request, step, output, qualityAssessment });
  const created = [];
  for (const payload of payloads) {
    created.push(await createAgencySignal(db, payload));
  }
  return created;
}

export function buildSignalPayloadsFromStep({ run, request, step, output, qualityAssessment } = {}) {
  const agentId = step?.agent_id || output?.agentId || output?.agent_id || '';
  const data = output?.data && typeof output.data === 'object' ? output.data : output || {};
  const warnings = [
    ...toArray(output?.warnings),
    ...toArray(data.warnings),
    ...toArray(qualityAssessment?.quality_issues),
  ].map(String).map((item) => item.trim()).filter(Boolean);
  const payloads = [];

  for (const warning of warnings.slice(0, 3)) {
    const classification = classifySignal(agentId, warning);
    payloads.push({
      brandId: run?.brand_id || request?.brand_id,
      agencyRunId: run?.id || step?.run_id,
      agencyRequestId: request?.id || run?.request_id,
      sourceAgentId: agentId,
      affectedSlice: classification.affectedSlice,
      signalType: classification.signalType,
      severity: qualityAssessment?.quality_status === 'risky' ? 'high' : classification.severity,
      title: classification.title,
      description: warning,
      evidence: [warning],
      recommendation: classification.recommendation,
    });
  }

  return payloads.filter((payload) => payload.brandId && payload.description);
}

async function getAgencySignal(db, id) {
  const { data, error } = await db
    .from('agency_signals')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateSignalStatus(db, id, status) {
  if (!AGENCY_SIGNAL_STATUSES.includes(status)) {
    const err = new Error('status inválido para sinal da Agência.');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('agency_signals')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

async function resolveSignalSource(db, input) {
  const explicitBrandId = input.brandId || input.brand_id;
  const agencyRunId = input.agencyRunId || input.agency_run_id;
  const agencyRequestId = input.agencyRequestId || input.agency_request_id;

  if (agencyRunId) {
    const { data: run, error } = await db
      .from('agency_runs')
      .select('*')
      .eq('id', agencyRunId)
      .maybeSingle();
    if (error) throw error;
    if (!run) throw sourceNotFoundError('Run de origem não encontrada.');
    return {
      brandId: run.brand_id,
      agencyRunId: run.id,
      agencyRequestId: agencyRequestId || run.request_id,
    };
  }

  if (agencyRequestId) {
    const { data: request, error } = await db
      .from('agency_requests')
      .select('*')
      .eq('id', agencyRequestId)
      .maybeSingle();
    if (error) throw error;
    if (!request) throw sourceNotFoundError('Pedido de origem não encontrado.');
    return {
      brandId: request.brand_id,
      agencyRequestId: request.id,
    };
  }

  if (explicitBrandId) return { brandId: explicitBrandId };

  const err = new Error('brandId, agencyRunId ou agencyRequestId obrigatório para criar sinal.');
  err.statusCode = 400;
  throw err;
}

function normalizeSignalPayload(input, source) {
  const affectedSlice = input.affectedSlice || input.affected_slice || 'other';
  const signalType = input.signalType || input.signal_type;
  const severity = input.severity || 'medium';
  assertEnum(affectedSlice, AGENCY_SIGNAL_AFFECTED_SLICES, 'affected_slice inválido.');
  assertEnum(signalType, AGENCY_SIGNAL_TYPES, 'signal_type inválido.');
  assertEnum(severity, AGENCY_SIGNAL_SEVERITIES, 'severity inválido.');

  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const recommendation = String(input.recommendation || '').trim();
  if (!title || !description || !recommendation) {
    const err = new Error('title, description e recommendation são obrigatórios para sinal da Agência.');
    err.statusCode = 400;
    throw err;
  }

  const status = input.status || 'open';
  assertEnum(status, AGENCY_SIGNAL_STATUSES, 'status inválido para sinal da Agência.');

  return {
    brand_id: source.brandId,
    agency_run_id: input.agencyRunId || input.agency_run_id || source.agencyRunId || null,
    agency_request_id: input.agencyRequestId || input.agency_request_id || source.agencyRequestId || null,
    source_agent_id: input.sourceAgentId || input.source_agent_id || null,
    affected_slice: affectedSlice,
    signal_type: signalType,
    severity,
    title,
    description,
    evidence_json: toArray(input.evidence || input.evidence_json).map(String).map((item) => item.trim()).filter(Boolean),
    recommendation,
    status,
  };
}

function classifySignal(agentId, text) {
  const value = String(text || '').toLowerCase();
  if (/prova|evid[eê]ncia|claim|n[uú]mero|sustenta/.test(value)) {
    return {
      affectedSlice: 'plataforma_branding',
      signalType: 'weak_proof',
      severity: 'high',
      title: 'Prova fraca ou ausente na Brand Memory',
      recommendation: 'Revisar provas, claims permitidos e evidências antes de promover novos aprendizados.',
    };
  }
  if (agentId === 'copywriter' || /tom|voz|linguagem|copy|gen[eé]rica/.test(value)) {
    return {
      affectedSlice: 'voice_profile',
      signalType: 'tone_gap',
      severity: 'medium',
      title: 'Lacuna operacional no tom de voz',
      recommendation: 'Revisar voice_profile com exemplos positivos, negativos e linguagem proprietária.',
    };
  }
  if (agentId === 'visual_director' || /visual|imagem|cor|tipografia|layout/.test(value)) {
    return {
      affectedSlice: 'visual_identity',
      signalType: 'visual_gap',
      severity: 'medium',
      title: 'Lacuna no sistema visual operacional',
      recommendation: 'Reforçar visual_identity com do/don’t, direção de imagem, layout, cores e tipografia.',
    };
  }
  if (/p[uú]blico|persona|cluster|audi[eê]ncia/.test(value)) {
    return {
      affectedSlice: 'experiencia',
      signalType: 'audience_gap',
      severity: 'medium',
      title: 'Cluster ou audiência pouco acionável',
      recommendation: 'Revisar experiencia e plano_comunicacao com clusters mais operacionais.',
    };
  }
  if (/canal|linkedin|instagram|email|whatsapp|website/.test(value)) {
    return {
      affectedSlice: 'plano_comunicacao',
      signalType: 'channel_gap',
      severity: 'medium',
      title: 'Diretriz de canal insuficiente',
      recommendation: 'Reforçar regras por canal, formato, CTA e restrições de publicação.',
    };
  }
  return {
    affectedSlice: 'other',
    signalType: 'missing_information',
    severity: 'medium',
    title: 'Lacuna operacional identificada pela Agência',
    recommendation: 'Revisar o slice de origem antes de incorporar aprendizado à Brand Memory.',
  };
}

function mapSignalTypeToLearningType(signal) {
  const map = {
    tone_gap: 'voice_preference',
    visual_gap: 'visual_preference',
    audience_gap: 'audience_insight',
    channel_gap: 'channel_rule',
    weak_proof: 'claim_rule',
    contradiction: 'campaign_learning',
    repeated_manual_edit: 'campaign_learning',
    performance_learning: 'campaign_learning',
  };
  return map[signal.signal_type] || 'campaign_learning';
}

function buildLearningContent(signal) {
  return `[${signal.affected_slice}] ${signal.recommendation}`;
}

function buildLearningRationale(signal) {
  const evidence = Array.isArray(signal.evidence_json) ? signal.evidence_json : [];
  return [
    `Sinal da Agência: ${signal.title}`,
    signal.description,
    evidence.length ? `Evidências: ${evidence.join(' | ')}` : '',
  ].filter(Boolean).join('\n');
}

function severityToConfidence(severity) {
  if (severity === 'high') return 82;
  if (severity === 'medium') return 68;
  return 52;
}

function assertEnum(value, allowed, message) {
  if (!allowed.includes(value)) {
    const err = new Error(message);
    err.statusCode = 400;
    throw err;
  }
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function notFoundError() {
  const err = new Error('Sinal da Agência não encontrado.');
  err.statusCode = 404;
  return err;
}

function sourceNotFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

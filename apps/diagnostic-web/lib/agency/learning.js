export const BRAND_LEARNING_TYPES = [
  'voice_preference',
  'forbidden_language',
  'approved_cta',
  'rejected_cta',
  'audience_insight',
  'visual_preference',
  'visual_rejection',
  'claim_rule',
  'channel_rule',
  'campaign_learning',
];

export const BRAND_LEARNING_STATUSES = [
  'suggested',
  'approved_for_memory',
  'rejected',
  'archived',
];

export async function createLearningSuggestion(db, input = {}) {
  assertLearningType(input.learningType || input.learning_type);
  const learningType = input.learningType || input.learning_type;
  const content = String(input.content || '').trim();
  if (!content) {
    const err = new Error('content obrigatório para sugestão de aprendizado.');
    err.statusCode = 400;
    throw err;
  }

  const source = await resolveLearningSource(db, input);
  const payload = {
    brand_id: source.brandId,
    source_agency_run_id: input.sourceAgencyRunId || input.source_agency_run_id || source.runId || null,
    source_agency_request_id: input.sourceAgencyRequestId || input.source_agency_request_id || source.requestId || null,
    source_library_item_id: input.sourceLibraryItemId || input.source_library_item_id || null,
    source_agency_signal_id: input.sourceAgencySignalId || input.source_agency_signal_id || null,
    learning_type: learningType,
    content,
    rationale: input.rationale ? String(input.rationale).trim() : null,
    confidence_score: normalizeConfidence(input.confidenceScore ?? input.confidence_score),
    status: 'suggested',
  };

  const { data, error } = await db
    .from('brand_learning_suggestions')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function approveLearningSuggestion(db, id) {
  const { data, error } = await db
    .from('brand_learning_suggestions')
    .update({
      status: 'approved_for_memory',
      approved_at: new Date().toISOString(),
      rejected_reason: null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

export async function rejectLearningSuggestion(db, id, reason) {
  const cleanReason = String(reason || '').trim();
  if (!cleanReason) {
    const err = new Error('Informe o motivo da rejeição.');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('brand_learning_suggestions')
    .update({
      status: 'rejected',
      rejected_reason: cleanReason,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

export async function archiveLearningSuggestion(db, id) {
  const { data, error } = await db
    .from('brand_learning_suggestions')
    .update({ status: 'archived' })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

export async function listLearningSuggestions(db, brandId, filters = {}) {
  if (!brandId) {
    const err = new Error('brandId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  let query = db
    .from('brand_learning_suggestions')
    .select('*')
    .eq('brand_id', brandId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.learningType) query = query.eq('learning_type', filters.learningType);
  if (filters.sourceAgencyRunId) query = query.eq('source_agency_run_id', filters.sourceAgencyRunId);
  if (filters.sourceAgencyRequestId) query = query.eq('source_agency_request_id', filters.sourceAgencyRequestId);
  if (filters.sourceLibraryItemId) query = query.eq('source_library_item_id', filters.sourceLibraryItemId);
  if (filters.sourceAgencySignalId) query = query.eq('source_agency_signal_id', filters.sourceAgencySignalId);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const search = String(filters.search || '').trim().toLowerCase();
  if (!search) return data || [];
  return (data || []).filter((item) => [
    item.learning_type,
    item.content,
    item.rationale,
    item.rejected_reason,
  ].filter(Boolean).join(' ').toLowerCase().includes(search));
}

async function resolveLearningSource(db, input) {
  const explicitBrandId = input.brandId || input.brand_id;
  const sourceLibraryItemId = input.sourceLibraryItemId || input.source_library_item_id;
  const sourceAgencySignalId = input.sourceAgencySignalId || input.source_agency_signal_id;
  const sourceRunId = input.sourceAgencyRunId || input.source_agency_run_id;
  const sourceRequestId = input.sourceAgencyRequestId || input.source_agency_request_id;

  if (sourceAgencySignalId) {
    const { data: signal, error } = await db
      .from('agency_signals')
      .select('*')
      .eq('id', sourceAgencySignalId)
      .maybeSingle();
    if (error) throw error;
    if (!signal) throw sourceNotFoundError('Sinal da Agência não encontrado.');
    return {
      brandId: signal.brand_id,
      runId: signal.agency_run_id,
      requestId: signal.agency_request_id,
    };
  }

  if (sourceLibraryItemId) {
    const { data: item, error } = await db
      .from('brand_library_items')
      .select('*')
      .eq('id', sourceLibraryItemId)
      .maybeSingle();
    if (error) throw error;
    if (!item) throw sourceNotFoundError('Item da Biblioteca não encontrado.');
    return {
      brandId: item.brand_id,
      runId: item.source_agency_run_id,
      requestId: item.source_agency_request_id,
    };
  }

  if (sourceRunId) {
    const { data: run, error } = await db
      .from('agency_runs')
      .select('*')
      .eq('id', sourceRunId)
      .maybeSingle();
    if (error) throw error;
    if (!run) throw sourceNotFoundError('Run de origem não encontrada.');
    return {
      brandId: run.brand_id,
      runId: run.id,
      requestId: run.request_id,
    };
  }

  if (sourceRequestId) {
    const { data: request, error } = await db
      .from('agency_requests')
      .select('*')
      .eq('id', sourceRequestId)
      .maybeSingle();
    if (error) throw error;
    if (!request) throw sourceNotFoundError('Pedido de origem não encontrado.');
    return {
      brandId: request.brand_id,
      requestId: request.id,
    };
  }

  if (explicitBrandId) {
    return { brandId: explicitBrandId };
  }

  const err = new Error('brandId ou fonte de origem obrigatório para criar aprendizado.');
  err.statusCode = 400;
  throw err;
}

function assertLearningType(type) {
  if (!BRAND_LEARNING_TYPES.includes(type)) {
    const err = new Error('learning_type inválido.');
    err.statusCode = 400;
    throw err;
  }
}

function normalizeConfidence(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function notFoundError() {
  const err = new Error('Sugestão de aprendizado não encontrada.');
  err.statusCode = 404;
  return err;
}

function sourceNotFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

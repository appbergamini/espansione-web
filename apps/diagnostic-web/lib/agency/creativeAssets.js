export const CREATIVE_ASSET_TYPES = [
  'conceptual_image',
  'moodboard_reference',
  'background_image',
  'visual_prompt',
  'editable_art_reference',
  'final_art',
];

export const CREATIVE_ASSET_STATUSES = [
  'draft',
  'generated',
  'approved',
  'rejected',
  'archived',
];

export const EMBEDDED_TEXT_REVIEW_WARNING = 'Imagens com texto embutido exigem revisão humana de ortografia, legibilidade, marca e claims.';

export async function createCreativeAsset(db, input = {}) {
  const assetType = input.assetType || input.asset_type;
  assertAssetType(assetType);

  const source = await resolveCreativeAssetSource(db, input);
  const hasEmbeddedText = Boolean(input.hasEmbeddedText ?? input.has_embedded_text);
  const textReviewRequired = hasEmbeddedText
    ? true
    : Boolean(input.textReviewRequired ?? input.text_review_required);
  const status = input.status || (input.fileUrl || input.file_url ? 'generated' : 'draft');
  assertAssetStatus(status);

  const payload = {
    brand_id: source.brandId,
    agency_request_id: input.agencyRequestId || input.agency_request_id || source.requestId || null,
    agency_run_id: input.agencyRunId || input.agency_run_id || source.runId || null,
    source_step_id: input.sourceStepId || input.source_step_id || source.stepId || null,
    asset_type: assetType,
    status,
    title: cleanText(input.title) || buildAssetTitle(assetType, input),
    prompt: optionalText(input.prompt),
    negative_prompt: optionalText(input.negativePrompt || input.negative_prompt),
    file_url: optionalText(input.fileUrl || input.file_url),
    metadata_json: normalizeAssetMetadata(input.metadataJson || input.metadata_json, {
      hasEmbeddedText,
      textReviewRequired,
      assetType,
      status,
    }),
    has_embedded_text: hasEmbeddedText,
    text_review_required: textReviewRequired,
    review_notes: optionalText(input.reviewNotes || input.review_notes),
  };

  const { data, error } = await db
    .from('creative_assets')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function attachCreativeAssetToRun(db, assetId, runId) {
  if (!assetId) throwRequired('assetId obrigatório');
  const runContext = await loadRunContext(db, runId);

  const { data: asset, error: assetError } = await db
    .from('creative_assets')
    .select('*')
    .eq('id', assetId)
    .maybeSingle();
  if (assetError) throw assetError;
  if (!asset) throw notFoundError();
  if (asset.brand_id !== runContext.brandId) {
    const err = new Error('Ativo visual pertence a outra marca.');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('creative_assets')
    .update({
      brand_id: runContext.brandId,
      agency_run_id: runContext.run.id,
      agency_request_id: runContext.request?.id || asset.agency_request_id || null,
    })
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function approveCreativeAsset(db, assetId, notes = '') {
  const asset = await getCreativeAsset(db, assetId);
  const metadata = normalizeAssetMetadata(asset.metadata_json, asset);
  const warnings = getCreativeAssetWarnings(asset);
  const reviewNotes = [asset.review_notes, cleanText(notes)].filter(Boolean).join('\n');

  const { data, error } = await db
    .from('creative_assets')
    .update({
      status: 'approved',
      review_notes: reviewNotes || asset.review_notes || null,
      metadata_json: warnings.length
        ? { ...metadata, warnings: mergeUnique([...(metadata.warnings || []), ...warnings]) }
        : metadata,
    })
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function rejectCreativeAsset(db, assetId, reason) {
  const cleanReason = cleanText(reason);
  if (!cleanReason) throwRequired('Informe o motivo da rejeição.');

  const { data, error } = await db
    .from('creative_assets')
    .update({
      status: 'rejected',
      review_notes: cleanReason,
    })
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

export async function archiveCreativeAsset(db, assetId) {
  const { data, error } = await db
    .from('creative_assets')
    .update({ status: 'archived' })
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

export async function listCreativeAssetsByBrand(db, brandId, filters = {}) {
  if (!brandId) throwRequired('brandId obrigatório');

  let query = db
    .from('creative_assets')
    .select('*')
    .eq('brand_id', brandId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.assetType) query = query.eq('asset_type', filters.assetType);
  if (filters.agencyRequestId) query = query.eq('agency_request_id', filters.agencyRequestId);
  if (filters.agencyRunId) query = query.eq('agency_run_id', filters.agencyRunId);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return filterAssetsBySearch(data || [], filters.search);
}

export async function listCreativeAssetsByRun(db, runId, filters = {}) {
  if (!runId) throwRequired('runId obrigatório');

  let query = db
    .from('creative_assets')
    .select('*')
    .eq('agency_run_id', runId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.assetType) query = query.eq('asset_type', filters.assetType);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return filterAssetsBySearch(data || [], filters.search);
}

export async function createVisualPromptAssetFromStep(db, runId, sourceStepId) {
  const { run, request, steps } = await loadRunContext(db, runId);
  const step = sourceStepId
    ? steps.find((item) => item.id === sourceStepId)
    : steps.find((item) => item.agent_id === 'visual_director' && item.is_current !== false);

  if (!step) {
    const err = new Error('Step do Diretor Visual não encontrado.');
    err.statusCode = 404;
    throw err;
  }

  const payload = getStepPayload(step);
  const prompt = cleanText(payload.prompt_visual_opcional);
  if (!prompt) {
    const err = new Error('O output do Diretor Visual não tem prompt_visual_opcional para salvar.');
    err.statusCode = 400;
    throw err;
  }

  return createCreativeAsset(db, {
    brandId: run.brand_id || request.brand_id,
    agencyRunId: run.id,
    agencyRequestId: request.id,
    sourceStepId: step.id,
    assetType: 'visual_prompt',
    status: 'generated',
    title: 'Prompt visual do Diretor Visual',
    prompt,
    metadataJson: {
      agent_id: 'visual_director',
      source: 'prompt_visual_opcional',
      visual_direction: payload.direcao_de_arte || null,
      composition: payload.composicao || null,
      style: payload.estilo_imagem || null,
    },
  });
}

export function getCreativeAssetWarnings(asset = {}) {
  const warnings = [];
  if (asset.has_embedded_text || asset.hasEmbeddedText) {
    warnings.push(EMBEDDED_TEXT_REVIEW_WARNING);
  }
  if ((asset.asset_type || asset.assetType) === 'final_art' && (asset.text_review_required || asset.textReviewRequired)) {
    warnings.push('Ativo final_art com texto embutido só deve avançar após revisão humana explícita.');
  }
  return mergeUnique(warnings);
}

async function resolveCreativeAssetSource(db, input) {
  const explicitBrandId = input.brandId || input.brand_id;
  const sourceStepId = input.sourceStepId || input.source_step_id;
  const runId = input.agencyRunId || input.agency_run_id || input.sourceAgencyRunId || input.source_agency_run_id;
  const requestId = input.agencyRequestId || input.agency_request_id || input.sourceAgencyRequestId || input.source_agency_request_id;

  if (sourceStepId) {
    const { data: step, error } = await db
      .from('agency_steps')
      .select('*')
      .eq('id', sourceStepId)
      .maybeSingle();
    if (error) throw error;
    if (!step) throw sourceNotFoundError('Step de origem não encontrado.');
    const runContext = await loadRunContext(db, step.run_id);
    return {
      brandId: runContext.brandId,
      runId: runContext.run.id,
      requestId: runContext.request?.id,
      stepId: step.id,
    };
  }

  if (runId) {
    const runContext = await loadRunContext(db, runId);
    return {
      brandId: runContext.brandId,
      runId: runContext.run.id,
      requestId: runContext.request?.id,
    };
  }

  if (requestId) {
    const { data: request, error } = await db
      .from('agency_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    if (error) throw error;
    if (!request) throw sourceNotFoundError('Pedido de origem não encontrado.');
    return { brandId: request.brand_id, requestId: request.id };
  }

  if (explicitBrandId) return { brandId: explicitBrandId };

  throwRequired('brandId, pedido, run ou step de origem obrigatório para criar ativo visual.');
}

async function loadRunContext(db, runId) {
  if (!runId) throwRequired('runId obrigatório');

  const { data: run, error: runError } = await db
    .from('agency_runs')
    .select('*')
    .eq('id', runId)
    .maybeSingle();
  if (runError) throw runError;
  if (!run) throw sourceNotFoundError('Run de origem não encontrada.');

  const [{ data: request, error: requestError }, { data: steps, error: stepsError }] = await Promise.all([
    db.from('agency_requests').select('*').eq('id', run.request_id).maybeSingle(),
    db.from('agency_steps').select('*').eq('run_id', run.id).order('created_at', { ascending: true }),
  ]);
  if (requestError) throw requestError;
  if (stepsError) throw stepsError;

  return {
    run,
    request,
    steps: steps || [],
    brandId: run.brand_id || request?.brand_id,
  };
}

async function getCreativeAsset(db, assetId) {
  if (!assetId) throwRequired('assetId obrigatório');
  const { data, error } = await db
    .from('creative_assets')
    .select('*')
    .eq('id', assetId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFoundError();
  return data;
}

function assertAssetType(assetType) {
  if (!CREATIVE_ASSET_TYPES.includes(assetType)) {
    const err = new Error('asset_type inválido para ativo visual.');
    err.statusCode = 400;
    throw err;
  }
}

function assertAssetStatus(status) {
  if (!CREATIVE_ASSET_STATUSES.includes(status)) {
    const err = new Error('status inválido para ativo visual.');
    err.statusCode = 400;
    throw err;
  }
}

function normalizeAssetMetadata(metadata, asset) {
  const base = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};
  const warnings = getCreativeAssetWarnings(asset);
  return warnings.length ? { ...base, warnings: mergeUnique([...(base.warnings || []), ...warnings]) } : base;
}

function filterAssetsBySearch(items, searchValue) {
  const search = cleanText(searchValue).toLowerCase();
  if (!search) return items;
  return items.filter((item) => [
    item.title,
    item.prompt,
    item.negative_prompt,
    item.review_notes,
    item.asset_type,
    item.status,
  ].filter(Boolean).join(' ').toLowerCase().includes(search));
}

function buildAssetTitle(assetType, input) {
  if (assetType === 'visual_prompt') return 'Prompt visual';
  if (assetType === 'conceptual_image') return 'Imagem conceitual';
  if (assetType === 'moodboard_reference') return 'Referência de moodboard';
  if (assetType === 'background_image') return 'Imagem de fundo';
  if (assetType === 'editable_art_reference') return 'Referência para arte editável';
  return input.fileUrl || input.file_url ? 'Arte final em revisão' : 'Ativo visual';
}

function getStepPayload(stepOrOutput) {
  const output = stepOrOutput?.output || stepOrOutput;
  return output?.data || output || {};
}

function mergeUnique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function optionalText(value) {
  const text = cleanText(value);
  return text || null;
}

function cleanText(value) {
  return String(value || '').trim();
}

function throwRequired(message) {
  const err = new Error(message);
  err.statusCode = 400;
  throw err;
}

function notFoundError() {
  const err = new Error('Ativo visual não encontrado.');
  err.statusCode = 404;
  return err;
}

function sourceNotFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

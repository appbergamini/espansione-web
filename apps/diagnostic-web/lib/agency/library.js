export const BRAND_LIBRARY_ITEM_TYPES = [
  'approved_copy',
  'rejected_copy',
  'approved_visual_direction',
  'rejected_visual_direction',
  'approved_cta',
  'rejected_cta',
  'visual_prompt',
  'creative_reference',
  'campaign_example',
  'negative_example',
];

export const BRAND_LIBRARY_STATUSES = ['active', 'archived'];

export async function saveAgencyOutputToLibrary(db, runId, itemType, {
  sourceStepId,
  notes,
  title,
  tags,
} = {}) {
  assertLibraryItemType(itemType);
  const { run, request, steps } = await loadLibraryRunContext(db, runId);
  const step = sourceStepId
    ? steps.find((item) => item.id === sourceStepId)
    : selectSourceStepForItemType(steps, itemType);

  if (!step) {
    const err = new Error('Nenhum step compatível encontrado para salvar na Biblioteca.');
    err.statusCode = 400;
    throw err;
  }

  const output = step.output || {};
  const plainText = extractPlainTextFromLibraryContent(output, itemType);
  const payload = {
    brand_id: run.brand_id || request.brand_id,
    source_agency_run_id: run.id,
    source_agency_step_id: step.id,
    source_agency_request_id: request.id,
    item_type: itemType,
    status: 'active',
    title: title || buildLibraryTitle(request, itemType, step),
    content_json: output,
    plain_text: plainText,
    tags: normalizeLibraryTags(tags),
    channel: request.channel || null,
    request_type: request.request_type || null,
    objective: request.objective || null,
    audience_cluster: request.audience_cluster || null,
    notes: notes || null,
  };

  const { data, error } = await db
    .from('brand_library_items')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function listBrandLibraryItems(db, brandId, filters = {}) {
  if (!brandId) {
    const err = new Error('brandId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  let query = db
    .from('brand_library_items')
    .select('*')
    .eq('brand_id', brandId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.itemType) query = query.eq('item_type', filters.itemType);
  if (filters.channel) query = query.eq('channel', filters.channel);
  if (filters.objective) query = query.eq('objective', filters.objective);
  if (filters.requestType) query = query.eq('request_type', filters.requestType);
  if (filters.audienceCluster) query = query.eq('audience_cluster', filters.audienceCluster);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const search = String(filters.search || '').trim().toLowerCase();
  const items = search
    ? (data || []).filter((item) => [
      item.title,
      item.plain_text,
      item.notes,
      ...(Array.isArray(item.tags) ? item.tags : []),
    ].filter(Boolean).join(' ').toLowerCase().includes(search))
    : (data || []);

  return items;
}

export async function archiveBrandLibraryItem(db, itemId) {
  if (!itemId) {
    const err = new Error('itemId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('brand_library_items')
    .update({ status: 'archived' })
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function useLibraryItemAsReference(db, itemId, newRequestId) {
  if (!newRequestId) {
    const err = new Error('newRequestId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  const item = await getLibraryItem(db, itemId);
  const { data: request, error: requestError } = await db
    .from('agency_requests')
    .select('*')
    .eq('id', newRequestId)
    .maybeSingle();

  if (requestError) throw requestError;
  if (!request) {
    const err = new Error('Pedido de destino não encontrado.');
    err.statusCode = 404;
    throw err;
  }
  if (request.brand_id !== item.brand_id) {
    const err = new Error('Item da Biblioteca pertence a outra marca.');
    err.statusCode = 400;
    throw err;
  }

  const reference = formatLibraryReference(item);
  const referenceMaterial = normalizeReferenceMaterial(request.reference_material);
  const nextReferences = referenceMaterial.includes(reference)
    ? referenceMaterial
    : [...referenceMaterial, reference];

  const { data, error } = await db
    .from('agency_requests')
    .update({ reference_material: nextReferences })
    .eq('id', newRequestId)
    .select('*')
    .single();

  if (error) throw error;
  return { request: data, item, reference };
}

async function loadLibraryRunContext(db, runId) {
  const { data: run, error: runError } = await db
    .from('agency_runs')
    .select('*')
    .eq('id', runId)
    .maybeSingle();
  if (runError) throw runError;
  if (!run) {
    const err = new Error('Run não encontrada.');
    err.statusCode = 404;
    throw err;
  }

  const [{ data: request, error: requestError }, { data: steps, error: stepsError }] = await Promise.all([
    db.from('agency_requests').select('*').eq('id', run.request_id).maybeSingle(),
    db.from('agency_steps').select('*').eq('run_id', run.id).order('created_at', { ascending: true }),
  ]);

  if (requestError) throw requestError;
  if (stepsError) throw stepsError;
  if (!request) {
    const err = new Error('Pedido da run não encontrado.');
    err.statusCode = 404;
    throw err;
  }

  return { run, request, steps: steps || [] };
}

async function getLibraryItem(db, itemId) {
  if (!itemId) {
    const err = new Error('itemId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('brand_library_items')
    .select('*')
    .eq('id', itemId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err = new Error('Item da Biblioteca não encontrado.');
    err.statusCode = 404;
    throw err;
  }
  return data;
}

function assertLibraryItemType(itemType) {
  if (!BRAND_LIBRARY_ITEM_TYPES.includes(itemType)) {
    const err = new Error('item_type inválido para Biblioteca da Marca.');
    err.statusCode = 400;
    throw err;
  }
}

function selectSourceStepForItemType(steps = [], itemType) {
  const currentSteps = steps.filter((step) => step.is_current !== false);
  const byAgent = new Map(currentSteps.map((step) => [step.agent_id, step]));
  const agentByType = {
    approved_copy: 'copywriter',
    rejected_copy: 'copywriter',
    approved_visual_direction: 'visual_director',
    rejected_visual_direction: 'visual_director',
    approved_cta: 'copywriter',
    rejected_cta: 'copywriter',
    visual_prompt: 'visual_director',
    creative_reference: 'editor',
    campaign_example: 'approver',
    negative_example: 'approver',
  };
  return byAgent.get(agentByType[itemType]) || currentSteps.at(-1) || null;
}

function buildLibraryTitle(request, itemType, step) {
  const type = itemType.replaceAll('_', ' ');
  const channel = request.channel ? ` · ${request.channel}` : '';
  return `${type}${channel} · ${step.agent_id}`;
}

function extractPlainTextFromLibraryContent(output, itemType) {
  const data = output?.data || output || {};
  const values = [];

  if (itemType.includes('copy') || itemType.includes('cta')) {
    values.push(data.headline, data.copy_principal, data.legenda, data.cta, data.versao_editada);
    values.push(...toArray(data.variacoes));
  }
  if (itemType.includes('visual') || itemType === 'visual_prompt') {
    values.push(data.direcao_de_arte, data.composicao, data.estilo_imagem, data.prompt_visual_opcional);
    values.push(...toArray(data.regras_visuais), ...toArray(data.assets_necessarios));
  }
  if (itemType === 'campaign_example' || itemType === 'negative_example' || itemType === 'creative_reference') {
    values.push(data.justificativa, data.risco_principal, data.versao_editada);
    values.push(...toArray(data.ajustes_obrigatorios), ...toArray(data.ajustes_recomendados));
  }

  const text = values.filter(Boolean).map((value) => (
    typeof value === 'string' ? value : JSON.stringify(value)
  )).join('\n');

  return text || JSON.stringify(data);
}

function formatLibraryReference(item) {
  return [
    `[Biblioteca da Marca: ${item.item_type}] ${item.title}`,
    item.channel ? `Canal: ${item.channel}` : null,
    item.objective ? `Objetivo: ${item.objective}` : null,
    item.audience_cluster ? `Cluster: ${item.audience_cluster}` : null,
    item.notes ? `Notas: ${item.notes}` : null,
    item.plain_text ? `Referência: ${item.plain_text}` : null,
  ].filter(Boolean).join('\n');
}

function normalizeReferenceMaterial(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((item) => item.trim()).filter(Boolean);
  return [];
}

function normalizeLibraryTags(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

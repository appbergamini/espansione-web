export const BRAND_ASSET_KIT_TAG = 'brand_asset_kit';

export const BRAND_ASSET_KIT_TYPES = [
  'brand_book_file',
  'logo_primary',
  'logo_secondary',
  'logo_symbol',
  'logo_monochrome',
  'color_palette',
  'typography',
  'graphic_element',
  'iconography',
  'image_style_reference',
  'usage_rule',
  'approved_visual_example',
  'rejected_visual_example',
  'other',
];

const ARCHIVED_TAG = 'archived';
const MANUAL_STORAGE_URL = 'manual://brand-asset-kit';

export async function listBrandAssetKitItems(db, brandId, filters = {}) {
  if (!brandId) throwRequired('brandId obrigatório');

  let query = db
    .from('brand_assets')
    .select('*')
    .eq('brand_id', brandId);

  if (filters.assetType) query = query.eq('asset_type', filters.assetType);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const includeArchived = filters.status === 'archived';
  const items = (data || [])
    .filter((item) => hasKitTag(item))
    .filter((item) => includeArchived ? hasArchivedTag(item) : !hasArchivedTag(item));

  return filterBySearch(items, filters.search);
}

export async function createBrandAssetKitItem(db, input = {}) {
  const brandId = input.brandId || input.brand_id;
  if (!brandId) throwRequired('brandId obrigatório');

  const assetType = input.assetType || input.asset_type || 'other';
  if (!BRAND_ASSET_KIT_TYPES.includes(assetType)) {
    const err = new Error('Tipo de item do Brand Book inválido.');
    err.statusCode = 400;
    throw err;
  }

  const name = cleanText(input.name);
  if (!name) throwRequired('Nome obrigatório');

  const payload = {
    brand_id: brandId,
    asset_type: assetType,
    name,
    description: optionalText(input.description),
    storage_url: optionalText(input.storageUrl || input.storage_url) || MANUAL_STORAGE_URL,
    mime_type: optionalText(input.mimeType || input.mime_type),
    tags: mergeUnique([BRAND_ASSET_KIT_TAG, ...(input.tags || [])]),
  };

  const { data, error } = await db
    .from('brand_assets')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function archiveBrandAssetKitItem(db, itemId) {
  if (!itemId) throwRequired('itemId obrigatório');

  const { data: current, error: currentError } = await db
    .from('brand_assets')
    .select('*')
    .eq('id', itemId)
    .maybeSingle();
  if (currentError) throw currentError;
  if (!current) throwNotFound();

  const { data, error } = await db
    .from('brand_assets')
    .update({ tags: mergeUnique([...(current.tags || []), ARCHIVED_TAG]) })
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export function summarizeBrandAssetKit(items = []) {
  const activeItems = items.filter((item) => !hasArchivedTag(item));
  return {
    total: activeItems.length,
    logos: activeItems.filter((item) => String(item.asset_type || '').startsWith('logo_')).length,
    colors: activeItems.filter((item) => item.asset_type === 'color_palette').length,
    typography: activeItems.filter((item) => item.asset_type === 'typography').length,
    rules: activeItems.filter((item) => item.asset_type === 'usage_rule').length,
    files: activeItems.filter((item) => item.asset_type === 'brand_book_file').length,
  };
}

function hasKitTag(item = {}) {
  return Array.isArray(item.tags) && item.tags.includes(BRAND_ASSET_KIT_TAG);
}

function hasArchivedTag(item = {}) {
  return Array.isArray(item.tags) && item.tags.includes(ARCHIVED_TAG);
}

function filterBySearch(items, search) {
  const needle = cleanText(search).toLowerCase();
  if (!needle) return items;
  return items.filter((item) => [
    item.name,
    item.description,
    item.asset_type,
    ...(item.tags || []),
  ].filter(Boolean).join(' ').toLowerCase().includes(needle));
}

function cleanText(value) {
  return String(value || '').trim();
}

function optionalText(value) {
  const text = cleanText(value);
  return text || null;
}

function mergeUnique(values) {
  return Array.from(new Set(values.map((value) => cleanText(value)).filter(Boolean)));
}

function throwRequired(message) {
  const err = new Error(message);
  err.statusCode = 400;
  throw err;
}

function throwNotFound() {
  const err = new Error('Item do Brand Book não encontrado.');
  err.statusCode = 404;
  throw err;
}

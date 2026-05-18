import {
  buildBrandKernel,
  validateBrandReadinessForAgency,
} from '@espansione/agents';

export const REQUEST_TYPES = [
  'social_post',
  'carousel',
  'short_video_script',
  'email',
  'landing_page_copy',
];

export const CHANNELS = [
  'linkedin',
  'instagram',
  'whatsapp',
  'email',
  'website',
  'paid_media',
  'other',
];

export const OBJECTIVES = [
  'awareness',
  'authority',
  'lead_generation',
  'conversion',
  'launch',
  'relationship',
  'retention',
];

export const REQUEST_STATUSES = [
  'draft',
  'briefing_pending',
  'briefing_created',
  'briefing_approved',
  'generation_pending',
  'generated',
  'revision_requested',
  'approved',
  'rejected',
  'archived',
];

export async function requireAgencyUser(db, user) {
  const { data: profile, error } = await db
    .from('profiles')
    .select('empresa_id, role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    const err = new Error('Perfil não encontrado');
    err.statusCode = 403;
    throw err;
  }

  if (!['master', 'admin'].includes(profile.role)) {
    const err = new Error('Apenas master/admin');
    err.statusCode = 403;
    throw err;
  }

  return profile;
}

export async function resolveBrandContext(db, { projetoId, brandId }) {
  if (brandId) {
    const { data: brand, error } = await db
      .from('brands')
      .select('id, slug, name, industry')
      .eq('id', brandId)
      .maybeSingle();
    if (error) throw error;
    return { brand: brand || null, projeto: null };
  }

  if (!projetoId) {
    const err = new Error('projeto_id ou brand_id obrigatório');
    err.statusCode = 400;
    throw err;
  }

  const [{ data: projeto, error: projetoError }, { data: run, error: runError }] = await Promise.all([
    db.from('projetos').select('*').eq('id', projetoId).maybeSingle(),
    db
      .from('diagnostic_runs')
      .select('brand_id, brands(id, slug, name, industry)')
      .eq('espansione_project_id', projetoId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (projetoError) throw projetoError;
  if (runError) throw runError;

  return {
    projeto: projeto || null,
    brand: run?.brands || null,
  };
}

export async function getAgencyReadiness(db, brandId) {
  if (!brandId) {
    return {
      brandMemory: null,
      readiness: validateBrandReadinessForAgency(null),
      brandKernel: null,
    };
  }

  const brandMemory = await getAgencyBrandMemory(db, brandId);
  const readiness = validateBrandReadinessForAgency(brandMemory);
  const brandKernel = brandMemory ? buildBrandKernel(brandMemory) : null;

  return { brandMemory, readiness, brandKernel };
}

export async function getAgencyBrandMemory(db, brandId) {
  const [{ data: brand, error: brandError }, { data: snapshots, error: snapshotsError }] = await Promise.all([
    db.from('brands').select('slug, name, industry').eq('id', brandId).maybeSingle(),
    db
      .from('brand_snapshots')
      .select('agent_id, data')
      .eq('brand_id', brandId)
      .eq('is_active', true),
  ]);

  if (brandError) throw brandError;
  if (snapshotsError) throw snapshotsError;
  if (!brand || !snapshots || snapshots.length === 0) return null;

  const memory = {
    brand_slug: brand.slug,
    brand_name: brand.name,
    industry: brand.industry,
    espansione_project_id: '',
    schema_version: '2.0',
    meta: {
      consolidated_at: new Date().toISOString(),
      schema_version: '2.0',
      agents_present: snapshots.map((snapshot) => snapshot.agent_id).sort((a, b) => a - b),
      agents_missing: [],
      has_evp: snapshots.some((snapshot) => snapshot.agent_id === 14),
      validation_errors: [],
      missing_required_fields: [],
      gaps_by_agent: {},
      load_status: 'loaded',
    },
  };

  for (const snapshot of snapshots) {
    applySnapshot(memory, snapshot.agent_id, snapshot.data);
  }

  return memory;
}

function applySnapshot(memory, agentId, data) {
  if (agentId === 2) memory.vi = data;
  if (agentId === 4) memory.ve = data;
  if (agentId === 5) {
    memory.vm = data?.vm;
    memory.vm_sources = data?.sources || [];
  }
  if (agentId === 6) memory.decodificacao = data;
  if (agentId === 7) memory.values_and_attributes = data;
  if (agentId === 8) {
    memory.diretrizes_estrategicas = data?.diretrizes || data;
    memory.diretrizes_reinforcement_logic = data?.reinforcement_logic || '';
  }
  if (agentId === 9) memory.plataforma_branding = data;
  if (agentId === 10) memory.voice_profile = data;
  if (agentId === 11) memory.visual_identity = data;
  if (agentId === 12) memory.experiencia = data;
  if (agentId === 13) memory.plano_comunicacao = data;
  if (agentId === 14) memory.evp = data;
}

export function validateAgencyRequestPayload(payload, readiness) {
  const errors = [];

  if (!payload.brand_id) errors.push('brand_id obrigatório');
  if (!REQUEST_TYPES.includes(payload.request_type)) errors.push('request_type inválido ou obrigatório');
  if (!CHANNELS.includes(payload.channel)) errors.push('channel inválido ou obrigatório');
  if (!OBJECTIVES.includes(payload.objective)) errors.push('objective inválido ou obrigatório');
  if (!payload.context || !String(payload.context).trim()) errors.push('context obrigatório');

  if (readiness.status === 'not_ready') {
    errors.push('Brand Memory insuficiente para criar pedidos da Agência');
  }

  if (payload.request_type && !readiness.allowedRequestTypes.includes(payload.request_type)) {
    errors.push(`request_type não permitido para status ${readiness.status}`);
  }

  return errors;
}

export function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

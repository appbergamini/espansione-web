import {
  buildBrandKernel,
  validateBrandReadinessForAgency,
} from '@espansione/agents';
import { getActiveBrandMemoryVersion } from '@espansione/brand-memory';

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
  'briefing_generated',
  'briefing_revision_requested',
  'briefing_approved',
  'generation_pending',
  'generation_running',
  'approval_pending',
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
      .select('brand_id')
      .eq('espansione_project_id', projetoId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (projetoError) throw projetoError;
  if (runError) throw runError;

  let brand = null;
  if (run?.brand_id) {
    const { data: brandData, error: brandError } = await db
      .from('brands')
      .select('id, slug, name, industry')
      .eq('id', run.brand_id)
      .maybeSingle();
    if (brandError) throw brandError;
    brand = brandData || null;
  }

  return {
    projeto: projeto || null,
    brand,
  };
}

export async function getAgencyReadiness(db, brandId) {
  if (!brandId) {
    return {
      brandMemory: null,
      brandMemoryVersion: null,
      readiness: validateBrandReadinessForAgency(null),
      brandKernel: null,
    };
  }

  const brandMemoryVersion = await getActiveBrandMemoryVersion(db, brandId);
  const brandMemory = brandMemoryVersion?.espansioneDiagnosticJson || null;
  const readiness = validateBrandReadinessForAgency(brandMemory);
  const brandKernel = brandMemory ? buildBrandKernel(brandMemory) : null;

  return { brandMemory, brandMemoryVersion, readiness, brandKernel };
}

export async function getAgencyPhaseOneStatus(db, projetoId) {
  if (!projetoId) return null;

  const { data: outputs, error } = await db
    .from('outputs')
    .select('id, agent_num, conteudo, created_at')
    .eq('projeto_id', projetoId)
    .in('agent_num', [6, 9, 12, 13, 16])
    .order('agent_num', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;

  const presentAgents = [...new Set((outputs || []).map((output) => output.agent_num))].sort((a, b) => a - b);
  const criticalAgents = [
    { agent: 6, slice: 'decodificacao', label: 'Agente 6 - Direção estratégica / decodificação' },
    { agent: 9, slice: 'plataforma_branding', label: 'Agente 9 - Plataforma de marca' },
    { agent: 12, slice: 'experiencia', label: 'Agente 12 - Personas, jornada e momentos de marca' },
    { agent: 13, slice: 'plano_comunicacao', label: 'Agente 13 - Plano de comunicação' },
  ];
  const missingCriticalAgents = criticalAgents.filter((item) => !presentAgents.includes(item.agent));
  const agent16Output = (outputs || []).find((output) => output.agent_num === 16) || null;
  const agent16HasExport = !!agent16Output?.conteudo?.match(/<brand_memory_export>[\s\S]*?<\/brand_memory_export>/i);

  let nextStep = 'Rode a Fase 1 ate os agentes criticos e carregue a Brand Memory apos revisao humana.';
  if (missingCriticalAgents.length > 0) {
    nextStep = `Faltam agentes criticos para a Agencia: ${missingCriticalAgents.map((item) => item.agent).join(', ')}.`;
  } else if (!agent16Output) {
    nextStep = 'Os agentes criticos existem, mas falta rodar o Agente 16 para gerar o export da Brand Memory.';
  } else if (!agent16HasExport) {
    nextStep = 'O Agente 16 existe, mas nao encontrei a tag <brand_memory_export>. Revise ou rode novamente o Agente 16.';
  } else {
    nextStep = 'O export do Agente 16 existe. Falta revisao humana e carregamento na Brand Memory.';
  }

  return {
    presentAgents,
    criticalAgentsFound: criticalAgents.filter((item) => presentAgents.includes(item.agent)),
    missingCriticalAgents,
    hasAgent16: !!agent16Output,
    agent16HasExport,
    canLoadBrandMemory: missingCriticalAgents.length === 0 && !!agent16Output && agent16HasExport,
    nextStep,
  };
}

export async function getAgencyBrandMemory(db, brandId) {
  const activeVersion = await getActiveBrandMemoryVersion(db, brandId);
  if (activeVersion?.espansioneDiagnosticJson) {
    return activeVersion.espansioneDiagnosticJson;
  }

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

import type {
  AgencyAgentId,
  AgencyExecutionPlan,
  AgencyExecutionProfile,
  AgencyExecutionProfileId,
  AgencyRequest,
  BrandKernel,
  BrandReadinessResult,
} from '@espansione/types';

export const DEFAULT_AGENCY_AGENT_SEQUENCE: AgencyAgentId[] = [
  'account_director',
  'copywriter',
  'channel_adapter',
  'visual_director',
  'editor',
  'brand_compliance',
  'approver',
];

const BASE_REQUIRED_AGENTS: AgencyAgentId[] = [
  'account_director',
  'copywriter',
  'editor',
  'brand_compliance',
  'approver',
];

export const DEFAULT_AGENCY_EXECUTION_PROFILES: Record<AgencyExecutionProfileId, AgencyExecutionProfile> = {
  simple_content: {
    id: 'simple_content',
    name: 'Conteúdo simples',
    description: 'Fluxo enxuto para peça textual sem adaptação específica de canal ou direção visual.',
    allowed_request_types: ['social_post', 'short_video_script', 'email'],
    required_agents: BASE_REQUIRED_AGENTS,
    optional_agents: [],
    default_agent_sequence: ['account_director', 'copywriter', 'editor', 'brand_compliance', 'approver'],
    requires_briefing_approval: true,
    requires_brand_compliance: true,
    supports_visual_assets: false,
    supports_publication_pack: false,
  },
  channel_adapted_content: {
    id: 'channel_adapted_content',
    name: 'Conteúdo adaptado por canal',
    description: 'Fluxo para adaptar a copy-mãe ao canal e formato solicitados.',
    allowed_request_types: ['social_post', 'short_video_script', 'email'],
    allowed_channels: ['linkedin', 'instagram', 'whatsapp', 'email', 'paid_media', 'other'],
    required_agents: [...BASE_REQUIRED_AGENTS, 'channel_adapter'],
    optional_agents: [],
    default_agent_sequence: ['account_director', 'copywriter', 'channel_adapter', 'editor', 'brand_compliance', 'approver'],
    requires_briefing_approval: true,
    requires_brand_compliance: true,
    supports_visual_assets: false,
    supports_publication_pack: false,
  },
  visual_content: {
    id: 'visual_content',
    name: 'Conteúdo visual',
    description: 'Fluxo para peças que exigem direção visual ou orientação de composição.',
    allowed_request_types: ['social_post', 'carousel', 'short_video_script'],
    allowed_channels: ['linkedin', 'instagram', 'whatsapp', 'paid_media', 'other'],
    required_agents: [...BASE_REQUIRED_AGENTS, 'channel_adapter', 'visual_director'],
    optional_agents: [],
    default_agent_sequence: ['account_director', 'copywriter', 'channel_adapter', 'visual_director', 'editor', 'brand_compliance', 'approver'],
    requires_briefing_approval: true,
    requires_brand_compliance: true,
    supports_visual_assets: true,
    supports_publication_pack: false,
  },
  landing_page_copy: {
    id: 'landing_page_copy',
    name: 'Copy de landing page',
    description: 'Fluxo para estruturar copy de página com adaptação para website e orientação visual.',
    allowed_request_types: ['landing_page_copy'],
    allowed_channels: ['website'],
    required_agents: [...BASE_REQUIRED_AGENTS, 'channel_adapter', 'visual_director'],
    optional_agents: [],
    default_agent_sequence: ['account_director', 'copywriter', 'channel_adapter', 'visual_director', 'editor', 'brand_compliance', 'approver'],
    requires_briefing_approval: true,
    requires_brand_compliance: true,
    supports_visual_assets: true,
    supports_publication_pack: false,
  },
  campaign_light: {
    id: 'campaign_light',
    name: 'Campanha leve',
    description: 'Fluxo para campanha simples com mais de uma peça, canal ou recorte criativo.',
    allowed_request_types: ['social_post', 'carousel', 'short_video_script', 'email', 'landing_page_copy'],
    required_agents: [...BASE_REQUIRED_AGENTS, 'channel_adapter', 'visual_director'],
    optional_agents: [],
    default_agent_sequence: ['account_director', 'copywriter', 'channel_adapter', 'visual_director', 'editor', 'brand_compliance', 'approver'],
    requires_briefing_approval: true,
    requires_brand_compliance: true,
    supports_visual_assets: true,
    supports_publication_pack: false,
    max_auto_revision_loops: 0,
  },
  custom: {
    id: 'custom',
    name: 'Customizado',
    description: 'Perfil reservado para sequência definida manualmente no futuro.',
    allowed_request_types: ['social_post', 'carousel', 'short_video_script', 'email', 'landing_page_copy'],
    required_agents: BASE_REQUIRED_AGENTS,
    optional_agents: ['channel_adapter', 'visual_director'],
    default_agent_sequence: DEFAULT_AGENCY_AGENT_SEQUENCE,
    requires_briefing_approval: true,
    requires_brand_compliance: true,
    supports_visual_assets: true,
    supports_publication_pack: false,
  },
};

export function getAgencyExecutionProfile(id?: AgencyExecutionProfileId | string | null): AgencyExecutionProfile {
  return DEFAULT_AGENCY_EXECUTION_PROFILES[(id || '') as AgencyExecutionProfileId]
    || DEFAULT_AGENCY_EXECUTION_PROFILES.simple_content;
}

export function selectAgencyExecutionProfile({
  agencyRequest,
  brandReadiness,
  availableAgents = DEFAULT_AGENCY_AGENT_SEQUENCE,
}: {
  agencyRequest: AgencyRequest;
  brandReadiness?: BrandReadinessResult;
  availableAgents?: AgencyAgentId[];
}): AgencyExecutionProfile {
  const requestType = agencyRequest.requestType;
  const available = new Set(availableAgents);
  const canUse = (profileId: AgencyExecutionProfileId) =>
    DEFAULT_AGENCY_EXECUTION_PROFILES[profileId].required_agents.every((agentId) => available.has(agentId));

  if (isCampaignRequest(agencyRequest) && canUse('campaign_light')) {
    return DEFAULT_AGENCY_EXECUTION_PROFILES.campaign_light;
  }

  if (requestType === 'landing_page_copy' && canUse('landing_page_copy')) {
    return DEFAULT_AGENCY_EXECUTION_PROFILES.landing_page_copy;
  }

  if (requestType === 'carousel' && canUse('visual_content')) {
    return DEFAULT_AGENCY_EXECUTION_PROFILES.visual_content;
  }

  if (requestType === 'short_video_script' && requiresVisualDirection(agencyRequest) && canUse('visual_content')) {
    return DEFAULT_AGENCY_EXECUTION_PROFILES.visual_content;
  }

  if (['social_post', 'short_video_script', 'email'].includes(requestType) && hasSpecificChannel(agencyRequest) && canUse('channel_adapted_content')) {
    return DEFAULT_AGENCY_EXECUTION_PROFILES.channel_adapted_content;
  }

  if (brandReadiness?.status === 'ready_for_campaigns' && hasSpecificChannel(agencyRequest) && canUse('channel_adapted_content')) {
    return DEFAULT_AGENCY_EXECUTION_PROFILES.channel_adapted_content;
  }

  return DEFAULT_AGENCY_EXECUTION_PROFILES.simple_content;
}

export function buildAgencyExecutionPlan({
  agencyRequest,
  brandKernel,
  selectedProfile,
  approvedBriefing,
}: {
  agencyRequest: AgencyRequest;
  brandKernel?: BrandKernel;
  selectedProfile: AgencyExecutionProfile;
  approvedBriefing?: unknown;
}): AgencyExecutionPlan {
  const agentSequence = normalizeAgentSequence(selectedProfile.default_agent_sequence, selectedProfile);
  const skipped = DEFAULT_AGENCY_AGENT_SEQUENCE
    .filter((agentId) => !agentSequence.includes(agentId))
    .map((agentId) => ({
      agent_id: agentId,
      reason: skippedReason(agentId, selectedProfile),
    }));
  const requiredGates = [
    selectedProfile.requires_briefing_approval ? 'briefing_approval' : null,
    selectedProfile.requires_brand_compliance ? 'brand_compliance_before_approver' : null,
    'human_approval_before_publication',
  ].filter((item): item is string => Boolean(item));

  return {
    profile_id: selectedProfile.id,
    request_id: agencyRequest.id || '',
    brand_id: agencyRequest.brandId,
    agent_sequence: agentSequence,
    skipped_agents: skipped,
    required_gates: requiredGates,
    rationale: buildPlanRationale(agencyRequest, selectedProfile, brandKernel, Boolean(approvedBriefing)),
    created_at: new Date().toISOString(),
  };
}

function normalizeAgentSequence(sequence: AgencyAgentId[], profile: AgencyExecutionProfile): AgencyAgentId[] {
  const unique = Array.from(new Set(sequence));
  const withRequired = Array.from(new Set(['account_director', ...unique, 'approver'] as AgencyAgentId[]));
  const withoutInvalidOptional = profile.requires_brand_compliance
    ? Array.from(new Set([...withRequired.slice(0, -1), 'brand_compliance', 'approver'] as AgencyAgentId[]))
    : withRequired;

  if (withoutInvalidOptional[0] !== 'account_director') {
    throw new Error('AgencyExecutionPlan invalido: account_director deve ser o primeiro agente.');
  }
  if (withoutInvalidOptional[withoutInvalidOptional.length - 1] !== 'approver') {
    throw new Error('AgencyExecutionPlan invalido: approver deve ser o ultimo agente.');
  }
  if (withoutInvalidOptional.includes('brand_compliance')) {
    const editorIndex = withoutInvalidOptional.indexOf('editor');
    const complianceIndex = withoutInvalidOptional.indexOf('brand_compliance');
    const approverIndex = withoutInvalidOptional.indexOf('approver');
    if (editorIndex < 0 || editorIndex > complianceIndex || complianceIndex > approverIndex) {
      throw new Error('AgencyExecutionPlan invalido: editor, brand_compliance e approver devem manter ordem fixa.');
    }
  }
  return withoutInvalidOptional;
}

function skippedReason(agentId: AgencyAgentId, profile: AgencyExecutionProfile): string {
  if (agentId === 'channel_adapter') return `Perfil ${profile.id} não exige adaptação por canal.`;
  if (agentId === 'visual_director') return `Perfil ${profile.id} não exige direção visual.`;
  return `Perfil ${profile.id} não inclui este agente na sequência padrão.`;
}

function buildPlanRationale(
  agencyRequest: AgencyRequest,
  profile: AgencyExecutionProfile,
  brandKernel: BrandKernel | undefined,
  hasApprovedBriefing: boolean
): string {
  const parts = [
    `Perfil ${profile.id} selecionado para ${agencyRequest.requestType} em ${agencyRequest.channel}.`,
    profile.description,
    hasApprovedBriefing
      ? 'Briefing aprovado já disponível para liberar agentes criativos.'
      : 'Briefing aprovado continua obrigatório antes de agentes criativos.',
    brandKernel?.brand?.name ? `BrandKernel carregado para ${brandKernel.brand.name}.` : null,
  ].filter(Boolean);
  return parts.join(' ');
}

function hasSpecificChannel(agencyRequest: AgencyRequest): boolean {
  return Boolean(agencyRequest.channel && agencyRequest.channel !== 'other');
}

function isCampaignRequest(agencyRequest: AgencyRequest): boolean {
  const anyRequest = agencyRequest as AgencyRequest & {
    campaign?: boolean;
    campaignFlag?: boolean;
    isCampaign?: boolean;
    channels?: unknown[];
  };
  return Boolean(anyRequest.campaign || anyRequest.campaignFlag || anyRequest.isCampaign)
    || (Array.isArray(anyRequest.channels) && anyRequest.channels.length > 1)
    || /campanha|multicanal|multi[-\s]?canal/i.test(agencyRequest.context || '');
}

function requiresVisualDirection(agencyRequest: AgencyRequest): boolean {
  return /visual|imagem|cena|storyboard|video|vídeo|reels|carrossel/i.test(agencyRequest.context || '');
}

// Constantes da tela de solicitação da Agência (extraídas de
// pages/adm/[id]/agency/[requestId].js — item 2 da refatoração).
// Apenas dados puros (labels, modelos, opções) — sem comportamento.

export const REQUEST_TYPE_LABELS = {
  social_post: 'Post social',
  carousel: 'Carrossel',
  short_video_script: 'Roteiro vídeo curto',
  email: 'E-mail',
  landing_page_copy: 'Copy de landing page',
};

export const CHANNEL_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  website: 'Website',
  paid_media: 'Mídia paga',
  other: 'Outro',
};

export const OBJECTIVE_LABELS = {
  awareness: 'Awareness',
  authority: 'Autoridade',
  lead_generation: 'Geração de leads',
  conversion: 'Conversão',
  launch: 'Lançamento',
  relationship: 'Relacionamento',
  retention: 'Retenção',
};

export const AGENCY_AGENT_ORDER = ['account_director', 'copywriter', 'channel_adapter', 'visual_director', 'editor', 'brand_compliance', 'approver'];

export const AI_MODELS = [
  { provider: 'mock', model_id: 'mock-model', display_name: 'Mock / Simulado', cost_tier: 'zero', is_mock: true },
  { provider: 'google', model_id: 'gemini-3.5-flash', display_name: 'Gemini 3.5 Flash', cost_tier: 'low', is_preview: true },
  { provider: 'openai', model_id: 'gpt-5.4', display_name: 'GPT-5.4', cost_tier: 'medium_high' },
  { provider: 'anthropic', model_id: 'claude-sonnet-4-6', display_name: 'Claude Sonnet 4.6', cost_tier: 'medium_high' },
];

export const REAL_AI_MODELS = AI_MODELS.filter((model) => !model.is_mock);

export const DEFAULT_AGENT_MODEL = {
  account_director: 'gpt-5.4',
  copywriter: 'claude-sonnet-4-6',
  channel_adapter: 'gemini-3.5-flash',
  visual_director: 'gpt-5.4',
  editor: 'claude-sonnet-4-6',
  brand_compliance: 'gpt-5.4',
  approver: 'gpt-5.4',
};

export const EXECUTION_MODE_OPTIONS = [
  { value: 'mock', label: 'Simular sem gastar tokens', description: 'Testa fluxo, banco, timeline e UI sem chamar IA real.' },
  { value: 'economical', label: 'Econômico', description: 'Usa modelo rápido/barato para testes com output real.' },
  { value: 'use_agent_defaults', label: 'Padrão por agente', description: 'Usa o modelo recomendado para cada agente.' },
  { value: 'use_single_model_for_run', label: 'Modelo único para toda a execução', description: 'Aplica o mesmo modelo em todos os steps desta execução.' },
  { value: 'override_single_agent', label: 'Personalizado por agente', description: 'Permite escolher modelo para agentes específicos da run.' },
];

export const CREATIVE_ASSET_TYPE_LABELS = {
  conceptual_image: 'Imagem conceitual',
  moodboard_reference: 'Referência de moodboard',
  background_image: 'Imagem de fundo',
  visual_prompt: 'Prompt visual',
  editable_art_reference: 'Referência para arte editável',
  final_art: 'Arte final',
};

export const CREATIVE_ASSET_STATUS_LABELS = {
  draft: 'Rascunho',
  generated: 'Gerado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  archived: 'Arquivado',
};

export const EMBEDDED_TEXT_REVIEW_WARNING = 'Imagens com texto embutido exigem revisão humana de ortografia, legibilidade, marca e claims.';

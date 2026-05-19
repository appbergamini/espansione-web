import type {
  AgencyAgentId,
  AgencyModelSelection,
  AIExecutionMode,
  AIModelRegistryItem,
} from '@espansione/types';

export const MOCK_MODEL_ID = 'mock-model';
export const ECONOMICAL_MODEL_ID = 'gemini-3-flash-preview';

export const AI_MODEL_REGISTRY: AIModelRegistryItem[] = [
  {
    provider: 'mock',
    model_id: MOCK_MODEL_ID,
    display_name: 'Mock / Simulado',
    description: 'Saída simulada para testar fluxo, banco, timeline e UI sem gastar tokens.',
    cost_tier: 'zero',
    speed_tier: 'instant',
    is_mock: true,
    is_active: true,
  },
  {
    provider: 'google',
    model_id: 'gemini-3-flash-preview',
    display_name: 'Gemini 3 Flash',
    description: 'Modelo rápido e econômico para testes com saída real.',
    cost_tier: 'low',
    speed_tier: 'fast',
    is_active: true,
    is_preview: true,
    recommended_for: ['channel_adapter'],
  },
  {
    provider: 'openai',
    model_id: 'gpt-5.4',
    display_name: 'GPT-5.4',
    description: 'Modelo padrão para raciocínio estratégico e checks de marca.',
    cost_tier: 'medium_high',
    speed_tier: 'medium',
    is_active: true,
    recommended_for: ['account_director', 'visual_director', 'brand_compliance', 'approver'],
  },
  {
    provider: 'anthropic',
    model_id: 'claude-sonnet-4-6',
    display_name: 'Claude Sonnet 4.6',
    description: 'Modelo recomendado para copy, edição e linguagem.',
    cost_tier: 'medium_high',
    speed_tier: 'medium',
    is_active: true,
    recommended_for: ['copywriter', 'editor'],
  },
];

const DEFAULT_AGENT_MODEL: Record<AgencyAgentId, string> = {
  account_director: 'gpt-5.4',
  copywriter: 'claude-sonnet-4-6',
  channel_adapter: 'gemini-3-flash-preview',
  visual_director: 'gpt-5.4',
  editor: 'claude-sonnet-4-6',
  brand_compliance: 'gpt-5.4',
  approver: 'gpt-5.4',
};

export function getAvailableAIModels(): AIModelRegistryItem[] {
  return AI_MODEL_REGISTRY.filter((model) => model.is_active);
}

export function getAIModelById(modelId?: string | null): AIModelRegistryItem | null {
  if (!modelId) return null;
  return getAvailableAIModels().find((model) => model.model_id === modelId) || null;
}

export function getDefaultModelForAgent(agentId: AgencyAgentId): AIModelRegistryItem {
  return requireModel(DEFAULT_AGENT_MODEL[agentId] || ECONOMICAL_MODEL_ID);
}

export function getEconomicalModelForAgent(_agentId: AgencyAgentId): AIModelRegistryItem {
  return requireModel(ECONOMICAL_MODEL_ID);
}

export function getDefaultAIExecutionMode(env = getRuntimeEnv()): AIExecutionMode {
  const configured = normalizeExecutionMode(process.env.DEFAULT_AI_EXECUTION_MODE || process.env.NEXT_PUBLIC_DEFAULT_AI_EXECUTION_MODE);
  if (configured) return configured;
  return env === 'production' ? 'use_agent_defaults' : 'mock';
}

export function getDefaultAgencyModelSelection(env = getRuntimeEnv()): AgencyModelSelection {
  return {
    execution_mode: getDefaultAIExecutionMode(env),
    max_tokens_per_step: 6000,
    require_confirmation_for_premium: true,
  };
}

export function resolveModelForAgencyStep({
  agentId,
  modelSelection,
}: {
  agentId: AgencyAgentId;
  modelSelection?: AgencyModelSelection | null;
}): AIModelRegistryItem {
  const selection = normalizeModelSelection(modelSelection);

  if (selection.execution_mode === 'mock') return requireModel(MOCK_MODEL_ID);
  if (selection.execution_mode === 'economical') return getEconomicalModelForAgent(agentId);
  if (selection.execution_mode === 'use_single_model_for_run') {
    return requireModel(selection.selected_model_id || ECONOMICAL_MODEL_ID);
  }
  if (selection.execution_mode === 'override_single_agent') {
    const override = selection.agent_overrides?.find((item) => item.agent_id === agentId);
    return override ? requireModel(override.model_id) : getDefaultModelForAgent(agentId);
  }

  return getDefaultModelForAgent(agentId);
}

export function validateModelSelection(selection?: AgencyModelSelection | null): string[] {
  const normalized = normalizeModelSelection(selection);
  const errors: string[] = [];

  if (normalized.selected_model_id && !getAIModelById(normalized.selected_model_id)) {
    errors.push(`Modelo selecionado inválido: ${normalized.selected_model_id}`);
  }

  if (normalized.execution_mode === 'use_single_model_for_run' && !normalized.selected_model_id) {
    errors.push('selected_model_id é obrigatório para usar um modelo único na run.');
  }

  for (const override of normalized.agent_overrides || []) {
    if (!override.agent_id) errors.push('Override de agente sem agent_id.');
    if (!getAIModelById(override.model_id)) errors.push(`Modelo de override inválido: ${override.model_id}`);
  }

  if (normalized.max_tokens_per_step !== undefined && Number(normalized.max_tokens_per_step) <= 0) {
    errors.push('max_tokens_per_step deve ser maior que zero.');
  }
  if (normalized.max_estimated_cost_per_run !== undefined && Number(normalized.max_estimated_cost_per_run) < 0) {
    errors.push('max_estimated_cost_per_run não pode ser negativo.');
  }

  return errors;
}

export function normalizeModelSelection(selection?: AgencyModelSelection | null, env = getRuntimeEnv()): AgencyModelSelection {
  const defaults = getDefaultAgencyModelSelection(env);
  const executionMode = normalizeExecutionMode(selection?.execution_mode) || defaults.execution_mode;
  return {
    ...defaults,
    ...selection,
    execution_mode: executionMode,
    agent_overrides: Array.isArray(selection?.agent_overrides) ? selection.agent_overrides : [],
    max_tokens_per_step: normalizePositiveInteger(selection?.max_tokens_per_step ?? defaults.max_tokens_per_step),
    max_estimated_cost_per_run: normalizeNonNegativeNumber(selection?.max_estimated_cost_per_run),
  };
}

function normalizeExecutionMode(value?: string | null): AIExecutionMode | null {
  return [
    'mock',
    'economical',
    'use_agent_defaults',
    'use_single_model_for_run',
    'override_single_agent',
  ].includes(String(value || ''))
    ? value as AIExecutionMode
    : null;
}

function requireModel(modelId: string): AIModelRegistryItem {
  const model = getAIModelById(modelId);
  if (!model) throw new Error(`Modelo de IA indisponível: ${modelId}`);
  return model;
}

function normalizePositiveInteger(value: unknown): number | undefined {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
  return Math.round(numeric);
}

function normalizeNonNegativeNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return undefined;
  return numeric;
}

function getRuntimeEnv() {
  return process.env.NODE_ENV || 'development';
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAIModelById,
  getDefaultAgencyModelSelection,
  getDefaultModelForAgent,
  getEconomicalModelForAgent,
  resolveModelForAgencyStep,
  validateModelSelection,
} from '../model-registry.ts';

test('modo mock resolve todos os agentes para mock-model', () => {
  const model = resolveModelForAgencyStep({
    agentId: 'copywriter',
    modelSelection: { execution_mode: 'mock' },
  });

  assert.equal(model.provider, 'mock');
  assert.equal(model.model_id, 'mock-model');
  assert.equal(model.is_mock, true);
});

test('modo economical usa Gemini 3.5 Flash', () => {
  const model = resolveModelForAgencyStep({
    agentId: 'approver',
    modelSelection: { execution_mode: 'economical' },
  });

  assert.equal(model.provider, 'google');
  assert.equal(model.model_id, 'gemini-3.5-flash');
});

test('use_agent_defaults usa modelo recomendado por agente', () => {
  assert.equal(getDefaultModelForAgent('account_director').model_id, 'gpt-5.4');
  assert.equal(getDefaultModelForAgent('copywriter').model_id, 'claude-sonnet-4-6');
  assert.equal(getDefaultModelForAgent('channel_adapter').model_id, 'gemini-3.5-flash');
});

test('use_single_model_for_run aplica o mesmo modelo em todos os steps', () => {
  const model = resolveModelForAgencyStep({
    agentId: 'brand_compliance',
    modelSelection: {
      execution_mode: 'use_single_model_for_run',
      selected_model_id: 'claude-sonnet-4-6',
    },
  });

  assert.equal(model.model_id, 'claude-sonnet-4-6');
});

test('override_single_agent aplica override apenas no agente escolhido', () => {
  const override = resolveModelForAgencyStep({
    agentId: 'editor',
    modelSelection: {
      execution_mode: 'override_single_agent',
      agent_overrides: [{ agent_id: 'editor', model_id: 'gemini-3.5-flash' }],
    },
  });
  const fallback = resolveModelForAgencyStep({
    agentId: 'approver',
    modelSelection: {
      execution_mode: 'override_single_agent',
      agent_overrides: [{ agent_id: 'editor', model_id: 'gemini-3.5-flash' }],
    },
  });

  assert.equal(override.model_id, 'gemini-3.5-flash');
  assert.equal(fallback.model_id, 'gpt-5.4');
});

test('registry retorna modelos ativos e valida seleção inválida', () => {
  assert.equal(getAIModelById('gpt-5.4')?.provider, 'openai');
  assert.deepEqual(validateModelSelection({
    execution_mode: 'use_single_model_for_run',
    selected_model_id: 'modelo-inexistente',
  }), [
    'Modelo selecionado inválido: modelo-inexistente',
  ]);
});

test('default em development/test é mock e produção usa defaults por agente', () => {
  assert.equal(getDefaultAgencyModelSelection('test').execution_mode, 'mock');
  assert.equal(getDefaultAgencyModelSelection('development').execution_mode, 'mock');
  assert.equal(getDefaultAgencyModelSelection('production').execution_mode, 'use_agent_defaults');
});

test('getEconomicalModelForAgent sempre retorna Gemini 3.5 Flash', () => {
  assert.equal(getEconomicalModelForAgent('visual_director').model_id, 'gemini-3.5-flash');
});


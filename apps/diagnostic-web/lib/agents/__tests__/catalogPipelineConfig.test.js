import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAgentConfigs } from '../catalog.js';

test('buildAgentConfigs deriva configuração estrutural do catálogo', () => {
  const configs = buildAgentConfigs({
    5: { optionalInputs: [6] },
  });

  assert.equal(configs[1].name, 'Roteiros VI — Entrevistas Internas');
  assert.equal(configs[1].stage, 'pre_diagnostico');
  assert.deepEqual(configs[13].inputs, [6, 7, 8, 9, 10, 11, 12]);
  assert.equal(configs[13].checkpoint, 4);
  assert.equal(configs[14].modular, true);
});

test('buildAgentConfigs mantém contexto opcional sem virar dependência', () => {
  const configs = buildAgentConfigs({
    5: { optionalInputs: [6] },
  });

  assert.deepEqual(configs[5].inputs, [2]);
  assert.deepEqual(configs[5].optionalInputs, [6]);
});

test('buildAgentConfigs separa inputs opcionais do catálogo', () => {
  const configs = buildAgentConfigs();

  assert.deepEqual(configs[15].inputs, [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(configs[15].optionalInputs, [14]);
  assert.deepEqual(configs[16].inputs, [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(configs[16].optionalInputs, [14]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { Agent_16_BrandMemoryExport } from '../Agent_16_BrandMemoryExport.js';
import { getAgenteByNum, podeExecutar } from '../catalog.js';
import {
  canPrepareBrandMemoryBeforeEditorial,
  getPrimaryAdminAction,
} from '../adminFlow.js';

const REQUIRED_BRAND_MEMORY_AGENTS = [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

test('Agente 16 fica disponivel sem Agente 15', () => {
  const result = podeExecutar(16, REQUIRED_BRAND_MEMORY_AGENTS);

  assert.equal(result.ok, true);
  assert.deepEqual(result.faltando, []);
});

test('Agente 15 continua disponivel sem EVP obrigatorio', () => {
  const result = podeExecutar(15, REQUIRED_BRAND_MEMORY_AGENTS);

  assert.equal(result.ok, true);
});

test('Agente 14 e dependencia opcional do Agente 16', () => {
  const agent16 = getAgenteByNum(16);

  assert.equal(agent16.inputs.includes(14), true);
  assert.equal(agent16.inputs_opcionais.includes(14), true);
  assert.equal(podeExecutar(16, [...REQUIRED_BRAND_MEMORY_AGENTS, 14]).ok, true);
});

test('Agente 16 instrui omitir EVP quando Agente 14 nao rodou', () => {
  const prompt = Agent_16_BrandMemoryExport.getUserPrompt({
    projeto: { id: 'project-1', cliente: 'Marca Teste' },
    previousOutputs: makePreviousOutputs(REQUIRED_BRAND_MEMORY_AGENTS),
  });

  assert.match(prompt, /Agente 14.*modular/i);
  assert.match(prompt, /omitir chave evp/i);
});

test('Agente 16 inclui bloco EVP quando Agente 14 existe', () => {
  const prompt = Agent_16_BrandMemoryExport.getUserPrompt({
    projeto: { id: 'project-1', cliente: 'Marca Teste' },
    previousOutputs: makePreviousOutputs([...REQUIRED_BRAND_MEMORY_AGENTS, 14]),
  });

  assert.match(prompt, /--- AGENTE 14/i);
  assert.match(prompt, /"agent_id":14/);
});

test('acao principal prioriza Brand Memory antes do Agente 15', () => {
  const action = getPrimaryAdminAction({
    pendingCheckpoint: null,
    nextAgent: 15,
    brandMemoryExportReady: true,
    brandMemoryExportValid: false,
    brandMemoryExportInvalid: false,
  });

  assert.equal(action.type, 'generate_brand_memory');
  assert.equal(action.agentNum, 16);
});

test('acao principal permite carregar Brand Memory valida antes do Agente 15', () => {
  const action = getPrimaryAdminAction({
    pendingCheckpoint: null,
    nextAgent: 15,
    brandMemoryExportReady: false,
    brandMemoryExportValid: true,
    brandMemoryExportInvalid: false,
  });

  assert.equal(action.type, 'load_brand_memory');
});

test('fluxo antigo segue valido quando Agente 15 ja existe', () => {
  const action = getPrimaryAdminAction({
    pendingCheckpoint: null,
    nextAgent: null,
    brandMemoryExportReady: true,
    brandMemoryExportValid: false,
    brandMemoryExportInvalid: false,
  });

  assert.equal(podeExecutar(16, [...REQUIRED_BRAND_MEMORY_AGENTS, 15]).ok, true);
  assert.equal(action.type, 'generate_brand_memory');
});

test('aviso editorial aparece quando Brand Memory pode ser preparada sem Agente 15', () => {
  assert.equal(
    canPrepareBrandMemoryBeforeEditorial({
      brandMemoryExportReady: true,
      brandMemoryExportValid: false,
      hasEditorialOutput: false,
    }),
    true
  );

  assert.equal(
    canPrepareBrandMemoryBeforeEditorial({
      brandMemoryExportReady: true,
      brandMemoryExportValid: false,
      hasEditorialOutput: true,
    }),
    false
  );
});

function makePreviousOutputs(agentNums) {
  return Object.fromEntries(agentNums.map((agentNum) => [
    agentNum,
    {
      conteudo: [
        '<brand_memory_export>',
        JSON.stringify({
          schema_version: '2.0',
          agent_id: agentNum,
          [`agent_${agentNum}`]: { ok: true },
        }),
        '</brand_memory_export>',
      ].join('\n'),
    },
  ]));
}

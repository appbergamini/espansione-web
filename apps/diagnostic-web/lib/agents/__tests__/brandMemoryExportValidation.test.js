import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertBrandMemoryExportsReadyForAgent16,
  BRAND_MEMORY_EXPORT_SLICES_BY_AGENT,
  buildBrandMemoryExportReadiness,
  REQUIRED_BRAND_MEMORY_EXPORT_AGENT_IDS,
  validateAgentBrandMemoryExport,
} from '../../brand-memory/exportValidation.js';

test('valida export de Brand Memory com slices esperados', () => {
  const result = validateAgentBrandMemoryExport({
    agentId: '6',
    outputContent: wrapExport({
      schema_version: '2.0',
      agent_id: 6,
      decodificacao: { sumario_estrategico: 'Direcao clara' },
    }),
    expectedSlices: ['decodificacao'],
  });

  assert.equal(result.status, 'valid');
  assert.deepEqual(result.found_slices, ['decodificacao']);
  assert.deepEqual(result.errors, []);
});

test('marca export ausente como missing para agente exportador', () => {
  const result = validateAgentBrandMemoryExport({
    agentId: '9',
    outputContent: '<conteudo>sem export</conteudo>',
    expectedSlices: ['plataforma_branding'],
  });

  assert.equal(result.status, 'missing');
  assert.deepEqual(result.missing_slices, ['plataforma_branding']);
});

test('marca JSON invalido como invalid', () => {
  const result = validateAgentBrandMemoryExport({
    agentId: '10',
    outputContent: '<brand_memory_export>{"schema_version":"2.0",</brand_memory_export>',
    expectedSlices: ['voice_profile'],
  });

  assert.equal(result.status, 'invalid');
  assert.equal(result.invalid_slices.includes('voice_profile'), true);
  assert.match(result.errors.join(' '), /JSON invalido/);
});

test('marca slice ausente como invalid', () => {
  const result = validateAgentBrandMemoryExport({
    agentId: '11',
    outputContent: wrapExport({
      schema_version: '2.0',
      agent_id: 11,
      outro_slice: { ok: true },
    }),
    expectedSlices: ['visual_identity'],
  });

  assert.equal(result.status, 'invalid');
  assert.deepEqual(result.missing_slices, ['visual_identity']);
});

test('aceita formato equivalente usado por agentes upstream atuais', () => {
  const result = validateAgentBrandMemoryExport({
    agentId: '6',
    outputContent: wrapExport({
      schema_version: '2.0',
      agent_id: 6,
      sumario_estrategico: 'Direcao estrategica',
      ida_consolidado: { impulsionadores: [{ description: 'Ativo' }] },
      de_para: [{ camada: 'marca', sair_de: 'A', ir_para: 'B' }],
    }),
    expectedSlices: ['decodificacao'],
  });

  assert.equal(result.status, 'warning');
  assert.deepEqual(result.found_slices, ['decodificacao']);
  assert.match(result.warnings.join(' '), /formato equivalente/);
});

test('agente sem necessidade de export nao quebra output legado', () => {
  const result = validateAgentBrandMemoryExport({
    agentId: '1',
    outputContent: '<conteudo>output antigo sem export</conteudo>',
  });

  assert.equal(result.status, 'not_applicable');
  assert.deepEqual(result.errors, []);
});

test('Agente 16 bloqueia quando export critico esta invalido', () => {
  const outputs = makeValidOutputs();
  outputs[6] = {
    agent_num: 6,
    conteudo: wrapExport({
      schema_version: '2.0',
      agent_id: 6,
      decodificacao: {},
    }),
    created_at: '2026-05-18T00:00:00.000Z',
  };

  assert.throws(
    () => assertBrandMemoryExportsReadyForAgent16(outputs),
    /Agente 16 bloqueado/,
  );
});

test('Agente 16 libera quando todos os exports obrigatorios estao validos', () => {
  const readiness = assertBrandMemoryExportsReadyForAgent16(makeValidOutputs());

  assert.equal(readiness.ready, true);
  assert.deepEqual(readiness.blockingItems, []);
});

test('readiness nao bloqueia EVP ausente quando fora do escopo', () => {
  const readiness = buildBrandMemoryExportReadiness(makeValidOutputs(), { includeEvp: false });

  const evp = readiness.items.find((item) => item.agent_num === 14);
  assert.equal(readiness.ready, true);
  assert.equal(evp.required, false);
  assert.equal(evp.blocking, false);
});

function makeValidOutputs() {
  return Object.fromEntries(REQUIRED_BRAND_MEMORY_EXPORT_AGENT_IDS.map((agentNum) => {
    const payload = {
      schema_version: '2.0',
      agent_id: agentNum,
    };
    for (const slice of BRAND_MEMORY_EXPORT_SLICES_BY_AGENT[agentNum]) {
      payload[slice] = slice.endsWith('sources') ? [{ title: 'Fonte' }] : { ok: true };
    }

    return [
      agentNum,
      {
        agent_num: agentNum,
        conteudo: wrapExport(payload),
        created_at: '2026-05-18T00:00:00.000Z',
      },
    ];
  }));
}

function wrapExport(payload) {
  return [
    '<conteudo>Conteudo editorial</conteudo>',
    '<brand_memory_export>',
    JSON.stringify(payload),
    '</brand_memory_export>',
  ].join('\n');
}

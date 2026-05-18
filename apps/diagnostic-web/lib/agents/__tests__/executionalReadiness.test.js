import test from 'node:test';
import assert from 'node:assert/strict';
import { Agent_06_VisaoGeral } from '../Agent_06_VisaoGeral.js';
import { extractExecutionalReadinessFromAgent6Output } from '../../executional-readiness/extract.js';

test('Agente 6 orienta export de executional_readiness sem tornar DISC obrigatorio', () => {
  const prompt = Agent_06_VisaoGeral.getSystemPrompt();

  assert.match(prompt, /executional_readiness/);
  assert.match(prompt, /DISC\/CIS NÃO são obrigatórios|DISC\/CIS são opcionais/);
  assert.match(prompt, /Não invente diagnóstico comportamental/);
});

test('extrai executional_readiness do brand_memory_export_json', () => {
  const readiness = extractExecutionalReadinessFromAgent6Output({
    agent_num: 6,
    brand_memory_export_json: {
      executional_readiness: {
        summary: 'Estratégia executável com apoio de rituais.',
        leadership_style_signals: ['Liderança técnica'],
        cultural_blockers: ['Centralização'],
        adoption_risks: ['Baixa adoção'],
        internal_alignment_level: 'medium',
        decision_profile_signals: ['Decisão concentrada'],
        behavioral_signals: ['CIS parcial'],
        capability_gaps: ['Governança'],
        implications_for_strategy: ['Ritualizar execução'],
        implications_for_communication: ['Evitar promessa de velocidade'],
        recommended_change_management_notes: ['Reunião semanal'],
        confidence_score: 68,
        source_basis: { forms: true, interviews: true, cis: true, disc: false },
      },
    },
  });

  assert.equal(readiness.summary, 'Estratégia executável com apoio de rituais.');
  assert.equal(readiness.internal_alignment_level, 'medium');
  assert.deepEqual(readiness.adoption_risks, ['Baixa adoção']);
  assert.equal(readiness.source_basis.cis, true);
});

test('executional_readiness inferido normaliza confiança e source_basis', () => {
  const readiness = extractExecutionalReadinessFromAgent6Output({
    agent_num: 6,
    conteudo: `<brand_memory_export>${JSON.stringify({
      executional_readiness: {
        summary: 'Inferido por entrevistas, sem CIS/DISC.',
        confidence_score: 130,
        source_basis: { interviews: true, inferred: true },
      },
    })}</brand_memory_export>`,
  });

  assert.equal(readiness.confidence_score, 100);
  assert.equal(readiness.source_basis.inferred, true);
  assert.deepEqual(readiness.cultural_blockers, []);
});

test('output legado sem executional_readiness nao quebra', () => {
  const readiness = extractExecutionalReadinessFromAgent6Output({
    agent_num: 6,
    conteudo: '<brand_memory_export>{"schema_version":"2.0","agent_id":6}</brand_memory_export>',
  });

  assert.equal(readiness, null);
});

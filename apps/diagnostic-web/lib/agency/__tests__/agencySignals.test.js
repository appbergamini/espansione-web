import test from 'node:test';
import assert from 'node:assert/strict';
import {
  archiveAgencySignal,
  buildSignalPayloadsFromStep,
  convertAgencySignalToLearningSuggestion,
  createAgencySignal,
  dismissAgencySignal,
  listAgencySignals,
  markAgencySignalReviewed,
  summarizeAgencySignalsBySlice,
} from '../agencySignals.js';
import { FakeSupabase } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('cria signal manual sem alterar Brand Memory', async () => {
  const originalMemory = { id: 'version-1', brand_id: 'brand-1', status: 'active', espansioneDiagnosticJson: { brand_name: 'Marca Teste' } };
  const db = makeSignalsDb({ brand_memory_versions: [structuredClone(originalMemory)] });

  const signal = await createAgencySignal(db, {
    brandId: 'brand-1',
    affectedSlice: 'voice_profile',
    signalType: 'tone_gap',
    severity: 'medium',
    title: 'Tom genérico',
    description: 'Copywriter precisou compensar voice_profile genérico.',
    evidence: ['Warning do copywriter.'],
    recommendation: 'Revisar exemplos de linguagem proprietária.',
  });

  assert.equal(signal.brand_id, 'brand-1');
  assert.equal(signal.status, 'open');
  assert.equal(signal.affected_slice, 'voice_profile');
  assert.deepEqual(db.tables.brand_memory_versions[0].espansioneDiagnosticJson, originalMemory.espansioneDiagnosticJson);
});

test('lista signals por marca e filtra por slice', async () => {
  const db = makeSignalsDb({
    agency_signals: [
      makeSignal({ id: 'signal-1', brand_id: 'brand-1', affected_slice: 'voice_profile', title: 'Voz' }),
      makeSignal({ id: 'signal-2', brand_id: 'brand-1', affected_slice: 'visual_identity', title: 'Visual' }),
      makeSignal({ id: 'signal-3', brand_id: 'brand-2', affected_slice: 'voice_profile', title: 'Outra marca' }),
    ],
  });

  const all = await listAgencySignals(db, 'brand-1');
  const filtered = await listAgencySignals(db, 'brand-1', { affectedSlice: 'voice_profile' });

  assert.equal(all.length, 2);
  assert.deepEqual(filtered.map((item) => item.id), ['signal-1']);
});

test('converte signal para learning suggestion sem duplicar Brand Memory', async () => {
  const originalMemory = { id: 'version-1', brand_id: 'brand-1', status: 'active', espansioneDiagnosticJson: { brand_name: 'Marca Teste' } };
  const db = makeSignalsDb({
    brand_memory_versions: [structuredClone(originalMemory)],
    agency_signals: [makeSignal({
      id: 'signal-1',
      signal_type: 'weak_proof',
      affected_slice: 'plataforma_branding',
      recommendation: 'Criar regra de claims com provas permitidas.',
    })],
  });

  const result = await convertAgencySignalToLearningSuggestion(db, 'signal-1');

  assert.equal(result.signal.status, 'converted_to_learning');
  assert.equal(result.suggestion.learning_type, 'claim_rule');
  assert.equal(result.suggestion.source_agency_signal_id, 'signal-1');
  assert.equal(db.tables.brand_learning_suggestions.length, 1);
  assert.deepEqual(db.tables.brand_memory_versions[0].espansioneDiagnosticJson, originalMemory.espansioneDiagnosticJson);
});

test('descarta, revisa e arquiva signal', async () => {
  const db = makeSignalsDb({
    agency_signals: [
      makeSignal({ id: 'signal-1' }),
      makeSignal({ id: 'signal-2' }),
      makeSignal({ id: 'signal-3' }),
    ],
  });

  const reviewed = await markAgencySignalReviewed(db, 'signal-1');
  const dismissed = await dismissAgencySignal(db, 'signal-2');
  const archived = await archiveAgencySignal(db, 'signal-3');

  assert.equal(reviewed.status, 'reviewed');
  assert.equal(dismissed.status, 'dismissed');
  assert.equal(archived.status, 'archived');
});

test('gera payloads de signals a partir de warnings de agentes', () => {
  const payloads = buildSignalPayloadsFromStep({
    run: { id: 'run-1', brand_id: 'brand-1', request_id: 'request-1' },
    request: { id: 'request-1', brand_id: 'brand-1' },
    step: { id: 'step-1', run_id: 'run-1', agent_id: 'approver' },
    output: { data: { warnings: ['Confirmar evidências antes da publicação.'] } },
    qualityAssessment: { quality_status: 'risky', quality_issues: ['Claim sem prova.'] },
  });

  assert.equal(payloads.length, 2);
  assert.equal(payloads[0].signalType, 'weak_proof');
  assert.equal(payloads[0].severity, 'high');
});

test('relatório por slice conta lacunas abertas e severidade', () => {
  const summary = summarizeAgencySignalsBySlice([
    makeSignal({ affected_slice: 'voice_profile', severity: 'high', status: 'open' }),
    makeSignal({ affected_slice: 'voice_profile', severity: 'medium', status: 'open' }),
    makeSignal({ affected_slice: 'visual_identity', severity: 'low', status: 'reviewed' }),
  ]);

  assert.equal(summary[0].affected_slice, 'voice_profile');
  assert.equal(summary[0].open, 2);
  assert.equal(summary[0].high, 1);
});

function makeSignalsDb(overrides = {}) {
  return new FakeSupabase({
    agency_signals: [],
    brand_learning_suggestions: [],
    agency_requests: [{
      id: 'request-1',
      brand_id: 'brand-1',
      request_type: 'social_post',
      channel: 'linkedin',
      objective: 'authority',
      context: 'Pedido',
    }],
    agency_runs: [{
      id: 'run-1',
      request_id: 'request-1',
      brand_id: 'brand-1',
      status: 'completed',
    }],
    brand_memory_versions: [],
    ...overrides,
  });
}

function makeSignal(overrides = {}) {
  return {
    id: 'signal-1',
    brand_id: 'brand-1',
    agency_run_id: 'run-1',
    agency_request_id: 'request-1',
    source_agent_id: 'approver',
    affected_slice: 'voice_profile',
    signal_type: 'tone_gap',
    severity: 'medium',
    title: 'Sinal',
    description: 'Descrição',
    evidence_json: ['Evidência'],
    recommendation: 'Recomendação',
    status: 'open',
    created_at: '2026-05-18T12:00:00.000Z',
    updated_at: '2026-05-18T12:00:00.000Z',
    ...overrides,
  };
}

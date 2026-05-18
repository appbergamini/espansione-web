import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approveLearningSuggestion,
  archiveLearningSuggestion,
  createLearningSuggestion,
  listLearningSuggestions,
  rejectLearningSuggestion,
} from '../learning.js';
import { FakeSupabase } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('cria sugestão de aprendizado manual por marca', async () => {
  const db = makeLearningDb();

  const suggestion = await createLearningSuggestion(db, {
    brandId: 'brand-1',
    learningType: 'voice_preference',
    content: 'Preferir frases curtas e diretas.',
    rationale: 'Copy aprovada teve melhor aderência.',
    confidenceScore: 82,
  });

  assert.equal(suggestion.brand_id, 'brand-1');
  assert.equal(suggestion.learning_type, 'voice_preference');
  assert.equal(suggestion.status, 'suggested');
  assert.equal(suggestion.confidence_score, 82);
});

test('cria sugestão a partir de run da Agência', async () => {
  const db = makeLearningDb();

  const suggestion = await createLearningSuggestion(db, {
    sourceAgencyRunId: 'run-1',
    learningType: 'campaign_learning',
    content: 'Pedidos de autoridade precisam trazer prova antes do CTA.',
  });

  assert.equal(suggestion.brand_id, 'brand-1');
  assert.equal(suggestion.source_agency_run_id, 'run-1');
  assert.equal(suggestion.source_agency_request_id, 'request-1');
});

test('aprova sugestão sem alterar Brand Memory', async () => {
  const originalMemory = { id: 'version-1', brand_id: 'brand-1', status: 'active', espansioneDiagnosticJson: { brand_name: 'Marca Teste' } };
  const db = makeLearningDb({
    brand_memory_versions: [structuredClone(originalMemory)],
    brand_learning_suggestions: [makeSuggestion({ id: 'learn-1' })],
  });

  const approved = await approveLearningSuggestion(db, 'learn-1');

  assert.equal(approved.status, 'approved_for_memory');
  assert.ok(approved.approved_at);
  assert.deepEqual(db.tables.brand_memory_versions[0].espansioneDiagnosticJson, originalMemory.espansioneDiagnosticJson);
  assert.equal(db.tables.brand_memory_versions.length, 1);
});

test('rejeita sugestão com motivo', async () => {
  const db = makeLearningDb({
    brand_learning_suggestions: [makeSuggestion({ id: 'learn-1' })],
  });

  const rejected = await rejectLearningSuggestion(db, 'learn-1', 'Aprendizado fraco para memória.');

  assert.equal(rejected.status, 'rejected');
  assert.equal(rejected.rejected_reason, 'Aprendizado fraco para memória.');
});

test('arquiva sugestão', async () => {
  const db = makeLearningDb({
    brand_learning_suggestions: [makeSuggestion({ id: 'learn-1' })],
  });

  const archived = await archiveLearningSuggestion(db, 'learn-1');

  assert.equal(archived.status, 'archived');
});

test('lista sugestões por marca e filtros', async () => {
  const db = makeLearningDb({
    brand_learning_suggestions: [
      makeSuggestion({ id: 'learn-1', brand_id: 'brand-1', learning_type: 'approved_cta', status: 'suggested', content: 'CTA aprovado' }),
      makeSuggestion({ id: 'learn-2', brand_id: 'brand-1', learning_type: 'visual_preference', status: 'approved_for_memory', content: 'Visual sóbrio' }),
      makeSuggestion({ id: 'learn-3', brand_id: 'brand-2', learning_type: 'approved_cta', status: 'suggested', content: 'Outra marca' }),
    ],
  });

  const all = await listLearningSuggestions(db, 'brand-1');
  const filtered = await listLearningSuggestions(db, 'brand-1', {
    learningType: 'approved_cta',
    status: 'suggested',
  });

  assert.equal(all.length, 2);
  assert.deepEqual(filtered.map((item) => item.id), ['learn-1']);
});

function makeLearningDb(overrides = {}) {
  return new FakeSupabase({
    brand_learning_suggestions: [],
    brand_library_items: [{
      id: 'library-1',
      brand_id: 'brand-1',
      source_agency_run_id: 'run-1',
      source_agency_request_id: 'request-1',
      title: 'Item de Biblioteca',
      plain_text: 'Referência.',
    }],
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

function makeSuggestion(overrides = {}) {
  return {
    id: 'learn-1',
    brand_id: 'brand-1',
    source_agency_run_id: null,
    source_agency_request_id: null,
    source_library_item_id: null,
    learning_type: 'campaign_learning',
    content: 'Aprendizado sugerido',
    rationale: 'Justificativa',
    confidence_score: 70,
    status: 'suggested',
    approved_at: null,
    rejected_reason: null,
    created_at: '2026-05-18T12:00:00.000Z',
    updated_at: '2026-05-18T12:00:00.000Z',
    ...overrides,
  };
}

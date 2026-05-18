import test from 'node:test';
import assert from 'node:assert/strict';
import {
  archiveBrandLibraryItem,
  listBrandLibraryItems,
  saveAgencyOutputToLibrary,
  useLibraryItemAsReference,
} from '../library.js';
import { FakeSupabase } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('salva output aprovado na Biblioteca', async () => {
  const db = makeLibraryDb();

  const item = await saveAgencyOutputToLibrary(db, 'run-1', 'approved_copy', {
    sourceStepId: 'step-copy',
    notes: 'Boa referência de tom.',
    tags: ['positivo', 'copy'],
  });

  assert.equal(item.brand_id, 'brand-1');
  assert.equal(item.source_agency_run_id, 'run-1');
  assert.equal(item.source_agency_step_id, 'step-copy');
  assert.equal(item.source_agency_request_id, 'request-1');
  assert.equal(item.item_type, 'approved_copy');
  assert.equal(item.status, 'active');
  assert.match(item.plain_text, /Copy aprovada/);
});

test('salva output rejeitado como exemplo negativo', async () => {
  const db = makeLibraryDb();

  const item = await saveAgencyOutputToLibrary(db, 'run-1', 'negative_example', {
    sourceStepId: 'step-approver',
    notes: 'Não repetir este risco.',
  });

  assert.equal(item.item_type, 'negative_example');
  assert.match(item.plain_text, /Claim sem prova/);
  assert.equal(item.notes, 'Não repetir este risco.');
});

test('lista biblioteca por marca e filtra por canal/tipo', async () => {
  const db = makeLibraryDb({
    brand_library_items: [
      makeLibraryItem({ id: 'item-1', brand_id: 'brand-1', item_type: 'approved_copy', channel: 'linkedin' }),
      makeLibraryItem({ id: 'item-2', brand_id: 'brand-1', item_type: 'approved_visual_direction', channel: 'instagram' }),
      makeLibraryItem({ id: 'item-3', brand_id: 'brand-2', item_type: 'approved_copy', channel: 'linkedin' }),
    ],
  });

  const allBrandItems = await listBrandLibraryItems(db, 'brand-1');
  const filtered = await listBrandLibraryItems(db, 'brand-1', {
    itemType: 'approved_copy',
    channel: 'linkedin',
  });

  assert.equal(allBrandItems.length, 2);
  assert.deepEqual(filtered.map((item) => item.id), ['item-1']);
});

test('arquiva item da biblioteca', async () => {
  const db = makeLibraryDb({
    brand_library_items: [makeLibraryItem({ id: 'item-1', brand_id: 'brand-1' })],
  });

  const item = await archiveBrandLibraryItem(db, 'item-1');

  assert.equal(item.status, 'archived');
  assert.equal(db.tables.brand_library_items[0].status, 'archived');
});

test('usa item da biblioteca como referencia em novo pedido', async () => {
  const db = makeLibraryDb({
    brand_library_items: [
      makeLibraryItem({
        id: 'item-1',
        brand_id: 'brand-1',
        item_type: 'approved_copy',
        title: 'Post de autoridade',
        plain_text: 'Referência útil de copy.',
      }),
    ],
    agency_requests: [
      makeRequest({ id: 'request-1', reference_material: [] }),
      makeRequest({ id: 'request-2', context: 'Novo pedido', reference_material: ['Referência já existente'] }),
    ],
  });

  const result = await useLibraryItemAsReference(db, 'item-1', 'request-2');

  assert.equal(result.request.reference_material.length, 2);
  assert.match(result.request.reference_material[1], /Biblioteca da Marca/);
  assert.match(result.request.reference_material[1], /Referência útil de copy/);
});

function makeLibraryDb(overrides = {}) {
  return new FakeSupabase({
    brand_library_items: [],
    agency_requests: [makeRequest()],
    agency_runs: [{
      id: 'run-1',
      request_id: 'request-1',
      brand_id: 'brand-1',
      status: 'completed',
      created_at: '2026-05-18T12:00:00.000Z',
    }],
    agency_steps: [
      {
        id: 'step-copy',
        run_id: 'run-1',
        agent_id: 'copywriter',
        status: 'completed',
        is_current: true,
        output: {
          agentId: 'copywriter',
          data: {
            headline: 'Headline aprovada',
            copy_principal: 'Copy aprovada para repertório.',
            cta: 'Agendar conversa',
            variacoes: ['Variação A'],
          },
        },
        created_at: '2026-05-18T12:00:01.000Z',
      },
      {
        id: 'step-approver',
        run_id: 'run-1',
        agent_id: 'approver',
        status: 'completed',
        is_current: true,
        output: {
          agentId: 'approver',
          data: {
            decisao: 'rejected',
            justificativa: 'Claim sem prova não pode ser publicado.',
            risco_principal: 'Claim sem prova.',
            ajustes_obrigatorios: ['Remover promessa forte.'],
          },
        },
        created_at: '2026-05-18T12:00:02.000Z',
      },
    ],
    ...overrides,
  });
}

function makeRequest(overrides = {}) {
  return {
    id: 'request-1',
    brand_id: 'brand-1',
    request_type: 'social_post',
    channel: 'linkedin',
    objective: 'authority',
    audience_cluster: 'Decisores',
    context: 'Pedido original',
    reference_material: [],
    status: 'approved',
    ...overrides,
  };
}

function makeLibraryItem(overrides = {}) {
  return {
    id: 'item-1',
    brand_id: 'brand-1',
    source_agency_run_id: 'run-1',
    source_agency_step_id: 'step-copy',
    source_agency_request_id: 'request-1',
    item_type: 'approved_copy',
    status: 'active',
    title: 'Item de biblioteca',
    content_json: {},
    plain_text: 'Texto de referência',
    tags: [],
    channel: 'linkedin',
    request_type: 'social_post',
    objective: 'authority',
    audience_cluster: 'Decisores',
    notes: '',
    created_at: '2026-05-18T12:00:00.000Z',
    updated_at: '2026-05-18T12:00:00.000Z',
    ...overrides,
  };
}

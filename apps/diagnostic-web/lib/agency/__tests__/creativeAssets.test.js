import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMBEDDED_TEXT_REVIEW_WARNING,
  approveCreativeAsset,
  attachCreativeAssetToRun,
  createCreativeAsset,
  createVisualPromptAssetFromStep,
  listCreativeAssetsByBrand,
  listCreativeAssetsByRun,
  rejectCreativeAsset,
} from '../creativeAssets.js';
import { FakeSupabase, makeDiagnostic } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('cria ativo visual', async () => {
  const db = makeCreativeAssetDb();

  const asset = await createCreativeAsset(db, {
    brandId: 'brand-1',
    agencyRequestId: 'request-1',
    assetType: 'conceptual_image',
    title: 'Imagem conceitual',
    prompt: 'Cena institucional sem texto.',
  });

  assert.equal(asset.brand_id, 'brand-1');
  assert.equal(asset.agency_request_id, 'request-1');
  assert.equal(asset.asset_type, 'conceptual_image');
  assert.equal(asset.status, 'draft');
});

test('vincula ativo a uma run', async () => {
  const db = makeCreativeAssetDb({
    creative_assets: [
      makeAsset({ id: 'asset-1', brand_id: 'brand-1', agency_run_id: null, agency_request_id: null }),
    ],
  });

  const asset = await attachCreativeAssetToRun(db, 'asset-1', 'run-1');

  assert.equal(asset.agency_run_id, 'run-1');
  assert.equal(asset.agency_request_id, 'request-1');
});

test('aprova ativo visual', async () => {
  const db = makeCreativeAssetDb({
    creative_assets: [makeAsset({ id: 'asset-1', status: 'generated' })],
  });

  const asset = await approveCreativeAsset(db, 'asset-1', 'Revisado pelo admin.');

  assert.equal(asset.status, 'approved');
  assert.match(asset.review_notes, /Revisado/);
});

test('rejeita ativo visual', async () => {
  const db = makeCreativeAssetDb({
    creative_assets: [makeAsset({ id: 'asset-1', status: 'generated' })],
  });

  const asset = await rejectCreativeAsset(db, 'asset-1', 'Texto ilegível.');

  assert.equal(asset.status, 'rejected');
  assert.equal(asset.review_notes, 'Texto ilegível.');
});

test('marca revisão obrigatória quando imagem tem texto embutido', async () => {
  const db = makeCreativeAssetDb();

  const asset = await createCreativeAsset(db, {
    brandId: 'brand-1',
    assetType: 'final_art',
    title: 'Arte com texto',
    hasEmbeddedText: true,
    status: 'generated',
  });
  const approved = await approveCreativeAsset(db, asset.id, 'Ortografia conferida.');

  assert.equal(asset.has_embedded_text, true);
  assert.equal(asset.text_review_required, true);
  assert.ok(approved.metadata_json.warnings.includes(EMBEDDED_TEXT_REVIEW_WARNING));
});

test('prompt_visual_opcional vira creative asset', async () => {
  const db = makeCreativeAssetDb();

  const asset = await createVisualPromptAssetFromStep(db, 'run-1', 'step-visual');

  assert.equal(asset.asset_type, 'visual_prompt');
  assert.equal(asset.agency_run_id, 'run-1');
  assert.equal(asset.source_step_id, 'step-visual');
  assert.match(asset.prompt, /fotografia editorial/);
});

test('lista ativos por marca e run', async () => {
  const db = makeCreativeAssetDb({
    creative_assets: [
      makeAsset({ id: 'asset-1', brand_id: 'brand-1', agency_run_id: 'run-1', asset_type: 'conceptual_image' }),
      makeAsset({ id: 'asset-2', brand_id: 'brand-1', agency_run_id: 'run-2', asset_type: 'visual_prompt' }),
      makeAsset({ id: 'asset-3', brand_id: 'brand-2', agency_run_id: 'run-3', asset_type: 'conceptual_image' }),
    ],
  });

  const byBrand = await listCreativeAssetsByBrand(db, 'brand-1');
  const byRun = await listCreativeAssetsByRun(db, 'run-1');

  assert.equal(byBrand.length, 2);
  assert.deepEqual(byRun.map((asset) => asset.id), ['asset-1']);
});

test('aprovar ativo não altera Brand Memory', async () => {
  const diagnostic = makeDiagnostic();
  const db = makeCreativeAssetDb({
    brand_memory_versions: [{
      id: 'version-1',
      brand_id: 'brand-1',
      version_number: 1,
      status: 'active',
      espansione_diagnostic_json: structuredClone(diagnostic),
    }],
    creative_assets: [makeAsset({ id: 'asset-1', status: 'generated' })],
  });
  const before = JSON.stringify(db.tables.brand_memory_versions);

  await approveCreativeAsset(db, 'asset-1', 'Pode usar como referência visual.');

  assert.equal(JSON.stringify(db.tables.brand_memory_versions), before);
});

function makeCreativeAssetDb(overrides = {}) {
  return new FakeSupabase({
    creative_assets: [],
    brand_memory_versions: [],
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
        id: 'step-visual',
        run_id: 'run-1',
        agent_id: 'visual_director',
        status: 'completed',
        is_current: true,
        output: {
          agentId: 'visual_director',
          data: {
            direcao_de_arte: 'Imagem sóbria e institucional.',
            composicao: 'Personagem em primeiro plano.',
            estilo_imagem: 'fotografia editorial',
            prompt_visual_opcional: 'fotografia editorial, luz dramática, sem texto, sem logo',
          },
        },
        created_at: '2026-05-18T12:00:01.000Z',
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
    channel: 'instagram',
    objective: 'authority',
    audience_cluster: 'Decisores',
    context: 'Pedido original',
    reference_material: [],
    status: 'approved',
    ...overrides,
  };
}

function makeAsset(overrides = {}) {
  return {
    id: 'asset-1',
    brand_id: 'brand-1',
    agency_request_id: 'request-1',
    agency_run_id: 'run-1',
    source_step_id: 'step-visual',
    asset_type: 'conceptual_image',
    status: 'generated',
    title: 'Ativo visual',
    prompt: 'Prompt',
    negative_prompt: null,
    file_url: null,
    metadata_json: {},
    has_embedded_text: false,
    text_review_required: false,
    review_notes: null,
    created_at: '2026-05-18T12:00:00.000Z',
    updated_at: '2026-05-18T12:00:00.000Z',
    ...overrides,
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertActiveBrandMemoryVersion,
  createInitialAgencyRun,
  createInitialAgencyStep,
} from '../runPersistence.js';
import {
  approveAgencyBriefing,
  assertBriefingApproved,
  requestAgencyBriefingRevision,
} from '../briefingApproval.js';
import { markProjectBrandMemoryActive } from '../projectLifecycle.js';
import { FakeSupabase } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('AgencyRun registra brand_memory_version_id e snapshot do BrandKernel', async () => {
  const db = new FakeSupabase({
    agency_requests: [],
    agency_runs: [],
    agency_steps: [],
  });
  const request = {
    id: 'request-1',
    brand_id: 'brand-1',
  };
  const brandKernel = {
    brand: { name: 'Marca Teste' },
    source: { schemaVersion: '2.0' },
  };
  const brandMemoryVersion = {
    id: 'version-1',
    status: 'active',
  };

  const run = await createInitialAgencyRun(db, { request, brandKernel, brandMemoryVersion });
  const step = await createInitialAgencyStep(db, {
    run,
    stepInput: { brandKernel, agencyRequest: { id: request.id }, promptPack: {} },
  });

  assert.equal(run.brand_memory_version_id, 'version-1');
  assert.equal(run.status, 'pending');
  assert.equal(step.status, 'pending');
  assert.equal(step.prompt_version, 'account_director_v1');
  assert.equal(step.input.brandKernel.brand.name, 'Marca Teste');
  assert.equal(db.tables.agency_runs[0].brand_kernel_snapshot.brand.name, 'Marca Teste');
});

test('AgencyRun e bloqueada sem Brand Memory ativa', async () => {
  assert.throws(
    () => assertActiveBrandMemoryVersion(null, { status: 'not_ready' }),
    /Nenhuma versão ativa válida/
  );
});

test('marca projeto como brand_memory_active quando Brand Memory e ativada', async () => {
  const db = new FakeSupabase({
    projetos: [{
      id: 'projeto-1',
      lifecycle_status: 'brand_memory_ready_to_load',
    }],
  });

  const projeto = await markProjectBrandMemoryActive(db, 'projeto-1');

  assert.equal(projeto.lifecycle_status, 'brand_memory_active');
  assert.equal(db.tables.projetos[0].lifecycle_status, 'brand_memory_active');
});

test('pedido sem briefing aprovado bloqueia agentes criativos', async () => {
  const db = new FakeSupabase({
    agency_requests: [{
      id: 'request-1',
      status: 'draft',
      approved_briefing_json: null,
    }],
  });

  await assert.rejects(
    () => assertBriefingApproved(db, 'request-1'),
    /Briefing operacional precisa ser aprovado/
  );
});

test('briefing gerado mas nao aprovado continua bloqueando criacao', async () => {
  const db = new FakeSupabase({
    agency_requests: [{
      id: 'request-1',
      status: 'briefing_generated',
      briefing_original_json: makeBriefing('Original'),
      approved_briefing_json: null,
    }],
  });

  await assert.rejects(
    () => assertBriefingApproved(db, 'request-1'),
    /Briefing operacional precisa ser aprovado/
  );
});

test('briefing aprovado libera criacao', async () => {
  const briefing = makeBriefing('Aprovado');
  const db = new FakeSupabase({
    agency_requests: [{
      id: 'request-1',
      status: 'briefing_approved',
      approved_briefing_json: briefing,
    }],
  });

  const result = await assertBriefingApproved(db, 'request-1');

  assert.equal(result.approvedBriefing.briefing_operacional.objetivo, 'Aprovado');
});

test('edicao manual salva approved_briefing_json e status briefing_approved', async () => {
  const original = makeBriefing('Original');
  const edited = makeBriefing('Editado pelo admin');
  const db = new FakeSupabase({
    agency_requests: [{
      id: 'request-1',
      status: 'briefing_generated',
      briefing_original_json: original,
      approved_briefing_json: null,
    }],
    agency_runs: [{
      id: 'run-1',
      request_id: 'request-1',
      created_at: '2026-05-18T12:00:00.000Z',
      agency_steps: [{
        id: 'step-1',
        agent_id: 'account_director',
        output: { agentId: 'account_director', data: original },
      }],
    }],
  });

  const request = await approveAgencyBriefing(db, 'request-1', {
    editedBriefing: edited,
    approvedBy: 'admin-1',
  });

  assert.equal(request.status, 'briefing_approved');
  assert.equal(request.briefing_source, 'admin_edited');
  assert.equal(request.approved_briefing_json.briefing_operacional.objetivo, 'Editado pelo admin');
  assert.equal(request.briefing_approved_by, 'admin-1');
});

test('pedido de revisao muda status e registra motivo', async () => {
  const db = new FakeSupabase({
    agency_requests: [{
      id: 'request-1',
      status: 'briefing_generated',
      briefing_original_json: makeBriefing('Original'),
    }],
  });

  const request = await requestAgencyBriefingRevision(db, 'request-1', 'A promessa precisa ser mais concreta.');

  assert.equal(request.status, 'briefing_revision_requested');
  assert.equal(request.briefing_revision_reason, 'A promessa precisa ser mais concreta.');
});

function makeBriefing(objetivo) {
  return {
    briefing_operacional: {
      objetivo,
      publico: 'Decisores',
      contexto: 'Contexto',
      insight: 'Insight',
      promessa: 'Promessa',
      mensagem_central: 'Mensagem central',
      tom_recomendado: 'Claro',
      canal: 'linkedin',
      formato: 'social_post',
      criterio_de_sucesso: ['Coerencia'],
    },
    hipotese_criativa: {
      conceito: 'Conceito',
      angulo: 'Angulo',
      narrativa: 'Narrativa',
    },
    criterios_de_sucesso: ['Coerencia'],
    brand_memory_slices_used: ['decodificacao'],
    warnings: [],
  };
}

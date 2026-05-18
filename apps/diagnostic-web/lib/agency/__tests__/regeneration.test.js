import test from 'node:test';
import assert from 'node:assert/strict';
import { MockModelGateway } from '../modelGateway.js';
import {
  createAgencyRunVariation,
  regenerateAgencyStep,
  runAgencyWorkflow,
} from '../workflow.js';
import { FakeSupabase } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('regenerar copywriter cria nova versao e exige novo editor/approver', async () => {
  const db = makeAgencyDb();
  await runAgencyWorkflow(db, 'request-1', new MockModelGateway());

  await regenerateAgencyStep(db, 'run-1', 'copywriter', new MockModelGateway());

  const copySteps = db.tables.agency_steps.filter((step) => step.agent_id === 'copywriter');
  const oldCopy = copySteps.find((step) => step.version_number === 1);
  const newCopy = copySteps.find((step) => step.version_number === 2);
  const oldEditor = db.tables.agency_steps.find((step) => step.agent_id === 'editor' && step.version_number === 1);
  const oldApprover = db.tables.agency_steps.find((step) => step.agent_id === 'approver' && step.version_number === 1);

  assert.equal(copySteps.length, 2);
  assert.equal(oldCopy.is_current, false);
  assert.equal(oldCopy.status, 'regenerated');
  assert.equal(newCopy.is_current, true);
  assert.equal(newCopy.status, 'completed');
  assert.equal(oldEditor.is_current, false);
  assert.equal(oldEditor.status, 'skipped');
  assert.equal(oldApprover.is_current, false);
  assert.equal(oldApprover.status, 'skipped');
  assert.ok(oldCopy.output?.data?.copy_principal);
});

test('regenerar editor exige novo approver', async () => {
  const db = makeAgencyDb();
  await runAgencyWorkflow(db, 'request-1', new MockModelGateway());

  await regenerateAgencyStep(db, 'run-1', 'editor', new MockModelGateway());

  const editorSteps = db.tables.agency_steps.filter((step) => step.agent_id === 'editor');
  const oldApprover = db.tables.agency_steps.find((step) => step.agent_id === 'approver' && step.version_number === 1);

  assert.equal(editorSteps.length, 2);
  assert.equal(editorSteps.find((step) => step.version_number === 2).status, 'completed');
  assert.equal(oldApprover.is_current, false);
  assert.equal(oldApprover.status, 'skipped');
});

test('regenerar account_director exige nova aprovacao do briefing', async () => {
  const db = makeAgencyDb();
  await runAgencyWorkflow(db, 'request-1', new MockModelGateway());

  await regenerateAgencyStep(db, 'run-1', 'account_director', new MockModelGateway());

  const request = db.tables.agency_requests.find((row) => row.id === 'request-1');
  const downstream = db.tables.agency_steps.filter((step) => (
    ['copywriter', 'visual_director', 'editor', 'approver'].includes(step.agent_id)
  ));

  assert.equal(request.status, 'briefing_generated');
  assert.equal(request.approved_briefing_json, null);
  assert.ok(request.briefing_original_json?.briefing_operacional);
  assert.equal(downstream.every((step) => step.is_current === false), true);
});

test('variação mantém relação com run original e copia briefing', async () => {
  const db = makeAgencyDb();
  await runAgencyWorkflow(db, 'request-1', new MockModelGateway());

  const result = await createAgencyRunVariation(db, 'run-1', 'Opção B');

  assert.equal(result.run.parent_run_id, 'run-1');
  assert.equal(result.run.branch_label, 'Opção B');
  assert.equal(result.step.parent_step_id, 'step-account');
  assert.equal(result.step.agent_id, 'account_director');
  assert.equal(result.step.status, 'completed');
  assert.ok(result.step.output?.data?.briefing_operacional);
});

function makeAgencyDb() {
  const approvedBriefing = makeBriefing('Briefing aprovado');
  return new FakeSupabase({
    agency_requests: [{
      id: 'request-1',
      brand_id: 'brand-1',
      request_type: 'social_post',
      channel: 'linkedin',
      objective: 'authority',
      context: 'Contexto do pedido',
      desired_cta: 'Agendar conversa',
      status: 'briefing_approved',
      briefing_original_json: approvedBriefing,
      approved_briefing_json: approvedBriefing,
    }],
    agency_runs: [{
      id: 'run-1',
      request_id: 'request-1',
      brand_id: 'brand-1',
      brand_memory_version_id: 'version-1',
      brand_kernel_snapshot: makeBrandKernel(),
      brand_kernel_version: '2.0',
      branch_label: 'Original',
      status: 'pending',
      created_at: '2026-05-18T12:00:00.000Z',
    }],
    agency_steps: [{
      id: 'step-account',
      run_id: 'run-1',
      agent_id: 'account_director',
      input: {
        brandKernel: makeBrandKernel(),
        agencyRequest: makeAgencyRequest(),
        promptPack: { systemPrompt: 'system', userPrompt: 'user', expectedOutputSchema: {} },
      },
      output: { agentId: 'account_director', data: approvedBriefing },
      status: 'completed',
      version_number: 1,
      is_current: true,
      created_at: '2026-05-18T12:00:01.000Z',
    }],
  });
}

function makeAgencyRequest() {
  return {
    id: 'request-1',
    brandId: 'brand-1',
    requestType: 'social_post',
    channel: 'linkedin',
    objective: 'authority',
    context: 'Contexto do pedido',
    desiredCta: 'Agendar conversa',
  };
}

function makeBrandKernel() {
  return {
    brand: { name: 'Marca Teste', slug: 'marca-teste', industry: 'Serviços' },
    strategy: {
      purpose: 'Clareza estratégica',
      archetype: 'Sábio',
      positioning: 'Marca de autoridade',
      tagline: 'Clareza que move',
      directives: ['Manter coerência'],
      dePara: [],
      values: ['Clareza'],
      attributes: ['Consistente'],
    },
    audience: {
      personas: ['Decisor'],
      clusters: ['Empresas médias'],
      journeyStages: ['conhecimento'],
      brandMoments: ['diagnóstico'],
    },
    voice: { tones: ['claro'], territories: ['estratégia'], forbiddenWords: [], naming: [] },
    visual: {
      keep: ['contraste'],
      lose: [],
      gain: ['nitidez'],
      colors: ['#000000'],
      typography: ['sans'],
      photography: null,
      behavior: null,
      symbol: null,
    },
    communication: {
      waves: ['autoridade'],
      channels: ['linkedin'],
      differentials: ['método'],
      proprietaryAsset: null,
      risk: null,
    },
    constraints: [],
    proofPoints: ['Método validado'],
    forbiddenClaims: [],
    preferredCTAs: ['Agendar conversa'],
    channelGuidelines: ['LinkedIn com clareza'],
    source: { schemaVersion: '2.0', agentsPresent: [6, 9, 12, 13], generatedFrom: 'espansione_diagnostic' },
  };
}

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
      criterio_de_sucesso: ['Coerência'],
    },
    hipotese_criativa: {
      conceito: 'Conceito',
      angulo: 'Ângulo',
      narrativa: 'Narrativa',
    },
    criterios_de_sucesso: ['Coerência'],
    brand_memory_slices_used: ['decodificacao', 'plataforma_branding', 'experiencia', 'plano_comunicacao'],
    warnings: [],
  };
}

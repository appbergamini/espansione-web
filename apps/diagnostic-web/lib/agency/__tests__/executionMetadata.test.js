import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOutputQualityAssessment,
  buildStepExecutionMetadata,
  calculateAgencyRunExecutionSummary,
  getTechnicalExecutionStatus,
} from '../executionMetadata.js';
import { runAgencyWorkflow } from '../workflow.js';
import { FakeSupabase } from '../../../../../packages/brand-memory/src/__tests__/fake-supabase.ts';

test('metadata padronizado de step normaliza tokens e erro', () => {
  const metadata = buildStepExecutionMetadata({
    provider: 'openai',
    model: 'gpt-5.4',
    promptVersion: 'copywriter_v1',
    tokens: { input: 10, output: 15 },
    estimatedCost: 0.002,
    durationMs: 1234,
    attemptCount: 2,
    temperature: 0.2,
    error: new Error('Falha controlada'),
  });

  assert.equal(metadata.provider, 'openai');
  assert.equal(metadata.prompt_version, 'copywriter_v1');
  assert.equal(metadata.input_tokens, 10);
  assert.equal(metadata.output_tokens, 15);
  assert.equal(metadata.total_tokens, 25);
  assert.equal(metadata.estimated_cost, 0.002);
  assert.equal(metadata.duration_ms, 1234);
  assert.equal(metadata.attempt_count, 2);
  assert.equal(metadata.error_message, 'Falha controlada');
});

test('agregados da run calculam steps, custo, tokens e duração', () => {
  const summary = calculateAgencyRunExecutionSummary([
    { status: 'completed', tokens: { input: 10, output: 20, total: 30 }, cost_estimate: 0.01, duration_ms: 100 },
    { status: 'failed', tokens: { input: 3, output: 0, total: 3 }, cost_estimate: 0.001, duration_ms: 50 },
    { status: 'skipped', tokens: { input: 999, output: 999, total: 1998 }, cost_estimate: 9, duration_ms: 999 },
  ]);

  assert.equal(summary.total_steps, 2);
  assert.equal(summary.completed_steps, 1);
  assert.equal(summary.failed_steps, 1);
  assert.equal(summary.total_tokens, 33);
  assert.equal(summary.estimated_cost_total, 0.011);
  assert.equal(summary.duration_ms_total, 150);
});

test('separa falha técnica de qualidade do output', () => {
  assert.equal(getTechnicalExecutionStatus({ status: 'failed' }), 'failed');
  assert.equal(getTechnicalExecutionStatus({ status: 'completed', technical_status: 'completed' }), 'completed');

  const assessment = buildOutputQualityAssessment({
    agentId: 'editor',
    output: {
      data: {
        score_aderencia: 58,
        riscos_de_incoerencia: ['Copy genérica e desalinhada com a promessa.'],
        warnings: [],
      },
    },
    assessedAt: '2026-05-18T12:00:00.000Z',
  });

  assert.equal(assessment.quality_status, 'needs_revision');
  assert.equal(assessment.quality_score, 58);
  assert.equal(assessment.assessed_by, 'system');
});

test('marca output concluído como arriscado quando há claim sem sustentação', () => {
  const assessment = buildOutputQualityAssessment({
    agentId: 'approver',
    output: {
      data: {
        decisao: 'revision_requested',
        checklist: [{ criterio: 'Claims com prova', status: 'warning', observacao: 'Confirmar evidências antes da publicação.' }],
        ajustes_obrigatorios: ['Remover claim sem prova.'],
        justificativa: 'Há risco de evidência.',
      },
    },
    assessedAt: '2026-05-18T12:00:00.000Z',
  });

  assert.equal(assessment.quality_status, 'risky');
  assert.equal(assessment.evidence_risk_score, 85);
});

test('brand_compliance converte decisão e violações em quality_assessment', () => {
  const assessment = buildOutputQualityAssessment({
    agentId: 'brand_compliance',
    output: {
      data: {
        decision: 'fail',
        overall_brand_alignment_score: 34,
        checklist: [{ criterion: 'claims', status: 'fail', observation: 'Claim sem prova.' }],
        violations: [{
          type: 'claim_without_proof',
          description: 'Claim forte sem evidência.',
          severity: 'high',
          suggested_fix: 'Remover claim ou adicionar prova.',
        }],
        required_adjustments: ['Remover claim sem prova.'],
        warnings: [],
      },
    },
    assessedAt: '2026-05-18T12:00:00.000Z',
  });

  assert.equal(assessment.quality_status, 'rejected');
  assert.equal(assessment.quality_score, 34);
  assert.equal(assessment.evidence_risk_score, 85);
  assert.equal(assessment.assessed_by, 'agent');
});

test('quality_assessment explícito é normalizado e preservado', () => {
  const assessment = buildOutputQualityAssessment({
    agentId: 'editor',
    output: {
      data: {
        quality_assessment: {
          quality_status: 'acceptable',
          quality_score: 105,
          quality_issues: ['ok'],
          assessed_by: 'agent',
        },
      },
    },
    assessedAt: '2026-05-18T12:00:00.000Z',
  });

  assert.equal(assessment.quality_status, 'acceptable');
  assert.equal(assessment.quality_score, 100);
  assert.equal(assessment.assessed_by, 'agent');
});

test('agency step salva metadata de execução e prompt_version', async () => {
  const db = makeAgencyDb();
  await runAgencyWorkflow(db, 'request-1', new InstrumentedGateway(), { modelSelection: { execution_mode: 'use_agent_defaults' } });

  const copyStep = db.tables.agency_steps.find((step) => step.agent_id === 'copywriter');
  const channelStep = db.tables.agency_steps.find((step) => step.agent_id === 'channel_adapter');
  const editorStep = db.tables.agency_steps.find((step) => step.agent_id === 'editor');
  const brandComplianceStep = db.tables.agency_steps.find((step) => step.agent_id === 'brand_compliance');
  const run = db.tables.agency_runs.find((item) => item.id === 'run-1');

  assert.equal(copyStep.status, 'completed');
  assert.equal(copyStep.technical_status, 'completed');
  assert.equal(copyStep.provider, 'test-provider');
  assert.equal(copyStep.model_used, 'test-model-copywriter');
  assert.equal(copyStep.model_id, 'claude-sonnet-4-6');
  assert.equal(copyStep.is_mock, false);
  assert.equal(copyStep.prompt_version, 'copywriter_v1');
  assert.equal(copyStep.tokens.total, 30);
  assert.equal(copyStep.cost_estimate, 0.003);
  assert.equal(copyStep.attempt_count, 1);
  assert.equal(copyStep.execution_metadata.prompt_version, 'copywriter_v1');
  assert.equal(copyStep.execution_metadata_json.model_id, 'claude-sonnet-4-6');
  assert.equal(channelStep.status, 'completed');
  assert.equal(channelStep.prompt_version, 'channel_adapter_v1');
  assert.equal(channelStep.output.data.adapted_content.body, 'Copy adaptada para LinkedIn.');
  assert.equal(editorStep.input.channelAdapterOutput.adapted_content.body, 'Copy adaptada para LinkedIn.');
  assert.equal(brandComplianceStep.status, 'completed');
  assert.equal(brandComplianceStep.prompt_version, 'brand_compliance_v1');
  assert.equal(brandComplianceStep.input.editorOutput.versao_editada, 'Versão editada');
  assert.equal(brandComplianceStep.quality_assessment.quality_status, 'risky');
  assert.equal(run.execution_metadata.total_steps, 7);
  assert.equal(run.execution_metadata.completed_steps, 7);
  assert.equal(run.execution_metadata.total_tokens, 180);
  assert.equal(run.execution_mode, 'use_agent_defaults');

  const approverStep = db.tables.agency_steps.find((step) => step.agent_id === 'approver');
  assert.equal(approverStep.input.brandComplianceOutput.decision, 'warning');
  assert.equal(editorStep.quality_assessment.quality_status, 'acceptable');
  assert.equal(approverStep.quality_assessment.quality_status, 'risky');
  assert.equal(approverStep.status, 'completed');
  assert.equal(approverStep.technical_status, 'completed');
});

test('executor respeita agent_sequence do execution_plan', async () => {
  const db = makeAgencyDb({
    executionPlan: {
      profile_id: 'simple_content',
      request_id: 'request-1',
      brand_id: 'brand-1',
      agent_sequence: ['account_director', 'copywriter', 'editor', 'brand_compliance', 'approver'],
      skipped_agents: [
        { agent_id: 'channel_adapter', reason: 'Perfil simples não exige adaptação por canal.' },
        { agent_id: 'visual_director', reason: 'Perfil simples não exige direção visual.' },
      ],
      required_gates: ['briefing_approval', 'brand_compliance_before_approver', 'human_approval_before_publication'],
      rationale: 'Teste de perfil simples.',
    },
  });

  await runAgencyWorkflow(db, 'request-1', new InstrumentedGateway(), { modelSelection: { execution_mode: 'use_agent_defaults' } });

  assert.equal(db.tables.agency_steps.some((step) => step.agent_id === 'channel_adapter'), false);
  assert.equal(db.tables.agency_steps.some((step) => step.agent_id === 'visual_director'), false);

  const editorStep = db.tables.agency_steps.find((step) => step.agent_id === 'editor');
  const brandComplianceStep = db.tables.agency_steps.find((step) => step.agent_id === 'brand_compliance');
  const approverStep = db.tables.agency_steps.find((step) => step.agent_id === 'approver');
  const run = db.tables.agency_runs.find((item) => item.id === 'run-1');

  assert.equal(editorStep.input.channelAdapterOutput, undefined);
  assert.equal(editorStep.input.visualDirectorOutput, undefined);
  assert.equal(brandComplianceStep.input.visualDirectorOutput, undefined);
  assert.equal(approverStep.input.brandComplianceOutput.decision, 'warning');
  assert.equal(run.execution_metadata.total_steps, 5);
  assert.equal(run.execution_metadata.completed_steps, 5);
});

test('erro de modelo registra step failed e run failed sem apagar histórico', async () => {
  const db = makeAgencyDb();

  await assert.rejects(
    () => runAgencyWorkflow(db, 'request-1', new FailingGateway(), { modelSelection: { execution_mode: 'use_agent_defaults' } }),
    /Falha simulada/
  );

  const copyStep = db.tables.agency_steps.find((step) => step.agent_id === 'copywriter');
  const run = db.tables.agency_runs.find((item) => item.id === 'run-1');

  assert.equal(copyStep.status, 'failed');
  assert.equal(copyStep.technical_status, 'failed');
  assert.equal(copyStep.error, 'Falha simulada do modelo');
  assert.equal(copyStep.execution_metadata.error_message, 'Falha simulada do modelo');
  assert.equal(copyStep.attempt_count, 1);
  assert.equal(run.status, 'failed');
  assert.equal(run.execution_metadata.failed_steps, 1);
});

test('modo mock não chama provider real e salva custo/tokens zerados', async () => {
  const db = makeAgencyDb();
  await runAgencyWorkflow(db, 'request-1', new FailingGateway(), { modelSelection: { execution_mode: 'mock' } });

  const copyStep = db.tables.agency_steps.find((step) => step.agent_id === 'copywriter');
  const run = db.tables.agency_runs.find((item) => item.id === 'run-1');

  assert.equal(run.execution_mode, 'mock');
  assert.equal(copyStep.provider, 'mock');
  assert.equal(copyStep.model_id, 'mock-model');
  assert.equal(copyStep.is_mock, true);
  assert.equal(copyStep.tokens.total, 0);
  assert.equal(copyStep.cost_estimate, 0);
  assert.equal(copyStep.execution_metadata_json.is_mock, true);
});

test('modo economical resolve Gemini 3 Flash para os steps', async () => {
  const db = makeAgencyDb();
  const gateway = new InstrumentedGateway();
  await runAgencyWorkflow(db, 'request-1', gateway, { modelSelection: { execution_mode: 'economical' } });

  const copyStep = db.tables.agency_steps.find((step) => step.agent_id === 'copywriter');
  const run = db.tables.agency_runs.find((item) => item.id === 'run-1');

  assert.equal(run.execution_mode, 'economical');
  assert.equal(copyStep.provider, 'test-provider');
  assert.equal(copyStep.input.promptPack.promptVersion, 'copywriter_v1');
  assert.equal(gateway.calls.find((call) => call.agentId === 'copywriter').modelId, 'gemini-3-flash-preview');
});

test('UI expõe opção Simular sem gastar tokens', async () => {
  const fs = await import('node:fs/promises');
  const path = new URL('../../../pages/adm/[id]/agency/[requestId].js', import.meta.url);
  const source = await fs.readFile(path, 'utf8');

  assert.match(source, /Simular sem gastar tokens/);
});

class InstrumentedGateway {
  calls = [];

  async generateStructuredOutput({ agentId, promptPack, provider, modelId }) {
    this.calls.push({ agentId, provider, modelId });
    return {
      agentId,
      data: outputForAgent(agentId),
      warnings: [],
      brandMemorySlicesUsed: [],
      provider: 'test-provider',
      model: `test-model-${agentId}`,
      promptVersion: promptPack.promptVersion,
      tokens: { input: 10, output: 20, total: 30 },
      estimatedCost: 0.003,
      temperature: 0.2,
    };
  }
}

class FailingGateway {
  async generateStructuredOutput() {
    throw new Error('Falha simulada do modelo');
  }
}

function outputForAgent(agentId) {
  const outputs = {
    copywriter: {
      copy_principal: 'Copy',
      variacoes: ['A'],
      cta: 'Agendar',
      racional_de_tom: 'Claro',
      claims_utilizados: [],
      claims_evitar: [],
      warnings: [],
    },
    channel_adapter: {
      channel: 'linkedin',
      request_type: 'social_post',
      adapted_content: {
        headline: 'Headline adaptada',
        body: 'Copy adaptada para LinkedIn.',
      },
      channel_specific_notes: ['LinkedIn profissional.'],
      formatting_rules_applied: ['Parágrafos curtos'],
      cta: 'Agendar',
      warnings: [],
    },
    visual_director: {
      direcao_de_arte: 'Direção',
      regras_visuais: ['Regra'],
      assets_necessarios: ['Imagem'],
      composicao: 'Composição',
      estilo_imagem: 'Editorial',
      restricoes_visuais: [],
      warnings: [],
    },
    editor: {
      versao_editada: 'Versão editada',
      ajustes_recomendados: [],
      riscos_de_incoerencia: [],
      score_aderencia: 90,
      observacoes: [],
    },
    brand_compliance: {
      decision: 'warning',
      overall_brand_alignment_score: 76,
      checklist: [{ criterion: 'claims', status: 'warning', observation: 'Confirmar prova.' }],
      violations: [{
        type: 'claim_without_proof',
        description: 'Claim precisa de validação.',
        severity: 'medium',
        suggested_fix: 'Adicionar evidência.',
      }],
      required_adjustments: ['Confirmar claim antes de aprovar.'],
      optional_improvements: [],
      brand_memory_slices_checked: ['plataforma_branding', 'voice_profile'],
      warnings: [],
    },
    approver: {
      decisao: 'revision_requested',
      checklist: [{ criterio: 'Claims com prova', status: 'warning', observacao: 'Confirmar evidência.' }],
      ajustes_obrigatorios: ['Confirmar claim antes de aprovar.'],
      justificativa: 'Há risco de claim sem prova.',
    },
  };
  return outputs[agentId];
}

function makeAgencyDb({ executionPlan } = {}) {
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
      execution_profile_id: executionPlan?.profile_id || null,
      execution_plan_json: executionPlan || null,
      branch_label: 'Original',
      status: 'pending',
      execution_metadata: {},
      created_at: '2026-05-18T12:00:00.000Z',
    }],
    agency_steps: [{
      id: 'step-account',
      run_id: 'run-1',
      agent_id: 'account_director',
      input: {
        brandKernel: makeBrandKernel(),
        agencyRequest: makeAgencyRequest(),
        promptPack: { systemPrompt: 'system', userPrompt: 'user', expectedOutputSchema: {}, promptVersion: 'account_director_v1' },
      },
      output: { agentId: 'account_director', data: approvedBriefing },
      status: 'completed',
      prompt_version: 'account_director_v1',
      version_number: 1,
      is_current: true,
      tokens: { input: 0, output: 0, total: 0 },
      cost_estimate: 0,
      duration_ms: 0,
      attempt_count: 0,
      execution_metadata: {},
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBrandKernel } from '../index.ts';
import type { EspansioneDiagnostic } from '@espansione/types';

test('BrandKernel carrega strategic_tensions da Brand Memory', () => {
  const diagnostic = {
    brand_slug: 'marca-teste',
    brand_name: 'Marca Teste',
    industry: 'Servicos',
    espansione_project_id: 'project-1',
    schema_version: '2.0',
    vi: { evidencias_literais: [] },
    decodificacao: { de_para: [] },
    diretrizes_estrategicas: [],
    plataforma_branding: {},
    voice_profile: {},
    visual_identity: {},
    experiencia: {},
    plano_comunicacao: {},
    values_and_attributes: {},
    strategic_tensions: {
      summary: 'Tensões abertas de teste.',
      unresolved_count: 1,
      high_risk_count: 1,
      tensions: [
        {
          title: 'Escala versus profundidade',
          theme: 'Modelo de entrega',
          tension_summary: 'VI pede escala, VE valoriza profundidade.',
          strategic_choice_needed: 'Definir promessa operacional.',
          risk_if_ignored: 'Alto risco de prometer velocidade sem sustentação.',
          impact_on_communication: 'Evitar claims de agilidade irrestrita.',
          status: 'open',
        },
      ],
    },
    meta: { agents_present: [6, 9, 12, 13] },
  } as unknown as EspansioneDiagnostic;

  const kernel = buildBrandKernel(diagnostic);

  assert.equal(kernel.strategicTensions.length, 1);
  assert.equal(kernel.unresolvedStrategicTensions.length, 1);
  assert.match(kernel.communicationRisksFromTensions[0], /Evitar claims/);
  assert.deepEqual(kernel.checkpointContext, []);
});

test('BrandKernel carrega executional_readiness opcional', () => {
  const diagnostic = {
    brand_slug: 'marca-execucao',
    brand_name: 'Marca Execucao',
    industry: 'Servicos',
    espansione_project_id: 'project-exec',
    schema_version: '2.0',
    vi: { evidencias_literais: [] },
    decodificacao: {
      de_para: [],
      executional_readiness: {
        summary: 'A estratégia exige rituais de gestão da mudança.',
        leadership_style_signals: ['Liderança técnica e centralizada'],
        cultural_blockers: ['Baixa cadência decisória'],
        adoption_risks: ['Time pode não absorver nova promessa'],
        internal_alignment_level: 'medium',
        decision_profile_signals: ['Decisão concentrada'],
        behavioral_signals: ['CIS parcial'],
        capability_gaps: ['Governança'],
        implications_for_strategy: ['Priorizar rituais'],
        implications_for_communication: ['Evitar promessa de velocidade ampla'],
        recommended_change_management_notes: ['Criar ritual semanal de alinhamento'],
        confidence_score: 68,
        source_basis: { forms: true, interviews: true, cis: true },
      },
    },
    diretrizes_estrategicas: [],
    plataforma_branding: {},
    voice_profile: {},
    visual_identity: {},
    experiencia: {},
    plano_comunicacao: {},
    values_and_attributes: {},
    meta: { agents_present: [6, 9, 12, 13] },
  } as unknown as EspansioneDiagnostic;

  const kernel = buildBrandKernel(diagnostic);

  assert.equal(kernel.strategy.executionalReadiness?.summary, 'A estratégia exige rituais de gestão da mudança.');
  assert.deepEqual(kernel.strategy.adoptionRisks, ['Time pode não absorver nova promessa']);
  assert.deepEqual(kernel.strategy.changeManagementNotes, ['Criar ritual semanal de alinhamento']);
  assert.equal(kernel.internal.internalAlignmentLevel, 'medium');
});

test('BrandKernel nao quebra diagnostico legado sem strategic_tensions', () => {
  const diagnostic = {
    brand_slug: 'marca-legada',
    brand_name: 'Marca Legada',
    industry: null,
    espansione_project_id: 'project-legacy',
    schema_version: '2.0',
    vi: { evidencias_literais: [] },
    decodificacao: { de_para: [] },
    diretrizes_estrategicas: [],
    plataforma_branding: {},
    voice_profile: {},
    visual_identity: {},
    experiencia: {},
    plano_comunicacao: {},
    values_and_attributes: {},
    meta: { agents_present: [6, 9, 12, 13] },
  } as unknown as EspansioneDiagnostic;

  const kernel = buildBrandKernel(diagnostic);

  assert.deepEqual(kernel.strategicTensions, []);
  assert.deepEqual(kernel.unresolvedStrategicTensions, []);
  assert.deepEqual(kernel.communicationRisksFromTensions, []);
  assert.deepEqual(kernel.visual.operationalWarnings, ['Visual identity operacional incompleta.']);
  assert.deepEqual(kernel.visual.visualRisks, ['Visual identity operacional incompleta.']);
});

test('BrandKernel carrega Sistema Visual Operacional quando disponivel', () => {
  const diagnostic = {
    brand_slug: 'marca-visual',
    brand_name: 'Marca Visual',
    industry: null,
    espansione_project_id: 'project-visual',
    schema_version: '2.0',
    vi: { evidencias_literais: [] },
    decodificacao: { de_para: [] },
    diretrizes_estrategicas: [],
    plataforma_branding: {},
    voice_profile: {},
    visual_identity: {
      operational_guidelines: {
        visual_principles: ['Luxo silencioso'],
        maintain: ['Rigor'],
        lose: ['Genérico'],
        gain: ['Sistema proprietário'],
        color_direction: { primary: ['Azul'], avoid: ['Neon'] },
        typography_direction: { recommended_style: 'Serif editorial' },
        image_style: { photography: ['Editorial'], avoid: ['Banco genérico'] },
        layout_behavior: { composition: ['Grid editorial'] },
        symbol_logo_guidance: ['Assinatura discreta'],
        dos: ['Usar respiro'],
        donts: ['Não poluir'],
        visual_risks: ['Parecer genérico'],
        prompt_guidelines: ['Evitar texto embutido'],
      },
    },
    experiencia: {},
    plano_comunicacao: {},
    values_and_attributes: {},
    meta: { agents_present: [6, 9, 12, 13] },
  } as unknown as EspansioneDiagnostic;

  const kernel = buildBrandKernel(diagnostic);

  assert.equal(kernel.visual.operationalGuidelines?.visual_principles[0], 'Luxo silencioso');
  assert.deepEqual(kernel.visual.dos, ['Usar respiro']);
  assert.deepEqual(kernel.visual.donts, ['Não poluir']);
  assert.deepEqual(kernel.visual.operationalWarnings, []);
});

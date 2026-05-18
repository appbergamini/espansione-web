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
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPAIGN_REQUEST_TYPES,
  CONTENT_REQUEST_TYPES,
  validateBrandReadinessForAgency,
} from '../brand-readiness.ts';

const criticalSlices = {
  decodificacao: { sumario_estrategico: 'Direcao clara' },
  plataforma_branding: { marca_e: { proposito: { statement: 'Proposito' } } },
  experiencia: { personas: [{ name: 'Cliente ideal' }] },
  plano_comunicacao: { clusters_comunicacao: [{ nome: 'Cluster 1' }] },
};

test('marca sem Brand Memory fica not_ready', () => {
  const result = validateBrandReadinessForAgency(null);

  assert.equal(result.status, 'not_ready');
  assert.deepEqual(result.allowedRequestTypes, []);
  assert.deepEqual(result.criticalSlicesFound, []);
  assert.deepEqual(result.missingSlices, [
    'decodificacao',
    'plataforma_branding',
    'experiencia',
    'plano_comunicacao',
  ]);
});

test('marca com Brand Memory vazia fica not_ready', () => {
  const result = validateBrandReadinessForAgency({});

  assert.equal(result.status, 'not_ready');
  assert.deepEqual(result.allowedRequestTypes, []);
});

test('marca com apenas 1 slice critico fica not_ready', () => {
  const result = validateBrandReadinessForAgency({
    decodificacao: criticalSlices.decodificacao,
  });

  assert.equal(result.status, 'not_ready');
  assert.deepEqual(result.criticalSlicesFound, ['decodificacao']);
  assert.deepEqual(result.allowedRequestTypes, []);
});

test('marca com 3 slices criticos fica partial_ready', () => {
  const result = validateBrandReadinessForAgency({
    decodificacao: criticalSlices.decodificacao,
    plataforma_branding: criticalSlices.plataforma_branding,
    experiencia: criticalSlices.experiencia,
  });

  assert.equal(result.status, 'partial_ready');
  assert.deepEqual(result.missingSlices, ['plano_comunicacao']);
  assert.deepEqual(result.allowedRequestTypes, []);
});

test('marca com 4 slices criticos fica ready_for_content quando faltam voice e visual', () => {
  const result = validateBrandReadinessForAgency(criticalSlices);

  assert.equal(result.status, 'ready_for_content');
  assert.deepEqual(result.missingSlices, []);
  assert.deepEqual(result.allowedRequestTypes, CONTENT_REQUEST_TYPES);
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings.join('\n'), /voice_profile ausente/);
  assert.match(result.warnings.join('\n'), /visual_identity ausente/);
});

test('marca com 4 slices criticos + voice_profile continua ready_for_content com warning visual', () => {
  const result = validateBrandReadinessForAgency({
    ...criticalSlices,
    voice_profile: { tons_de_voz: [{ nome: 'Claro' }] },
  });

  assert.equal(result.status, 'ready_for_content');
  assert.deepEqual(result.allowedRequestTypes, CONTENT_REQUEST_TYPES);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /visual_identity ausente/);
});

test('marca com 4 slices criticos + voice_profile + visual_identity fica ready_for_campaigns', () => {
  const result = validateBrandReadinessForAgency({
    ...criticalSlices,
    voice_profile: { tons_de_voz: [{ nome: 'Claro' }] },
    visual_identity: { color_palette: { principal: [{ nome: 'Azul' }] } },
  });

  assert.equal(result.status, 'ready_for_campaigns');
  assert.deepEqual(result.allowedRequestTypes, CAMPAIGN_REQUEST_TYPES);
  assert.deepEqual(result.warnings, []);
});

test('allowedRequestTypes bate com cada status operacional', () => {
  assert.deepEqual(validateBrandReadinessForAgency(null).allowedRequestTypes, []);

  assert.deepEqual(
    validateBrandReadinessForAgency({
      decodificacao: criticalSlices.decodificacao,
      plataforma_branding: criticalSlices.plataforma_branding,
    }).allowedRequestTypes,
    []
  );

  assert.deepEqual(validateBrandReadinessForAgency(criticalSlices).allowedRequestTypes, [
    'social_post',
    'carousel',
    'short_video_script',
    'email',
  ]);

  assert.deepEqual(
    validateBrandReadinessForAgency({
      ...criticalSlices,
      voice_profile: { tons_de_voz: [{ nome: 'Claro' }] },
      visual_identity: { color_palette: { principal: [{ nome: 'Azul' }] } },
    }).allowedRequestTypes,
    ['social_post', 'carousel', 'short_video_script', 'email', 'landing_page_copy']
  );
});


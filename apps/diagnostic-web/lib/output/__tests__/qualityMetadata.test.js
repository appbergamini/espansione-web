import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQualityMetadataDisplayModel,
  normalizeOutputQualityMetadata,
  parseQualityMetadataFromRaw,
} from '../qualityMetadata.js';

test('output com metadata gera modelo de exibicao corretamente', () => {
  const model = buildQualityMetadataDisplayModel({
    quality_metadata: {
      confidence_score: 88,
      evidence_strength: 'strong',
      assumptions: ['Hipotese A'],
      evidence_gaps: ['Lacuna B'],
      contradictions: ['Contradicao C'],
      needs_human_attention: false,
      risk_summary: 'Risco controlado',
    },
  });

  assert.equal(model.available, true);
  assert.equal(model.confidenceScore, 88);
  assert.equal(model.evidenceStrengthLabel, 'Forte');
  assert.deepEqual(model.assumptions, ['Hipotese A']);
});

test('output sem metadata nao quebra e retorna fallback', () => {
  const model = buildQualityMetadataDisplayModel(null);

  assert.equal(model.available, false);
  assert.match(model.fallbackMessage, /não disponíveis/);
});

test('confidence_score fora de 0-100 e tratado', () => {
  const high = normalizeOutputQualityMetadata({ confidence_score: 140, evidence_strength: 'strong' });
  const low = normalizeOutputQualityMetadata({ confidence_score: -20, evidence_strength: 'weak' });

  assert.equal(high.confidence_score, 100);
  assert.equal(low.confidence_score, 0);
});

test('needs_human_attention aparece como alerta no modelo', () => {
  const model = buildQualityMetadataDisplayModel({
    confidence_score: 51,
    evidence_strength: 'weak',
    needs_human_attention: true,
    risk_summary: 'Decisao sensivel.',
  });

  assert.equal(model.available, true);
  assert.equal(model.needsHumanAttention, true);
  assert.equal(model.riskSummary, 'Decisao sensivel.');
});

test('parseia quality_metadata emitido em tag XML', () => {
  const parsed = parseQualityMetadataFromRaw(`
    <conteudo>ok</conteudo>
    <quality_metadata>
    {"confidence_score":77,"evidence_strength":"medium","source_coverage":{"vi":true,"ve":false}}
    </quality_metadata>
  `);

  assert.equal(parsed.confidence_score, 77);
  assert.equal(parsed.evidence_strength, 'medium');
  assert.deepEqual(parsed.source_coverage, { vi: true, ve: false });
});


export const EVIDENCE_STRENGTH_LABELS = {
  strong: 'Forte',
  medium: 'Média',
  weak: 'Fraca',
  unknown: 'Desconhecida',
};

const EVIDENCE_STRENGTHS = new Set(['strong', 'medium', 'weak', 'unknown']);

export function parseQualityMetadataFromRaw(rawText = '') {
  const match = String(rawText).match(/<quality_metadata>([\s\S]*?)<\/quality_metadata>/i);
  if (!match) return null;

  const candidate = normalizeJsonCandidate(match[1]);
  try {
    return normalizeOutputQualityMetadata(JSON.parse(candidate));
  } catch {
    return {
      evidence_strength: 'unknown',
      evidence_gaps: ['quality_metadata emitido, mas JSON inválido.'],
      needs_human_attention: true,
      risk_summary: 'Metadados de qualidade não puderam ser interpretados.',
    };
  }
}

export function normalizeOutputQualityMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const metadata = {};
  const score = Number(value.confidence_score);
  if (Number.isFinite(score)) {
    metadata.confidence_score = Math.max(0, Math.min(100, Math.round(score)));
  }

  metadata.evidence_strength = EVIDENCE_STRENGTHS.has(value.evidence_strength)
    ? value.evidence_strength
    : 'unknown';

  metadata.evidence_gaps = normalizeStringArray(value.evidence_gaps);
  metadata.assumptions = normalizeStringArray(value.assumptions);
  metadata.contradictions = normalizeStringArray(value.contradictions);
  metadata.needs_human_attention = Boolean(value.needs_human_attention);
  if (typeof value.risk_summary === 'string' && value.risk_summary.trim()) {
    metadata.risk_summary = value.risk_summary.trim();
  }

  if (value.source_coverage && typeof value.source_coverage === 'object' && !Array.isArray(value.source_coverage)) {
    metadata.source_coverage = {};
    for (const key of ['vi', 've', 'vm', 'forms', 'interviews', 'market_research']) {
      if (key in value.source_coverage) metadata.source_coverage[key] = Boolean(value.source_coverage[key]);
    }
  }

  return metadata;
}

export function buildQualityMetadataDisplayModel(outputOrMetadata) {
  const metadata = normalizeOutputQualityMetadata(outputOrMetadata?.quality_metadata || outputOrMetadata);
  if (!metadata) {
    return {
      available: false,
      fallbackMessage: 'Metadados de qualidade não disponíveis para este output.',
    };
  }

  return {
    available: true,
    confidenceScore: metadata.confidence_score,
    evidenceStrength: metadata.evidence_strength || 'unknown',
    evidenceStrengthLabel: EVIDENCE_STRENGTH_LABELS[metadata.evidence_strength || 'unknown'],
    evidenceGaps: metadata.evidence_gaps || [],
    assumptions: metadata.assumptions || [],
    contradictions: metadata.contradictions || [],
    needsHumanAttention: Boolean(metadata.needs_human_attention),
    riskSummary: metadata.risk_summary || '',
    sourceCoverage: metadata.source_coverage || {},
  };
}

export function buildQualityMetadataPromptInstruction() {
  return [
    '',
    'METADADOS DE QUALIDADE DA DECISAO',
    'Ao final do output, emita uma tag adicional <quality_metadata> com JSON valido.',
    'Esta tag e aditiva e nao substitui conteudo, conclusoes, confianca nem brand_memory_export.',
    'Use este schema:',
    '<quality_metadata>',
    '{',
    '  "confidence_score": 0,',
    '  "evidence_strength": "strong|medium|weak|unknown",',
    '  "evidence_gaps": [],',
    '  "assumptions": [],',
    '  "contradictions": [],',
    '  "needs_human_attention": false,',
    '  "risk_summary": "",',
    '  "source_coverage": {',
    '    "vi": false,',
    '    "ve": false,',
    '    "vm": false,',
    '    "forms": false,',
    '    "interviews": false,',
    '    "market_research": false',
    '  }',
    '}',
    '</quality_metadata>',
    'confidence_score deve ficar entre 0 e 100.',
    'Marque needs_human_attention=true quando houver contradicoes, baixa evidencia ou escolha estrategica sensivel.',
  ].join('\n');
}

function normalizeJsonCandidate(value = '') {
  let text = String(value).trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1).trim();
  }
  return text;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}


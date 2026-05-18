const TAG_REGEX = /<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/i;

export function extractExecutionalReadinessFromAgent6Output(output) {
  const source =
    normalizeJson(output?.brand_memory_export_json) ??
    parseBrandMemoryExport(output?.conteudo);

  return normalizeExecutionalReadiness(
    source?.executional_readiness ??
      source?.decodificacao?.executional_readiness
  );
}

export function normalizeExecutionalReadiness(input) {
  if (!input || typeof input !== 'object') return null;
  const summary = firstString(input.summary, input.resumo);
  if (!summary) return null;

  return {
    summary,
    leadership_style_signals: normalizeArray(input.leadership_style_signals),
    cultural_blockers: normalizeArray(input.cultural_blockers),
    adoption_risks: normalizeArray(input.adoption_risks),
    internal_alignment_level: normalizeAlignmentLevel(input.internal_alignment_level),
    decision_profile_signals: normalizeArray(input.decision_profile_signals),
    behavioral_signals: normalizeArray(input.behavioral_signals),
    capability_gaps: normalizeArray(input.capability_gaps),
    implications_for_strategy: normalizeArray(input.implications_for_strategy),
    implications_for_communication: normalizeArray(input.implications_for_communication),
    recommended_change_management_notes: normalizeArray(input.recommended_change_management_notes),
    confidence_score: normalizeScore(input.confidence_score),
    source_basis: {
      forms: Boolean(input.source_basis?.forms),
      interviews: Boolean(input.source_basis?.interviews),
      cis: Boolean(input.source_basis?.cis),
      disc: Boolean(input.source_basis?.disc),
      diagnostic_360: Boolean(input.source_basis?.diagnostic_360),
      inferred: Boolean(input.source_basis?.inferred),
    },
  };
}

function parseBrandMemoryExport(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(TAG_REGEX);
  if (!match) return null;
  return normalizeJson(match[1]);
}

function normalizeJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function normalizeAlignmentLevel(value) {
  return ['high', 'medium', 'low', 'unknown'].includes(value) ? value : 'unknown';
}

function normalizeScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return undefined;
  return Math.max(0, Math.min(100, score));
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

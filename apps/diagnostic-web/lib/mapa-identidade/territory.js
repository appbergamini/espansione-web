// =====================================================================
// Mapa de Identidade — cálculo do Território Estratégico de Valor (Form 2)
// =====================================================================
// Funções puras. Cada categoria (EO/PP/DI) tem 4 afirmações 1–4 → max 16.

import { FORM_TERRITORIO, TERRITORIOS } from './forms';

export const TERRITORIO_MAX = 16; // 4 afirmações × 4 pontos
const LIMITE_HIBRIDO = 10; // pp de diferença para classificar como híbrido

// soma bruta por categoria a partir das respostas {code:value}
export function calculateValueTerritoryScores(answers = {}) {
  const cats = { EO: 0, PP: 0, DI: 0 };
  for (const a of FORM_TERRITORIO.afirmacoes) {
    const v = answers[a.code];
    if (typeof v === 'number') cats[a.category] += v;
  }
  const pct = (raw) => Math.round((raw / TERRITORIO_MAX) * 100);
  return {
    efficiency: { raw: cats.EO, percentage: pct(cats.EO) },
    proximity: { raw: cats.PP, percentage: pct(cats.PP) },
    differentiation: { raw: cats.DI, percentage: pct(cats.DI) },
  };
}

// ordena territórios por percentual desc → dominante / secundário / menos desenvolvido
export function classifyDominantTerritory(scores) {
  const ordered = [
    ['EO', scores.efficiency],
    ['PP', scores.proximity],
    ['DI', scores.differentiation],
  ].sort((a, b) => b[1].percentage - a[1].percentage);
  return { dominant: ordered[0], secondary: ordered[1], weakest: ordered[2], ordered };
}

// híbrido se dominante e secundário diferem ≤ 10 pp
export function detectHybridTerritory(scores) {
  const { dominant, secondary } = classifyDominantTerritory(scores);
  const gap = dominant[1].percentage - secondary[1].percentage;
  return { is_hybrid: gap <= LIMITE_HIBRIDO, gap };
}

// resultado consolidado (formato do objeto final, item 18 do spec)
export function buildTerritoryResult(answers = {}) {
  const scores = calculateValueTerritoryScores(answers);
  const { dominant, secondary, weakest } = classifyDominantTerritory(scores);
  const { is_hybrid, gap } = detectHybridTerritory(scores);
  const nome = (c) => TERRITORIOS[c].nome;
  return {
    scores: {
      efficiency: scores.efficiency.percentage,
      proximity: scores.proximity.percentage,
      differentiation: scores.differentiation.percentage,
    },
    dominant: nome(dominant[0]),
    dominant_code: dominant[0],
    secondary: nome(secondary[0]),
    secondary_code: secondary[0],
    weakest: nome(weakest[0]),
    weakest_code: weakest[0],
    is_hybrid,
    gap,
    tensao: is_hybrid
      ? `Território híbrido entre ${nome(dominant[0])} e ${nome(secondary[0])} (diferença de ${gap} pontos) — há tensão estratégica a posicionar.`
      : null,
  };
}

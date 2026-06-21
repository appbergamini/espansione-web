// =====================================================================
// Mapa de Maturidade Espansione — regras de negócio (funções puras)
// =====================================================================
// Modelo v2: 8 pilares × 5 perguntas. Escala 0–3 + "Não se aplica" (-1).
// "Não se aplica" NÃO conta no score (nem soma, nem denominador). Cada pilar
// precisa de ≥4 respostas válidas (máx. 1 N/A); com 2+ N/A o pilar fica
// "dados insuficientes" e bloqueia a conclusão até revisão.

import {
  PILARES_ORDENADOS,
  PILAR_BY_CODE,
  MAX_POR_PERGUNTA,
  MIN_VALIDAS_PILAR,
  VALOR_NUNCA,
  VALOR_NA,
  perguntasDoPilar,
} from './pilares';
import { getTextoInterpretativo } from './textos';

// nomes dos níveis (classificação por pontuação ajustada base-15)
export const NIVEIS = [
  { level: 1, name: 'Reativo' },
  { level: 2, name: 'Em estruturação' },
  { level: 3, name: 'Em consolidação' },
  { level: 4, name: 'Integrado' },
];

// Faixas do Índice Geral (média dos % dos pilares válidos)
export const NIVEIS_GERAIS = [
  { name: 'Reativa', min: 0, max: 29 },
  { name: 'Em estruturação', min: 30, max: 56 },
  { name: 'Em consolidação', min: 57, max: 83 },
  { name: 'Integrada', min: 84, max: 100 },
];

const ALERTA_MATURIDADE_DESIGUAL =
  'A empresa apresenta maturidade desigual, com lacunas críticas em pilares estruturantes.';

// ── helpers internos ────────────────────────────────────────────────
function valoresValidos(answers, pillarCode) {
  return perguntasDoPilar(pillarCode)
    .map((q) => answers[q.code])
    .filter((v) => typeof v === 'number' && v >= 0 && v <= 3);
}
function contarNA(answers, pillarCode) {
  return perguntasDoPilar(pillarCode).filter((q) => answers[q.code] === VALOR_NA).length;
}

// nível a partir da pontuação ajustada base-15 (régua oficial do spec)
export function levelFromAdjusted15(adj) {
  if (adj == null) return null;
  if (adj < 5) return 1;
  if (adj < 9) return 2;
  if (adj < 13) return 3;
  return 4;
}

export function calculatePillarScore(answers, pillarCode) {
  return valoresValidos(answers, pillarCode).reduce((sum, v) => sum + v, 0);
}

// resultado completo de um pilar (PillarResult — seção 11 do spec)
export function computePillarResult(answers, pillarCode) {
  const pilar = PILAR_BY_CODE[pillarCode];
  const validas = valoresValidos(answers, pillarCode);
  const na = contarNA(answers, pillarCode);
  const insufficient = validas.length < MIN_VALIDAS_PILAR; // <4 válidas (≥2 N/A)

  const base = {
    code: pillarCode,
    pillar_code: pillarCode,
    name: pilar ? pilar.name : pillarCode,
    valid_answers_count: validas.length,
    na_answers_count: na,
    nunca_count: validas.filter((v) => v === VALOR_NUNCA).length,
  };

  if (insufficient) {
    return {
      ...base,
      raw_score: null,
      max_possible_score: null,
      max_score: null, // alias p/ consumidores existentes (tela/PDF/relatório)
      percentage_score: null,
      adjusted_score_15: null,
      level: null,
      level_name: 'Dados insuficientes',
      critical_gap: false,
      unknown_count: na, // alias
      has_insufficient_data: true,
      deepening_required: false,
      evaluated: false,
    };
  }

  const raw = validas.reduce((sum, v) => sum + v, 0);
  const maxPossivel = validas.length * MAX_POR_PERGUNTA;
  const percentage = Math.round((raw / maxPossivel) * 100);
  // pontuação ajustada base-15 computada de raw/max (não do % arredondado,
  // que distorceria a fronteira — ex.: raw 5 → 5.0 = N2, não 4.95 = N1)
  const adjusted = Math.round((raw / maxPossivel) * 15 * 100) / 100;
  const criticalGap = base.nunca_count >= 2;
  let level = levelFromAdjusted15(adjusted);
  if (criticalGap && level > 2) level = 2; // trava de 2+ "Nunca"
  const nivel = NIVEIS.find((n) => n.level === level);

  return {
    ...base,
    raw_score: raw,
    max_possible_score: maxPossivel,
    max_score: maxPossivel, // alias p/ consumidores existentes (tela/PDF/relatório)
    percentage_score: percentage,
    adjusted_score_15: adjusted,
    level,
    level_name: nivel ? nivel.name : null,
    critical_gap: criticalGap,
    unknown_count: na, // alias
    has_insufficient_data: false,
    deepening_required: false,
    evaluated: true,
  };
}

export function computeAllPillars(answers) {
  return PILARES_ORDENADOS.map((p) => computePillarResult(answers, p.code));
}

// pilares que travam a conclusão (2+ "Não se aplica")
export function pilaresInsuficientes(answers) {
  return PILARES_ORDENADOS
    .filter((p) => valoresValidos(answers, p.code).length < MIN_VALIDAS_PILAR)
    .map((p) => p.name);
}

// índice geral = média dos % dos pilares válidos
export function calculateGeneralScore(pillarResults) {
  const validos = pillarResults.filter((p) => p.percentage_score != null);
  if (!validos.length) return null;
  const soma = validos.reduce((s, p) => s + p.percentage_score, 0);
  return Math.round(soma / validos.length);
}

export function classifyGeneralLevel(generalScore) {
  if (generalScore == null) return null;
  const faixa = NIVEIS_GERAIS.find((n) => generalScore >= n.min && generalScore <= n.max) || NIVEIS_GERAIS[0];
  return faixa.name;
}

// ── recomendações de trilhas (3 pilares válidos com menor score) ────
function prioridadePorNivel(level) {
  if (level <= 2) return 'Alta';
  if (level === 3) return 'Média';
  return 'Manutenção';
}
function razaoPorNivel(level, levelName) {
  switch (level) {
    case 1: return `Pilar em Nível 1 (${levelName}), exigindo estruturação prioritária das práticas.`;
    case 2: return `Pilar em Nível 2 (${levelName}), indicando práticas ainda inconsistentes.`;
    case 3: return `Pilar em Nível 3 (${levelName}), com espaço para ganhar consistência e disciplina.`;
    default: return `Pilar em Nível 4 (${levelName}); recomenda-se trilha de manutenção e evolução.`;
  }
}
export function generateRecommendations(pillarResults) {
  return pillarResults
    .filter((p) => p.percentage_score != null)
    .sort((a, b) => (a.percentage_score - b.percentage_score) || (a.raw_score - b.raw_score))
    .slice(0, 3)
    .map((p) => {
      const pilar = PILAR_BY_CODE[p.code];
      return {
        pillar_code: p.code,
        pillar: p.name,
        priority: prioridadePorNivel(p.level),
        trail: pilar ? pilar.trilha : null,
        reason: razaoPorNivel(p.level, p.level_name),
      };
    });
}

// ── orquestração: resultado completo ────────────────────────────────
export function buildResult(answers, meta = {}) {
  const pillars = computeAllPillars(answers);
  for (const p of pillars) {
    p.interpretation = p.level
      ? getTextoInterpretativo(p.code, p.level)
      : 'Dados insuficientes para classificar este pilar com segurança. Revise as respostas marcadas como "Não se aplica".';
  }

  const insuficientes = pillars.filter((p) => p.has_insufficient_data).map((p) => p.name);
  const hasInsufficient = insuficientes.length > 0;

  // Índice Geral só é gerado se NÃO houver pilar com dados insuficientes
  const generalScore = hasInsufficient ? null : calculateGeneralScore(pillars);
  const generalLevel = hasInsufficient ? null : classifyGeneralLevel(generalScore);

  const criticos = pillars
    .filter((p) => p.level && p.level <= 2)
    .sort((a, b) => a.percentage_score - b.percentage_score)
    .map((p) => p.name);
  const fortes = pillars.filter((p) => p.level === 4).map((p) => p.name);
  const nivel1Count = pillars.filter((p) => p.level === 1).length;

  return {
    assessment_id: meta.assessment_id || null,
    projeto_id: meta.projeto_id || null,
    company_id: meta.company_id || null,
    status: hasInsufficient ? 'pendente_revisao' : 'completo',
    has_insufficient_data: hasInsufficient,
    pillars_to_review: insuficientes,
    general_score: generalScore,
    general_level: generalLevel,
    pillars,
    critical_pillars: criticos,
    strong_pillars: fortes,
    alert: nivel1Count >= 2 ? ALERTA_MATURIDADE_DESIGUAL : null,
    recommendations: hasInsufficient ? [] : generateRecommendations(pillars),
  };
}

export function generateAssessmentSummary(assessment) {
  return buildResult(assessment.answers || {}, {
    assessment_id: assessment.id || assessment.assessment_id || null,
    projeto_id: assessment.projeto_id || null,
    company_id: assessment.company_id || null,
  });
}

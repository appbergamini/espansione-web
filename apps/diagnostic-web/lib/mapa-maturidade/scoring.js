// =====================================================================
// Mapa de Maturidade Espansione — regras de negócio (funções puras)
// =====================================================================
// Nenhuma destas funções toca rede, banco ou React. Recebem dados,
// devolvem dados. Toda a interface e os endpoints consomem este módulo.
//
// Formato de `answers`: objeto { [questionCode]: value }, value ∈ {0,1,2,3}.
//   Inclui obrigatórias e (quando houver) aprofundamento. As funções de
//   score ignoram as de aprofundamento — elas NÃO alteram o score do pilar
//   no MVP (seção 5 do spec); ficam guardadas para interpretação futura.

import {
  PILARES_ORDENADOS,
  PILAR_BY_CODE,
  MAX_POR_PERGUNTA,
  VALOR_NUNCA,
  VALOR_NAO_SEI,
  perguntasDoPilar,
} from './pilares';
import { getTextoInterpretativo } from './textos';

// ── Níveis de maturidade por pilar (pontuação bruta, 0–24) ──────────
// Recalibrado em 2026-06-21 quando o aprofundamento passou a contar (8
// perguntas, max 24). Os cortes mantêm quase exatamente as faixas % do
// modelo original de 15 pontos (29% / 54% / 79% / 100%).
export const NIVEIS = [
  { level: 1, name: 'Reativo', min: 0, max: 7 },
  { level: 2, name: 'Em estruturação', min: 8, max: 13 },
  { level: 3, name: 'Em consolidação', min: 14, max: 19 },
  { level: 4, name: 'Integrado', min: 20, max: 24 },
];

// ── Faixas do Índice Geral Espansione ───────────────────────────────
// NOTA: estes cortes vêm do spec (seção 8). Não são idênticos às faixas
// percentuais dos pilares (~27/53/80). Para alinhar geral↔pilar no futuro,
// basta trocar os limites abaixo por [0,26,53,80,100].
export const NIVEIS_GERAIS = [
  { name: 'Reativa', min: 0, max: 29 },
  { name: 'Em estruturação', min: 30, max: 56 },
  { name: 'Em consolidação', min: 57, max: 83 },
  { name: 'Integrada', min: 84, max: 100 },
];

const ALERTA_MATURIDADE_DESIGUAL =
  'A empresa apresenta maturidade desigual, com lacunas críticas em pilares estruturantes.';

// ── helpers internos ────────────────────────────────────────────────

// valores 0–3 de um pilar (8 perguntas), EXCLUINDO "Não sei" (-1) e ausentes
function valoresDoPilar(answers, pillarCode) {
  return perguntasDoPilar(pillarCode)
    .map((q) => answers[q.code])
    .filter((v) => typeof v === 'number' && v >= 0 && v <= 3);
}

function contarNaoSei(answers, pillarCode) {
  return perguntasDoPilar(pillarCode).filter((q) => answers[q.code] === VALOR_NAO_SEI).length;
}

// ── score bruto do pilar (soma das respostas avaliadas) ─────────────
export function calculatePillarScore(answers, pillarCode) {
  return valoresDoPilar(answers, pillarCode).reduce((sum, v) => sum + v, 0);
}

// nível a partir do percentual. As faixas reproduzem exatamente os cortes
// brutos (0-7/8-13/14-19/20-24 sobre 24 = 29/54/79/100%) quando tudo é
// respondido; com "Não sei", o denominador encolhe e o percentual segue justo.
export function levelFromPercentage(pct) {
  if (pct == null) return null;
  if (pct < 31) return 1;
  if (pct < 58) return 2;
  if (pct < 83) return 3;
  return 4;
}

// resultado completo de um pilar (estrutura PillarResult)
export function computePillarResult(answers, pillarCode) {
  const pilar = PILAR_BY_CODE[pillarCode];
  const values = valoresDoPilar(answers, pillarCode);
  const naoSei = contarNaoSei(answers, pillarCode);
  const raw = values.reduce((sum, v) => sum + v, 0);
  const maxAvaliado = values.length * MAX_POR_PERGUNTA;
  const percentage = maxAvaliado > 0 ? Math.round((raw / maxAvaliado) * 100) : null;

  const nuncaCount = values.filter((v) => v === VALOR_NUNCA).length;
  const criticalGap = nuncaCount >= 2;
  let level = levelFromPercentage(percentage);
  if (criticalGap && level && level > 2) level = 2; // 2+ "Nunca" trava no Nível 2
  const nivel = level ? NIVEIS.find((n) => n.level === level) : null;

  return {
    code: pillarCode,
    name: pilar ? pilar.name : pillarCode,
    raw_score: raw,
    max_score: maxAvaliado,
    answered: values.length,
    unknown_count: naoSei,
    percentage_score: percentage,
    level,
    level_name: nivel ? nivel.name : null,
    critical_gap: criticalGap,
    nunca_count: nuncaCount,
    evaluated: percentage !== null,
  };
}

// todos os pilares, na ordem de apresentação
export function computeAllPillars(answers) {
  return PILARES_ORDENADOS.map((p) => computePillarResult(answers, p.code));
}

// ── índice geral (média dos percentuais dos pilares AVALIADOS) ──────
export function calculateGeneralScore(pillarResults) {
  const avaliados = pillarResults.filter((p) => p.percentage_score != null);
  if (!avaliados.length) return 0;
  const soma = avaliados.reduce((s, p) => s + p.percentage_score, 0);
  return Math.round(soma / avaliados.length);
}

export function classifyGeneralLevel(generalScore) {
  const faixa =
    NIVEIS_GERAIS.find((n) => generalScore >= n.min && generalScore <= n.max) || NIVEIS_GERAIS[0];
  return faixa.name;
}

// ── recomendações de trilhas ────────────────────────────────────────
// Os 3 pilares com menor score percentual viram recomendação.
function prioridadePorNivel(level) {
  if (level <= 2) return 'Alta';
  if (level === 3) return 'Média';
  return 'Manutenção'; // Nível 4: sem trilha corretiva, só manutenção/evolução
}

function razaoPorNivel(level, levelName) {
  switch (level) {
    case 1:
      return `Pilar em Nível 1 (${levelName}), exigindo estruturação prioritária das práticas.`;
    case 2:
      return `Pilar em Nível 2 (${levelName}), indicando práticas ainda inconsistentes.`;
    case 3:
      return `Pilar em Nível 3 (${levelName}), com espaço para ganhar consistência e disciplina.`;
    default:
      return `Pilar em Nível 4 (${levelName}); recomenda-se trilha de manutenção e evolução.`;
  }
}

export function generateRecommendations(pillarResults) {
  const porScore = pillarResults
    .filter((p) => p.percentage_score != null) // só pilares avaliados
    .sort((a, b) => {
      if (a.percentage_score !== b.percentage_score) return a.percentage_score - b.percentage_score;
      return a.raw_score - b.raw_score;
    });
  return porScore.slice(0, 3).map((p) => {
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
// `answers` = todas as 48 (base + aprofundamento), todas contando no score.
// `meta` opcional = { assessment_id, projeto_id, company_id }.
export function buildResult(answers, meta = {}) {
  const pillars = computeAllPillars(answers);

  for (const p of pillars) {
    p.interpretation = p.level
      ? getTextoInterpretativo(p.code, p.level)
      : 'Não foi possível avaliar este pilar — predominaram respostas "Não sei".';
  }

  const generalScore = calculateGeneralScore(pillars);
  const generalLevel = classifyGeneralLevel(generalScore);

  const criticos = pillars
    .filter((p) => p.level && p.level <= 2)
    .sort((a, b) => a.percentage_score - b.percentage_score)
    .map((p) => p.name);

  const fortes = pillars
    .filter((p) => p.level === 4)
    .sort((a, b) => b.percentage_score - a.percentage_score)
    .map((p) => p.name);

  const nivel1Count = pillars.filter((p) => p.level === 1).length;
  const alerta = nivel1Count >= 2 ? ALERTA_MATURIDADE_DESIGUAL : null;

  return {
    assessment_id: meta.assessment_id || null,
    projeto_id: meta.projeto_id || null,
    company_id: meta.company_id || null,
    general_score: generalScore,
    general_level: generalLevel,
    pillars,
    critical_pillars: criticos,
    strong_pillars: fortes,
    alert: alerta,
    recommendations: generateRecommendations(pillars),
  };
}

// ── seção 15: assinatura nomeada do spec ────────────────────────────
// assessment = { id, projeto_id, company_id, answers }
export function generateAssessmentSummary(assessment) {
  return buildResult(assessment.answers || {}, {
    assessment_id: assessment.id || assessment.assessment_id || null,
    projeto_id: assessment.projeto_id || null,
    company_id: assessment.company_id || null,
  });
}

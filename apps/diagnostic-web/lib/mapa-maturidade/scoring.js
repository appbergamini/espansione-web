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
  PILARES,
  PILARES_ORDENADOS,
  PILAR_BY_CODE,
  ORDEM_DESEMPATE,
  MAX_SCORE_PILAR,
  VALOR_NUNCA,
} from './pilares';
import { getTextoInterpretativo } from './textos';

// ── Níveis de maturidade por pilar (pontuação bruta) ────────────────
export const NIVEIS = [
  { level: 1, name: 'Reativo', min: 0, max: 4 },
  { level: 2, name: 'Em estruturação', min: 5, max: 8 },
  { level: 3, name: 'Em consolidação', min: 9, max: 12 },
  { level: 4, name: 'Integrado', min: 13, max: 15 },
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

// valores das 5 obrigatórias de um pilar, na ordem definida (ignora ausentes)
function valoresObrigatorios(answers, pillarCode) {
  const pilar = PILAR_BY_CODE[pillarCode];
  if (!pilar) return [];
  return pilar.perguntas
    .map((q) => answers[q.code])
    .filter((v) => typeof v === 'number');
}

// ── seção 6: score bruto do pilar ───────────────────────────────────
export function calculatePillarScore(answers, pillarCode) {
  return valoresObrigatorios(answers, pillarCode).reduce((sum, v) => sum + v, 0);
}

// score percentual = bruto / 15 * 100 (inteiro)
export function pillarPercentage(rawScore) {
  return Math.round((rawScore / MAX_SCORE_PILAR) * 100);
}

// ── seção 7: nível do pilar (com regra dos 2+ "Nunca") ──────────────
// `pillarAnswerValues`: array dos valores das 5 obrigatórias do pilar
// (use valoresObrigatorios ou passe os valores direto). Necessário para
// contar quantas respostas foram "Nunca".
export function classifyPillarLevel(rawScore, pillarAnswerValues = []) {
  const base = NIVEIS.find((n) => rawScore >= n.min && rawScore <= n.max) || NIVEIS[0];
  const nuncaCount = pillarAnswerValues.filter((v) => v === VALOR_NUNCA).length;
  const criticalGap = nuncaCount >= 2;

  // 2+ "Nunca" impede passar do Nível 2, mesmo que a soma indique Nível 3+.
  let level = base.level;
  let name = base.name;
  if (criticalGap && level > 2) {
    level = 2;
    name = NIVEIS[1].name; // Em estruturação
  }
  return { level, name, criticalGap, nuncaCount };
}

// resultado completo de um pilar (estrutura PillarResult, seção 11/12)
export function computePillarResult(answers, pillarCode) {
  const pilar = PILAR_BY_CODE[pillarCode];
  const values = valoresObrigatorios(answers, pillarCode);
  const raw = values.reduce((sum, v) => sum + v, 0);
  const { level, name, criticalGap, nuncaCount } = classifyPillarLevel(raw, values);
  return {
    code: pillarCode,
    name: pilar ? pilar.name : pillarCode,
    raw_score: raw,
    max_score: MAX_SCORE_PILAR,
    percentage_score: pillarPercentage(raw),
    level,
    level_name: name,
    critical_gap: criticalGap,
    nunca_count: nuncaCount,
    deepening_required: false, // definido após selectDeepeningPillars
  };
}

// todos os pilares, na ordem de apresentação
export function computeAllPillars(answers) {
  return PILARES_ORDENADOS.map((p) => computePillarResult(answers, p.code));
}

// ── seção 8: índice geral (média simples dos percentuais) ───────────
export function calculateGeneralScore(pillarResults) {
  if (!pillarResults.length) return 0;
  const soma = pillarResults.reduce((s, p) => s + p.percentage_score, 0);
  return Math.round(soma / pillarResults.length);
}

export function classifyGeneralLevel(generalScore) {
  const faixa =
    NIVEIS_GERAIS.find((n) => generalScore >= n.min && generalScore <= n.max) || NIVEIS_GERAIS[0];
  return faixa.name;
}

// ── seção 5: seleção de pilares para aprofundamento ─────────────────
// Candidatos: pilares em Nível 1 ou 2 (raw 0–8). Se mais de 3 candidatos,
// leva os 3 PIORES (menor raw). Empate → ORDEM_DESEMPATE.
export function selectDeepeningPillars(pillarResults) {
  const candidatos = pillarResults.filter((p) => p.level <= 2);
  const prioridade = (code) => {
    const i = ORDEM_DESEMPATE.indexOf(code);
    return i === -1 ? ORDEM_DESEMPATE.length : i;
  };
  const ordenados = [...candidatos].sort((a, b) => {
    if (a.raw_score !== b.raw_score) return a.raw_score - b.raw_score; // pior primeiro
    return prioridade(a.code) - prioridade(b.code);
  });
  return ordenados.slice(0, 3).map((p) => p.code);
}

// ── seção 9: recomendações de trilhas ───────────────────────────────
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
  const porScore = [...pillarResults].sort((a, b) => {
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

// ── orquestração: resultado completo (objeto JSON da seção 12) ──────
// `answers` = obrigatórias (+ aprofundamento, ignorado no score).
// `meta` opcional = { assessment_id, projeto_id, company_id }.
export function buildResult(answers, meta = {}) {
  const pillars = computeAllPillars(answers);

  // marca quais pilares pedem aprofundamento (após o cap de 3)
  const aprofundar = new Set(selectDeepeningPillars(pillars));
  for (const p of pillars) {
    p.deepening_required = aprofundar.has(p.code);
    p.interpretation = getTextoInterpretativo(p.code, p.level);
  }

  const generalScore = calculateGeneralScore(pillars);
  const generalLevel = classifyGeneralLevel(generalScore);

  const criticos = pillars
    .filter((p) => p.level <= 2)
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
    deepening_pillars: [...aprofundar],
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

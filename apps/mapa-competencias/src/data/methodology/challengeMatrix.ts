import { CHALLENGE_MATRIX_VERSION } from "./versions";

/**
 * =====================================================================
 * MATRIZ DESAFIO × COMPETÊNCIA — V1.1 PRÉ-PILOTO (regra oficial)
 * =====================================================================
 * Escala: 0 = sem relação direta suficiente · 1 = suporte · 2 = importante ·
 * 3 = central.
 *
 * V1.1: Persuasão de Compra foi removida como competência independente
 * (coluna eliminada). Influência e Persuasão absorveu a aplicação comercial e
 * teve sua coluna recalculada (D6 e D8 = 3).
 *
 * Os desafios selecionados têm o MESMO peso (não usar ordem de clique).
 * Relevância (R) considera apenas os desafios selecionados:
 *   R = 100 × [ 0.50 × (maxRelation/3) + 0.50 × (meanRelation/3) ]
 * =====================================================================
 */

/** Ids canônicos das 14 competências ativas na ordem oficial da matriz. */
export const COMPETENCY_MATRIX_ORDER = [
  "analise-solucao-problemas", // ASP
  "defender-mudancas", // DM
  "visao", // VIS
  "julgamento-decisivo", // JD
  "orientacao-resultados", // OR
  "aperfeicoamento-continuo", // AC
  "planejamento-e-organizacao", // PO
  "foco-no-cliente", // FC
  "flexibilidade", // FL
  "influencia-persuasao", // IP
  "gerenciando-outros", // GO
  "desenvolvimento-pessoas", // DP
  "administracao-relacionamentos", // AR
  "negociacao", // NEG
] as const;

/**
 * Relação por desafio (na ordem COMPETENCY_MATRIX_ORDER, 14 colunas).
 */
const CHALLENGE_ROWS: Record<string, number[]> = {
  escalar_vendas: [1, 1, 2, 1, 3, 1, 2, 3, 1, 3, 1, 1, 2, 2],
  autonomia_time: [1, 2, 2, 2, 2, 2, 3, 0, 1, 2, 3, 3, 1, 0],
  processos_crescimento: [2, 2, 1, 2, 2, 3, 3, 0, 1, 1, 2, 1, 0, 0],
  liderancas: [1, 2, 2, 2, 2, 1, 1, 0, 2, 2, 3, 3, 2, 1],
  produtividade: [2, 2, 1, 2, 3, 3, 3, 1, 2, 1, 2, 1, 0, 0],
  novos_mercados: [2, 2, 3, 2, 2, 1, 1, 3, 2, 3, 1, 1, 2, 2],
  modernizar: [2, 3, 2, 2, 2, 3, 2, 1, 3, 2, 2, 1, 1, 1],
  previsibilidade: [2, 1, 1, 2, 3, 2, 3, 2, 1, 3, 2, 1, 1, 2],
  negociacao: [1, 1, 1, 2, 1, 0, 1, 2, 2, 3, 1, 0, 3, 3],
  direcao_comum: [1, 2, 3, 1, 2, 1, 2, 0, 1, 3, 3, 2, 2, 1],
  clareza_decisoes: [3, 1, 2, 3, 2, 1, 2, 1, 1, 1, 1, 0, 0, 1],
  retencao_clientes: [1, 1, 1, 1, 2, 2, 1, 3, 2, 2, 2, 1, 3, 2],
};

export const challengeCompetencyMatrix: Record<string, Record<string, number>> = {};
for (const [challengeId, values] of Object.entries(CHALLENGE_ROWS)) {
  const row: Record<string, number> = {};
  COMPETENCY_MATRIX_ORDER.forEach((competencyId, index) => {
    row[competencyId] = values[index];
  });
  challengeCompetencyMatrix[challengeId] = row;
}

export const challengeMatrixInfo = {
  relations: challengeCompetencyMatrix,
  version: CHALLENGE_MATRIX_VERSION,
};

export { CHALLENGE_MATRIX_VERSION };

/** Relação (0–3) de uma competência para um conjunto de desafios selecionados. */
export function relationsForChallenges(
  competencyId: string,
  challengeIds: string[]
): number[] {
  const selected = challengeIds.filter((id) => challengeCompetencyMatrix[id]);
  if (selected.length === 0) return [];
  return selected.map((id) => challengeCompetencyMatrix[id][competencyId] ?? 0);
}

/** Desafios com perfil comercial (para commercialContextActive). */
export const COMMERCIAL_CHALLENGE_IDS = [
  "escalar_vendas", // D1
  "novos_mercados", // D6
  "previsibilidade", // D8
];

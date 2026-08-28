import type {
  AssessmentContextData,
  AssessmentResult,
  BehaviorScoringResult,
  CompetencyResult,
  DevelopmentMovement,
  FunctionalRelation,
  FunctionalRequirement,
  KeyBehaviorResult,
} from "@/data/types";
import { activeCompetencies, competencies } from "@/data/methodology";
import { functionalMatrix, FUNCTIONAL_ROLE_WEIGHT, FUNCTIONAL_MATRIX_VERSION } from "@/data/methodology/functionalMatrix";
import { COMMERCIAL_CHALLENGE_IDS, relationsForChallenges, CHALLENGE_MATRIX_VERSION } from "@/data/methodology/challengeMatrix";
import {
  ASSESSMENT_ITEMS_VERSION,
  ASSESSMENT_RESULT_VERSION,
  METHODOLOGY_VERSION,
} from "@/data/methodology/versions";
import { scoreAssessment } from "./behaviorScoringEngine";

/**
 * =====================================================================
 * MOTOR METODOLÓGICO — V1.0 PRÉ-PILOTO (DETERMINÍSTICO)
 * =====================================================================
 * Fluxo:
 *   60 respostas → 20 posições comportamentais → exigência funcional
 *   → Necessidade Funcional (N) → desafios → Relevância (R) → Prioridade (P)
 *   → 3 a 5 Focos de Desenvolvimento → comportamentos-chave → movimentos.
 *
 * N, R e P são INTERNOS — nunca apresentar como nota/percentual de
 * competência. O algoritmo decide o resultado; a IA (futura) apenas explica.
 * =====================================================================
 */

export interface BehaviorDistance {
  relation: FunctionalRelation;
  distance: number;
  movement: DevelopmentMovement;
}

/* ------------------------- faixas de posição ------------------------- */

export type PositionBand = "strongA" | "tendA" | "central" | "tendB" | "strongB";

export function positionBand(score: number): PositionBand {
  if (score <= 20) return "strongA";
  if (score <= 39) return "tendA";
  if (score <= 60) return "central";
  if (score <= 79) return "tendB";
  return "strongB";
}

/* ---------------------- distância funcional ---------------------- */

export function functionalDistanceAndMovement(
  requirement: FunctionalRequirement,
  score: number
): { distance: number; movement: DevelopmentMovement } {
  const band = positionBand(score);
  switch (requirement) {
    case "B+":
      switch (band) {
        case "strongA":
          return { distance: 1.0, movement: "EXPAND_B" };
        case "tendA":
          return { distance: 0.67, movement: "EXPAND_B" };
        case "central":
          return { distance: 0.33, movement: "EXPAND_B" };
        case "tendB":
          return { distance: 0.0, movement: "MAINTAIN_FLEXIBILITY" };
        case "strongB":
          return { distance: 0.33, movement: "MODULATE_B" };
      }
      break;
    case "A+":
      switch (band) {
        case "strongA":
          return { distance: 0.33, movement: "MODULATE_A" };
        case "tendA":
          return { distance: 0.0, movement: "MAINTAIN_FLEXIBILITY" };
        case "central":
          return { distance: 0.33, movement: "EXPAND_A" };
        case "tendB":
          return { distance: 0.67, movement: "EXPAND_A" };
        case "strongB":
          return { distance: 1.0, movement: "EXPAND_A" };
      }
      break;
    case "EQ":
      switch (band) {
        case "strongA":
          return { distance: 1.0, movement: "EXPAND_B" };
        case "tendA":
          return { distance: 0.5, movement: "EXPAND_B" };
        case "central":
          return { distance: 0.0, movement: "MAINTAIN_FLEXIBILITY" };
        case "tendB":
          return { distance: 0.5, movement: "EXPAND_A" };
        case "strongB":
          return { distance: 1.0, movement: "EXPAND_A" };
      }
      break;
  }
  // nunca alcançado (exaustivo)
  return { distance: 0, movement: "MAINTAIN_FLEXIBILITY" };
}

/* -------------------- necessidade funcional (N) -------------------- */

export function relationDistance(
  relation: FunctionalRelation,
  behaviorScores: Map<string, number>
): BehaviorDistance {
  const score = behaviorScores.get(relation.behaviorId) ?? 50;
  const { distance, movement } = functionalDistanceAndMovement(relation.requirement, score);
  return { relation, distance, movement };
}

/**
 * Relações ativas = role !== "S*" (S* não influencia o cálculo nesta versão).
 */
export function activeRelations(relations: FunctionalRelation[]): FunctionalRelation[] {
  return relations.filter((r) => r.role !== "S*");
}

export function competencyNecessity(
  relations: FunctionalRelation[],
  behaviorScores: Map<string, number>
): { N: number; distances: BehaviorDistance[] } {
  const active = activeRelations(relations);
  const distances = active.map((relation) => relationDistance(relation, behaviorScores));
  const numerator = distances.reduce(
    (sum, d) => sum + d.distance * FUNCTIONAL_ROLE_WEIGHT[d.relation.role],
    0
  );
  const denominator = active.reduce((sum, r) => sum + FUNCTIONAL_ROLE_WEIGHT[r.role], 0);
  const N = denominator > 0 ? (100 * numerator) / denominator : 0;
  return { N, distances };
}

/* ---------------- sinal de desenvolvimento significativo ---------------- */

export function significantDevelopmentSignal(distances: BehaviorDistance[]): boolean {
  const nuclear = distances.filter((d) => d.relation.role === "N");
  const nuclearHigh = nuclear.filter((d) => d.distance >= 0.5);
  const otherActive = distances.filter((d) => d.relation.role !== "N");
  if (nuclearHigh.length >= 2) return true;
  const nuclearFull = nuclear.some((d) => d.distance === 1.0);
  if (nuclearFull && otherActive.some((d) => d.distance >= 0.33)) return true;
  return false;
}

/* ------------------------ relevância (R) ------------------------ */

/** R a partir de relações 0–3 (fórmula oficial V1: 50/50 max/mean). */
export function relevanceFromRelations(relations: number[]): number {
  if (relations.length === 0) return 0;
  const maxRelation = Math.max(...relations);
  const meanRelation = relations.reduce((a, b) => a + b, 0) / relations.length;
  return 100 * (0.5 * (maxRelation / 3) + 0.5 * (meanRelation / 3));
}

export function challengeRelevance(competencyId: string, challengeIds: string[]): number {
  return relevanceFromRelations(relationsForChallenges(competencyId, challengeIds));
}

/* ------------------------- prioridade (P) ------------------------- */

export function priorityIndex(N: number, R: number): number {
  if (N === 0 || R === 0) return 0;
  return (N * R) / 100;
}

export function strongFocus(N: number, R: number, P: number, significant: boolean): boolean {
  return R >= 50 && N >= 33 && P >= 25 && significant;
}

/* ------------------- comportamentos-chave ------------------- */

export function keyBehaviors(distances: BehaviorDistance[]): KeyBehaviorResult[] {
  return distances
    .map((d) => ({
      behaviorId: d.relation.behaviorId,
      impact: d.distance * FUNCTIONAL_ROLE_WEIGHT[d.relation.role],
      movement: d.movement,
    }))
    .filter((k) => k.impact >= 0.33)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
}

/* ----------------------- seleção de focos ----------------------- */

export interface FocusSelectionInput {
  competencyId: string;
  N: number;
  R: number;
  P: number;
  strongFocus: boolean;
  significant: boolean;
  nuclearHighCount: number;
}

export function countStrongChallengeRelations(competencyId: string, challengeIds: string[]): number {
  return relationsForChallenges(competencyId, challengeIds).filter((r) => r >= 2).length;
}

function canonicalOrderIndex(competencyId: string): number {
  const index = competencies.findIndex((c) => c.id === competencyId);
  return index === -1 ? 999 : index;
}

/**
 * Regra de 3 a 5 focos:
 * - TOP 3 sempre entram (relativeFocus se não atender strongFocus);
 * - 4ª e 5ª apenas se strongFocus e P >= 80% do P da 3ª;
 * - nunca menos de 3, nunca mais de 5.
 */
export function selectFocusCompetencyIds(
  inputs: FocusSelectionInput[],
  challengeIds: string[]
): { focusCompetencyIds: string[]; relativeFocusIds: Set<string> } {
  const sorted = [...inputs].sort((a, b) => {
    if (b.P !== a.P) return b.P - a.P;
    if (b.R !== a.R) return b.R - a.R;
    if (b.N !== a.N) return b.N - a.N;
    const cB = countStrongChallengeRelations(b.competencyId, challengeIds);
    const cA = countStrongChallengeRelations(a.competencyId, challengeIds);
    if (cB !== cA) return cB - cA;
    if (b.nuclearHighCount !== a.nuclearHighCount) return b.nuclearHighCount - a.nuclearHighCount;
    return canonicalOrderIndex(a.competencyId) - canonicalOrderIndex(b.competencyId);
  });

  const top3 = sorted.slice(0, 3);
  const p3 = top3[2]?.P ?? 0;
  const threshold = 0.8 * p3;

  const focus: FocusSelectionInput[] = [...top3];
  for (const candidate of sorted.slice(3)) {
    if (focus.length >= 5) break;
    if (candidate.strongFocus && candidate.P >= threshold) {
      focus.push(candidate);
    }
  }

  const relativeFocusIds = new Set(
    top3.filter((c) => !c.strongFocus).map((c) => c.competencyId)
  );
  return {
    focusCompetencyIds: focus.map((c) => c.competencyId),
    relativeFocusIds,
  };
}

/* --------------------------- estados --------------------------- */

export function competencyState(
  isFocus: boolean,
  N: number,
  significant: boolean
): "prioridade" | "base" | "observacao" {
  if (isFocus) return "prioridade";
  if (N < 33 && !significant) return "base";
  return "observacao";
}

/* ------------------------ resultado completo ------------------------ */

export function newId(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

export function runFullAssessment(
  answers: Record<string, number>,
  challengeIds: string[],
  isDemo: boolean,
  contextData: AssessmentContextData
): AssessmentResult {
  const commercialContextActive =
    contextData.participaVendas ||
    challengeIds.some((id) => COMMERCIAL_CHALLENGE_IDS.includes(id));

  const behaviorResults = scoreAssessment(answers);
  const behaviorScores = new Map(
    behaviorResults.map((r) => [r.behaviorId, r.score] as const)
  );

  const inputs: FocusSelectionInput[] = [];
  const competencyResults: CompetencyResult[] = [];

  for (const competency of activeCompetencies) {
    const relations = functionalMatrix[competency.id] ?? [];
    const { N, distances } = competencyNecessity(relations, behaviorScores);
    const significant = significantDevelopmentSignal(distances);
    const R = challengeRelevance(competency.id, challengeIds);
    const P = priorityIndex(N, R);
    const isStrongFocus = strongFocus(N, R, P, significant);

    inputs.push({
      competencyId: competency.id,
      N,
      R,
      P,
      strongFocus: isStrongFocus,
      significant,
      nuclearHighCount: distances.filter((d) => d.relation.role === "N" && d.distance >= 0.5).length,
    });

    competencyResults.push({
      competencyId: competency.id,
      need: N,
      relevance: R,
      priorityIndex: P,
      strongFocus: isStrongFocus,
      relativeFocus: false,
      state: "observacao", // preenchido após seleção de focos
      significantDevelopmentSignal: significant,
      keyBehaviors: keyBehaviors(distances),
      movements: distances.map((d) => ({ behaviorId: d.relation.behaviorId, movement: d.movement })),
    });
  }

  const { focusCompetencyIds, relativeFocusIds } = selectFocusCompetencyIds(inputs, challengeIds);

  for (const result of competencyResults) {
    const isFocus = focusCompetencyIds.includes(result.competencyId);
    result.state = competencyState(isFocus, result.need, result.significantDevelopmentSignal);
    result.relativeFocus = relativeFocusIds.has(result.competencyId);
  }

  return {
    id: newId("result"),
    assessmentSessionId: newId("session"),
    userId: null,
    createdAt: new Date().toISOString(),
    assessmentVersion: ASSESSMENT_RESULT_VERSION,
    assessmentItemsVersion: ASSESSMENT_ITEMS_VERSION,
    methodologyVersion: METHODOLOGY_VERSION,
    challengeMatrixVersion: CHALLENGE_MATRIX_VERSION,
    functionalMatrixVersion: FUNCTIONAL_MATRIX_VERSION,
    completedAt: new Date().toISOString(),
    answers: { ...answers },
    behaviorResults,
    competencyResults,
    focusCompetencyIds,
    contextData: { ...contextData, selectedChallengeIds: challengeIds },
    commercialContextActive,
    isDemo,
  };
}

/**
 * QA estrutural: nenhuma dupla de competências ATIVAS pode possuir assinatura
 * funcional 100% idêntica (behaviorId + requirement + role). Retorna warnings
 * para revisão metodológica (não bloqueia o cálculo).
 */
export function validateUniqueFunctionalSignatures(): {
  competencyId: string;
  duplicateOf: string;
}[] {
  const seen = new Map<string, string>();
  const warnings: { competencyId: string; duplicateOf: string }[] = [];
  for (const competency of activeCompetencies) {
    const relations = (functionalMatrix[competency.id] ?? [])
      .map((r) => `${r.behaviorId}:${r.requirement}:${r.role}`)
      .sort()
      .join("|");
    const existing = seen.get(relations);
    if (existing) {
      warnings.push({ competencyId: competency.id, duplicateOf: existing });
    } else {
      seen.set(relations, competency.id);
    }
  }
  return warnings;
}

export const competencyResultById = (results: CompetencyResult[]) =>
  new Map(results.map((r) => [r.competencyId, r]));

export const behaviorScoreById = (results: BehaviorScoringResult[]) =>
  new Map(results.map((r) => [r.behaviorId, r.score] as const));

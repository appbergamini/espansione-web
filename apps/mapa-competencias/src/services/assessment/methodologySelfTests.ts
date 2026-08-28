import { activeCompetencies } from "@/data/methodology";
import { commercialApplication } from "@/data/methodology/competencyApplications";
import { functionalMatrix } from "@/data/methodology/functionalMatrix";
import { demoResponses } from "@/data/mock/mockDemoResponses";
import { SAMPLE_CHALLENGE_IDS } from "@/data/mock/mockContext";
import {
  activeRelations,
  competencyNecessity,
  competencyState,
  functionalDistanceAndMovement,
  keyBehaviors,
  priorityIndex,
  relevanceFromRelations,
  runFullAssessment,
  selectFocusCompetencyIds,
  significantDevelopmentSignal,
  strongFocus,
  validateUniqueFunctionalSignatures,
  type FocusSelectionInput,
} from "./methodologyEngine";

/**
 * =====================================================================
 * QA AUTOMÁTICO DO MOTOR METODOLÓGICO — V1.0 PRÉ-PILOTO
 * =====================================================================
 * Cobre os itens J a Y da especificação (A–I já cobertos pelo banco de itens
 * e pelo behaviorScoringEngine). Lança Error se qualquer caso falhar.
 * =====================================================================
 */

function assertClose(name: string, actual: number, expected: number, tolerance = 1e-6) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`QA falhou — ${name}: esperado ${expected}, obtido ${actual}`);
  }
}
function assertTrue(name: string, value: boolean) {
  if (!value) throw new Error(`QA falhou — ${name}`);
}
function assertEqual(name: string, actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`QA falhou — ${name}: esperado ${String(expected)}, obtido ${String(actual)}`);
  }
}

export function runMethodologySelfTests(): boolean {
  /* J: distância B+ */
  assertClose("B+ score 10 → 1", functionalDistanceAndMovement("B+", 10).distance, 1);
  assertClose("B+ score 30 → 0.67", functionalDistanceAndMovement("B+", 30).distance, 0.67);
  assertClose("B+ score 50 → 0.33", functionalDistanceAndMovement("B+", 50).distance, 0.33);
  assertClose("B+ score 70 → 0", functionalDistanceAndMovement("B+", 70).distance, 0);
  assertClose("B+ score 90 → 0.33", functionalDistanceAndMovement("B+", 90).distance, 0.33);

  /* K: distância A+ */
  assertClose("A+ score 10 → 0.33", functionalDistanceAndMovement("A+", 10).distance, 0.33);
  assertClose("A+ score 30 → 0", functionalDistanceAndMovement("A+", 30).distance, 0);
  assertClose("A+ score 50 → 0.33", functionalDistanceAndMovement("A+", 50).distance, 0.33);
  assertClose("A+ score 70 → 0.67", functionalDistanceAndMovement("A+", 70).distance, 0.67);
  assertClose("A+ score 90 → 1", functionalDistanceAndMovement("A+", 90).distance, 1);

  /* L: distância EQ */
  assertClose("EQ score 10 → 1", functionalDistanceAndMovement("EQ", 10).distance, 1);
  assertClose("EQ score 30 → 0.5", functionalDistanceAndMovement("EQ", 30).distance, 0.5);
  assertClose("EQ score 50 → 0", functionalDistanceAndMovement("EQ", 50).distance, 0);
  assertClose("EQ score 70 → 0.5", functionalDistanceAndMovement("EQ", 70).distance, 0.5);
  assertClose("EQ score 90 → 1", functionalDistanceAndMovement("EQ", 90).distance, 1);

  /* R: relevância (fórmula 50/50) */
  assertClose("R (3,3,3) → 100", relevanceFromRelations([3, 3, 3]), 100);
  assertClose("R (3,2,2) → 88.89", relevanceFromRelations([3, 2, 2]), 88.8889, 1e-2);
  assertClose("R (3,0,0) → 66.67", relevanceFromRelations([3, 0, 0]), 66.6667, 1e-2);
  assertClose("R (2,2,2) → 66.67", relevanceFromRelations([2, 2, 2]), 66.6667, 1e-2);
  assertClose("R (2,0,0) → 44.44", relevanceFromRelations([2, 0, 0]), 44.4444, 1e-2);
  assertClose("R (1,1,1) → 33.33", relevanceFromRelations([1, 1, 1]), 33.3333, 1e-2);
  assertClose("R (0,0,0) → 0", relevanceFromRelations([0, 0, 0]), 0);

  /* M/N/O/P/Q: faixas e casos especiais */
  assertTrue("N dentro de 0–100", competencyNecessity(activeRelations(functionalMatrix.visao), new Map()).N >= 0);
  for (const score of [0, 33, 50, 100]) {
    const n = competencyNecessity(functionalMatrix.visao, new Map([["reflexivo", score]])).N;
    assertTrue(`N com score ${score} em 0–100`, n >= 0 && n <= 100);
  }
  assertEqual("P com N=0 → 0", priorityIndex(0, 80), 0);
  assertEqual("P com R=0 → 0", priorityIndex(60, 0), 0);
  assertClose("P exemplo", priorityIndex(50, 80), 40);

  /* X: S* não influencia N */
  const dp = functionalMatrix["desenvolvimento-pessoas"];
  const nWith = competencyNecessity(dp, new Map([["necessidade-reconhecimento", 100]])).N;
  const dpWithout = dp.filter((r) => r.role !== "S*");
  const nWithout = competencyNecessity(dpWithout, new Map([["necessidade-reconhecimento", 100]])).N;
  assertClose("S* não altera N", nWith, nWithout);

  /* W: comportamentos-chave máximo 3 e impact >= 0.33 */
  const distances = activeRelations(functionalMatrix.negociacao).map((relation) => ({
    relation,
    distance: 1,
    movement: "EXPAND_B" as const,
  }));
  const kb = keyBehaviors(distances);
  assertTrue("keyBehaviors máx 3", kb.length <= 3);
  assertTrue("keyBehaviors impact >= 0.33", kb.every((k) => k.impact >= 0.33));

  /* S/T/U/V: seleção de 3 a 5 focos determinística */
  const mk = (id: string, P: number, opts: Partial<FocusSelectionInput> = {}): FocusSelectionInput => ({
    competencyId: id,
    N: 50,
    R: 60,
    P,
    strongFocus: true,
    significant: true,
    nuclearHighCount: 1,
    ...opts,
  });
  const run1 = selectFocusCompetencyIds([mk("a", 61), mk("b", 57), mk("c", 50), mk("d", 47, { strongFocus: true }), mk("e", 42), mk("f", 27)], []);
  assertEqual("Exemplo da spec: entram 1..5, não 6", run1.focusCompetencyIds.join(","), "a,b,c,d,e");
  assertTrue("Mínimo 3 focos", selectFocusCompetencyIds([mk("a", 10), mk("b", 5), mk("c", 1)], []).focusCompetencyIds.length >= 3);
  const many = selectFocusCompetencyIds([mk("a", 90), mk("b", 85), mk("c", 80), mk("d", 70), mk("e", 60), mk("f", 10)], []);
  assertTrue("Máximo 5 focos", many.focusCompetencyIds.length <= 5);

  // 4ª só entra com strongFocus + P >= 80% do P da 3ª
  const d4 = selectFocusCompetencyIds([mk("a", 61), mk("b", 57), mk("c", 50), mk("d", 41, { strongFocus: false })], []);
  assertEqual("4ª sem strongFocus não entra", d4.focusCompetencyIds.join(","), "a,b,c");
  const d5 = selectFocusCompetencyIds([mk("a", 61), mk("b", 57), mk("c", 50), mk("d", 39, { strongFocus: true })], []);
  assertEqual("4ª abaixo de 80% do P3 não entra", d5.focusCompetencyIds.join(","), "a,b,c");

  // empate → determinístico (ordem canônica)
  const tieA = selectFocusCompetencyIds([mk("negociacao", 40), mk("visao", 40)], []);
  const tieB = selectFocusCompetencyIds([mk("negociacao", 40), mk("visao", 40)], []);
  assertEqual("Empate determinístico (repetível)", tieA.focusCompetencyIds.join(","), tieB.focusCompetencyIds.join(","));
  // visao vem antes de negociacao na ordem canônica
  assertEqual("Empate usa ordem canônica", tieA.focusCompetencyIds[0], "visao");

  /* Y: isDemo propagado */
  assertTrue("Estado prioridade para foco", competencyState(true, 50, true) === "prioridade");
  assertEqual("Estado base", competencyState(false, 20, false), "base");
  assertEqual("Estado contínuo", competencyState(false, 50, false), "observacao");

  // integridade: a matriz funcional cobre todas as competências ativas
  assertEqual("14 competências ativas", activeCompetencies.length, 14);
  assertEqual("Matriz funcional cobre ativas", Object.keys(functionalMatrix).length, activeCompetencies.length);
  for (const c of activeCompetencies) {
    assertTrue(`Competência ${c.id} tem relações na matriz`, (functionalMatrix[c.id]?.length ?? 0) > 0);
  }
  assertEqual("Persuasão de Compra fora das ativas", activeCompetencies.some((c) => c.id === "persuasao-compra"), false);
  assertEqual("Influência e Persuasão única", activeCompetencies.filter((c) => c.id === "influencia-persuasao").length, 1);
  assertTrue("Aplicação comercial registrada", Boolean(commercialApplication));
  assertEqual("Aplicação comercial pai = influencia-persuasao", commercialApplication?.parentCompetencyId, "influencia-persuasao");

  // nenhuma assinatura funcional 100% idêntica entre competências ativas
  assertEqual("Nenhuma assinatura funcional duplicada entre ativas", validateUniqueFunctionalSignatures().length, 0);

  // Negociação mantém 7 comportamentos e mostra no máximo 3 comportamentos-chave
  assertEqual("Negociação com 7 comportamentos", functionalMatrix.negociacao.length, 7);
  const negDistances = activeRelations(functionalMatrix.negociacao).map((relation) => ({
    relation,
    distance: 1,
    movement: "EXPAND_B" as const,
  }));
  assertTrue("Negociação ≤ 3 comportamentos-chave", keyBehaviors(negDistances).length <= 3);

  /* integração com o resultado de demonstração (V1.1) */
  const demoResult = runFullAssessment(demoResponses, SAMPLE_CHALLENGE_IDS, true, {
    lideraPessoas: true,
    participaVendas: true,
  });
  assertEqual("Resultado demo tem 14 competências", demoResult.competencyResults.length, 14);
  assertEqual("Resultado demo tem 20 comportamentos", demoResult.behaviorResults.length, 20);
  assertTrue("resultId presente", Boolean(demoResult.id));
  assertTrue("assessmentSessionId presente", Boolean(demoResult.assessmentSessionId));
  assertEqual(
    "selectedChallenges do resultado = desafios usados",
    JSON.stringify(demoResult.contextData.selectedChallengeIds),
    JSON.stringify(SAMPLE_CHALLENGE_IDS)
  );
  assertTrue(
    "Persuasão de Compra ausente do resultado demo",
    !demoResult.competencyResults.some((r) => r.competencyId === "persuasao-compra")
  );
  assertTrue("Focus demo entre 3 e 5", demoResult.focusCompetencyIds.length >= 3 && demoResult.focusCompetencyIds.length <= 5);
  assertTrue("commercialContextActive (participaVendas)", demoResult.commercialContextActive === true);
  assertTrue(
    "Máx 3 comportamentos-chave em todas as competências",
    demoResult.competencyResults.every((r) => r.keyBehaviors.length <= 3)
  );

  assertTrue("strongFocus regra", strongFocus(40, 60, 30, true) === true);
  assertTrue("strongFocus sem sinal", strongFocus(40, 60, 30, false) === false);
  assertTrue("significativo: 2 nucleares", significantDevelopmentSignal([
    { relation: { behaviorId: "a", requirement: "B+", role: "N" }, distance: 0.5, movement: "EXPAND_B" },
    { relation: { behaviorId: "b", requirement: "B+", role: "N" }, distance: 0.5, movement: "EXPAND_B" },
  ]));

  return true;
}

// Gate de QA: executa na carga do módulo (não-fatal; lança se chamado direto).
try {
  runMethodologySelfTests();
} catch (err) {
  console.error("[MethodologyEngine]", err);
}

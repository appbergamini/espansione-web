import type { AssessmentItem, BehaviorScoringResult } from "@/data/types";
import { ASSESSMENT_VERSION, activeItems } from "@/data/methodology/assessmentItems";
import { canonicalBehaviorId } from "@/data/methodology/behaviorConstructs";

/**
 * =====================================================================
 * MOTOR DE SCORE COMPORTAMENTAL (DETERMINÍSTICO) — V1.0 PRÉ-PILOTO
 * =====================================================================
 * respostas 1–7 → correção de direção (A: 8 - resposta; B: resposta)
 * → média por comportamento → normalização 0–100
 *
 * behaviorScore = ((mean - 1) / 6) × 100
 *
 * O score é POSIÇÃO NO EIXO (0≈A · 100≈B · 50=centro). Não é nota,
 * desempenho ou percentual de competência. Nenhuma direção é superior.
 * =====================================================================
 */

export function getItem(statementId: string): AssessmentItem | undefined {
  return activeItems.find((i) => i.id === statementId);
}

/** Correção de direção: itens A são invertidos (8 - r). Nunca expor ao usuário. */
export function correctResponse(item: AssessmentItem, response: number): number {
  return item.direction === "A" ? 8 - response : response;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calcula o resultado de um comportamento a partir dos seus 3 itens respondidos.
 * Exige exatamente 3 respostas válidas (1–7).
 */
export function computeBehaviorResult(
  items: AssessmentItem[],
  answers: Record<string, number>
): BehaviorScoringResult {
  if (items.length !== 3) {
    throw new Error(
      `Comportamento requer exatamente 3 itens (recebidos ${items.length}).`
    );
  }
  const raw: number[] = [];
  const corrected: number[] = [];
  for (const it of items) {
    const value = answers[it.id];
    if (value == null || value < 1 || value > 7 || !Number.isInteger(value)) {
      throw new Error(
        `Resposta inválida para o item ${it.id} (behavior ${it.behaviorId}): ${String(value)}`
      );
    }
    raw.push(value);
    corrected.push(correctResponse(it, value));
  }

  const mean = corrected.reduce((a, b) => a + b, 0) / corrected.length;
  const score = ((mean - 1) / 6) * 100;

  return {
    behaviorId: canonicalBehaviorId(items[0].behaviorId),
    rawResponses: raw,
    correctedResponses: corrected,
    mean,
    score,
    min: Math.min(...corrected),
    max: Math.max(...corrected),
    range: Math.max(...corrected) - Math.min(...corrected),
    stdDev: standardDeviation(corrected),
    assessmentVersion: ASSESSMENT_VERSION,
  };
}

/**
 * Pontua o Assessment completo (60 respostas válidas) e retorna os 20
 * resultados comportamentais. Lança erro se a conclusão não for válida.
 */
export function scoreAssessment(answers: Record<string, number>): BehaviorScoringResult[] {
  const items = activeItems;
  if (items.length !== 60) {
    throw new Error("Assessment incompleto: esperadas 60 respostas.");
  }

  const byBehavior = new Map<string, AssessmentItem[]>();
  for (const it of items) {
    const cid = canonicalBehaviorId(it.behaviorId);
    byBehavior.set(cid, [...(byBehavior.get(cid) ?? []), it]);
  }

  const results: BehaviorScoringResult[] = [];
  for (const [cid, behaviorItems] of byBehavior) {
    results.push(computeBehaviorResult(behaviorItems, answers));
  }
  return results;
}

/** Monta um mapa behaviorId → resultado. */
export const behaviorResultsById = (results: BehaviorScoringResult[]) =>
  new Map(results.map((r) => [r.behaviorId, r]));

/* ---------------------------------------------------------------------------
 * TESTES DE SCORE OBRIGATÓRIOS (QA da metodologia)
 * ------------------------------------------------------------------------- */

export function runScoreSelfTests(): boolean {
  const assert = (name: string, actual: number, expected: number, tolerance = 1e-9) => {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`Self-test falhou — ${name}: esperado ${expected}, obtido ${actual}`);
    }
  };

  const mkItems = (direction: "A" | "B"): AssessmentItem[] =>
    ["x", "y", "z"].map((id, order) => ({
      id,
      text: "t",
      behaviorId: "teste",
      direction,
      block: order + 1,
      order: 1,
      active: true,
      assessmentVersion: ASSESSMENT_VERSION,
    }));

  // CASO 1–4: médias uniformes → scores esperados
  assert("Caso 1 (1,1,1) → 0", computeBehaviorResult(mkItems("B"), { x: 1, y: 1, z: 1 }).score, 0);
  assert("Caso 2 (3,3,3) → ≈33,33", computeBehaviorResult(mkItems("B"), { x: 3, y: 3, z: 3 }).score, 100 / 3);
  assert("Caso 3 (4,4,4) → 50", computeBehaviorResult(mkItems("B"), { x: 4, y: 4, z: 4 }).score, 50);
  assert("Caso 4 (7,7,7) → 100", computeBehaviorResult(mkItems("B"), { x: 7, y: 7, z: 7 }).score, 100);

  // CASO 5–7: correção de direção
  assert("Caso 5 (A, resposta 7 → 1)", correctResponse(mkItems("A")[0], 7), 1);
  assert("Caso 6 (A, resposta 1 → 7)", correctResponse(mkItems("A")[0], 1), 7);
  assert("Caso 7 (B, resposta 7 → 7)", correctResponse(mkItems("B")[0], 7), 7);

  return true;
}

// Gate de QA: executa os self-tests na carga do módulo. Falhas são
// registradas no console (não interrompem a renderização); runScoreSelfTests()
// lança Error se for chamada explicitamente (ex.: em testes de CI).
try {
  runScoreSelfTests();
} catch (err) {
  console.error("[BehaviorScoring]", err);
}

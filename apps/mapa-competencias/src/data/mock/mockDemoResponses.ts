import { assessmentItems } from "@/data/methodology/assessmentItems";

/**
 * =====================================================================
 * RESPOSTAS DE DEMONSTRAÇÃO (PROTÓTIPO) — DEMO/DEV FEATURE
 * =====================================================================
 * Preenchem as 60 questões reais com valores 1–7 (determinísticos) para o
 * recurso "Preencher respostas de exemplo". Geram scores pelos MESMOS
 * cálculos do Assessment real, porém o resultado é marcado isDemo = true.
 *
 * NÃO misturar com respostas reais de piloto.
 * =====================================================================
 */

function demoValueFor(id: string, order: number): number {
  // determinístico e dentro de 2–6 (evita extremos demais na demo)
  return ((id.charCodeAt(0) + id.charCodeAt(id.length - 1) + order) % 5) + 2;
}

export const demoResponses: Record<string, number> = Object.fromEntries(
  assessmentItems.map((item) => [item.id, demoValueFor(item.id, item.order)])
);

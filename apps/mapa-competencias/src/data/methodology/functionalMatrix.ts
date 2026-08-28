import type { FunctionalRelation } from "../types";
import { FUNCTIONAL_MATRIX_VERSION } from "./versions";

/**
 * =====================================================================
 * MATRIZ FUNCIONAL — V1.0 PRÉ-PILOTO (regra oficial Espansione)
 * =====================================================================
 * Para cada relação competência × comportamento:
 *   requirement: A+ | B+ | EQ  (direção favorecida / equilíbrio)
 *   role:         N (Nuclear, peso 1.0) | S (Suporte, peso 0.5)
 *                 | S* (Experimental, peso 0.0 — cadastrado p/ rastreabilidade,
 *                    não influencia o cálculo nesta versão)
 *
 * Usa os IDs CANÔNICOS. Conjunto de comportamentos por competência é idêntico
 * ao da relação oficial competência × comportamento já aprovada.
 * =====================================================================
 */

export const functionalMatrix: Record<string, FunctionalRelation[]> = {
  "analise-solucao-problemas": [
    { behaviorId: "reflexivo", requirement: "B+", role: "N" },
    { behaviorId: "realista", requirement: "EQ", role: "N" },
    { behaviorId: "baseado-em-fatos", requirement: "EQ", role: "N" },
    { behaviorId: "ponderado", requirement: "EQ", role: "N" },
  ],
  "defender-mudancas": [
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "ritmo-de-trabalho", requirement: "B+", role: "N" },
    { behaviorId: "tolerancia-frustracao", requirement: "B+", role: "N" },
    { behaviorId: "realista", requirement: "EQ", role: "N" },
    { behaviorId: "ponderado", requirement: "EQ", role: "N" },
  ],
  visao: [
    { behaviorId: "reflexivo", requirement: "B+", role: "N" },
    { behaviorId: "realista", requirement: "A+", role: "N" },
    { behaviorId: "ponderado", requirement: "EQ", role: "S" },
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "autossuficiencia", requirement: "EQ", role: "S" },
    { behaviorId: "ritmo-de-trabalho", requirement: "B+", role: "S" },
  ],
  "julgamento-decisivo": [
    { behaviorId: "baseado-em-fatos", requirement: "EQ", role: "N" },
    { behaviorId: "realista", requirement: "EQ", role: "N" },
    { behaviorId: "ponderado", requirement: "EQ", role: "N" },
    { behaviorId: "autossuficiencia", requirement: "EQ", role: "N" },
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
  ],
  "orientacao-resultados": [
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "autossuficiencia", requirement: "B+", role: "N" },
    { behaviorId: "ritmo-de-trabalho", requirement: "B+", role: "N" },
    { behaviorId: "realista", requirement: "B+", role: "N" },
    { behaviorId: "tolerancia-frustracao", requirement: "B+", role: "N" },
  ],
  "aperfeicoamento-continuo": [
    { behaviorId: "realista", requirement: "EQ", role: "N" },
    { behaviorId: "orientacao-detalhes", requirement: "B+", role: "N" },
    { behaviorId: "planejamento-organizacao", requirement: "B+", role: "N" },
    { behaviorId: "necessidade-reconhecimento", requirement: "EQ", role: "S" },
  ],
  "planejamento-e-organizacao": [
    { behaviorId: "logico", requirement: "B+", role: "N" },
    { behaviorId: "realista", requirement: "B+", role: "N" },
    { behaviorId: "planejamento-organizacao", requirement: "B+", role: "N" },
    { behaviorId: "multitarefa", requirement: "B+", role: "S" },
  ],
  "foco-no-cliente": [
    { behaviorId: "observador", requirement: "B+", role: "N" },
    { behaviorId: "positividade-pessoas", requirement: "B+", role: "N" },
    { behaviorId: "assertividade", requirement: "B+", role: "S" },
    { behaviorId: "ritmo-de-trabalho", requirement: "B+", role: "S" },
  ],
  flexibilidade: [
    { behaviorId: "otimismo", requirement: "B+", role: "N" },
    { behaviorId: "tolerancia-critica", requirement: "B+", role: "N" },
    { behaviorId: "autocontrole", requirement: "B+", role: "N" },
  ],
  "influencia-persuasao": [
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "sociabilidade", requirement: "B+", role: "N" },
    { behaviorId: "ritmo-de-trabalho", requirement: "B+", role: "N" },
  ],
  "gerenciando-outros": [
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "positividade-pessoas", requirement: "EQ", role: "N" },
    { behaviorId: "necessidade-ser-estimado", requirement: "EQ", role: "S" },
    { behaviorId: "sociabilidade", requirement: "B+", role: "S" },
    { behaviorId: "ritmo-de-trabalho", requirement: "B+", role: "S" },
    { behaviorId: "autossuficiencia", requirement: "EQ", role: "N" },
    { behaviorId: "otimismo", requirement: "B+", role: "S" },
  ],
  "desenvolvimento-pessoas": [
    { behaviorId: "positividade-pessoas", requirement: "EQ", role: "N" },
    { behaviorId: "necessidade-ser-estimado", requirement: "EQ", role: "S" },
    { behaviorId: "observador", requirement: "B+", role: "N" },
    { behaviorId: "necessidade-reconhecimento", requirement: "EQ", role: "S*" },
  ],
  "administracao-relacionamentos": [
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "necessidade-ser-estimado", requirement: "EQ", role: "S" },
    { behaviorId: "observador", requirement: "B+", role: "N" },
    { behaviorId: "positividade-pessoas", requirement: "B+", role: "N" },
    { behaviorId: "sociabilidade", requirement: "B+", role: "N" },
    { behaviorId: "autocontrole", requirement: "B+", role: "S" },
    { behaviorId: "tolerancia-critica", requirement: "B+", role: "N" },
  ],
  negociacao: [
    { behaviorId: "assertividade", requirement: "B+", role: "N" },
    { behaviorId: "necessidade-ser-estimado", requirement: "EQ", role: "S" },
    { behaviorId: "positividade-pessoas", requirement: "EQ", role: "N" },
    { behaviorId: "observador", requirement: "B+", role: "N" },
    { behaviorId: "tolerancia-frustracao", requirement: "B+", role: "N" },
    { behaviorId: "tolerancia-critica", requirement: "B+", role: "N" },
    { behaviorId: "autocontrole", requirement: "B+", role: "N" },
  ],
};

export { FUNCTIONAL_MATRIX_VERSION };

/** Pesos por papel funcional. */
export const FUNCTIONAL_ROLE_WEIGHT: Record<"N" | "S" | "S*", number> = {
  N: 1.0,
  S: 0.5,
  "S*": 0.0,
};

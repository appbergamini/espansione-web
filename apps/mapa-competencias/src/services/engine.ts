import type { CompetencyState } from "@/data/types";

/**
 * =====================================================================
 * CAMADA DE SERVIÇO DO MOTOR DE CÁLCULO — PREPARADA (NÃO FINALIZADA)
 * =====================================================================
 * Arquitetura futura:
 *
 *   respostas (1–7)
 *   → assessmentEngine / behaviorScoring  → score 0–100 por comportamento
 *   → competencyEngine                     → leitura qualitativa das competências
 *   + challengeRelevanceWeights            → relevância a partir dos desafios
 *   → priorityEngine                       → prioridades (cruzamento)
 *
 * REGRA DO PRODUTO: a lógica será DETERMINÍSTICA — mesmas respostas + mesmo
 * contexto = mesmo resultado.
 *
 * NENHUM peso, faixa ou regra psicométrica definitiva foi implementado.
 * Os stubs abaixo existem apenas para preparar a estrutura.
 * =====================================================================
 */

/** Resposta de uma afirmação do assessment (escala 1–7). */
export interface AnswerInput {
  statementId: number;
  answer: number;
}

/** Score de um comportamento no eixo comportamental (0–100). 0 ≠ ruim, 100 ≠ ótimo. */
export interface BehaviorScore {
  behaviorId: string;
  score: number;
}

/** Leitura qualitativa de uma competência. */
export interface CompetencyRead {
  competencyId: string;
  state: CompetencyState;
}

/** Candidato a prioridade: necessidade (comportamental) × relevância (contexto). */
export interface PriorityCandidate {
  competencyId: string;
  need: number;
  relevance: number;
}

export const assessmentEngine = {
  /**
   * respostas → scores dos comportamentos.
   * TODO: implementar com o banco definitivo de 60 afirmações e regras de
   * pontuação oficiais (incluindo inversão por `direction`).
   */
  computeBehaviorScores(_answers: AnswerInput[]): BehaviorScore[] {
    return [];
  },
};

export const behaviorScoring = {
  /** pontuação individual de um comportamento. TODO: regras oficiais. */
  score(_answers: AnswerInput[], _behaviorId: string): number {
    return 50;
  },
};

export const competencyEngine = {
  /**
   * leitura qualitativa das competências a partir dos comportamentos.
   * Nunca inferir uma competência de uma única pergunta; nunca calcular
   * "percentual de competência".
   * TODO: regras oficiais de interpretação.
   */
  read(_behaviorScores: BehaviorScore[]): CompetencyRead[] {
    return [];
  },
};

export const priorityEngine = {
  /**
   * prioridades = cruzamento entre NECESSIDADE DE DESENVOLVIMENTO
   * (leitura comportamental) e RELEVÂNCIA PARA O PRÓXIMO NÍVEL
   * (contexto/desafios escolhidos).
   * TODO: regras oficiais.
   */
  prioritize(
    _competencies: CompetencyRead[],
    _challengeIds: string[]
  ): PriorityCandidate[] {
    return [];
  },
};

/**
 * Matriz de pesos desafio × competência (RELEVÂNCIA PARA O PRÓXIMO NÍVEL).
 *
 * A seleção de desafios do participante será usada futuramente para calcular a
 * relevância de cada competência para o próximo nível.
 *
 * ESTA MATRIZ SERÁ FORNECIDA na próxima etapa — manter vazia por enquanto.
 * NÃO inventar pesos definitivos.
 */
export interface ChallengeRelevanceWeight {
  challengeId: string;
  competencyId: string;
  /** 0–100 · peso da competência diante do desafio (a definir oficialmente) */
  relevanceWeight: number;
}

export const challengeRelevanceWeights: ChallengeRelevanceWeight[] = [];

import type { Participant } from "@/data/types";

/**
 * DADOS DE DEMONSTRAÇÃO — "Participante Exemplo"
 * Fictício, apenas para revisão do protótipo. Não faz parte da metodologia.
 */
export const SAMPLE_PARTICIPANT: Participant = {
  name: "Participante Exemplo",
  atuacao: "CEO e fundador — serviços B2B",
  empresa: "10 a 49 funcionários",
  lideraPessoas: true,
  participaVendas: true,
};

/** Desafios selecionados no protótipo (máximo 3). */
export const SAMPLE_CHALLENGE_IDS = [
  "escalar_vendas",
  "autonomia_time",
  "processos_crescimento",
];

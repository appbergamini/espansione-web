import type { Challenge } from "./types";

/** Desafios do contexto — seleção de até 3 na etapa "O que precisa acontecer...". */
export const challenges: Challenge[] = [
  { id: "escalar_vendas", label: "Escalar vendas e ampliar a carteira de clientes" },
  { id: "autonomia_time", label: "Reduzir a dependência do fundador, aumentando a autonomia do time" },
  { id: "processos_crescimento", label: "Estruturar processos e rotinas para sustentar o crescimento" },
  { id: "liderancas", label: "Formar e desenvolver lideranças no time" },
  { id: "produtividade", label: "Aumentar produtividade, eficiência e consistência das entregas" },
  { id: "novos_mercados", label: "Expandir para novos mercados, clientes ou segmentos" },
  { id: "modernizar", label: "Conduzir mudanças e modernizar a operação" },
  { id: "previsibilidade", label: "Tornar vendas e resultados mais consistentes e previsíveis" },
  { id: "negociacao", label: "Melhorar negociações com clientes, fornecedores e parceiros" },
  { id: "direcao_comum", label: "Alinhar o time em torno de prioridades e uma direção comum" },
  { id: "clareza_decisoes", label: "Tomar decisões importantes com mais clareza e segurança" },
  { id: "retencao_clientes", label: "Melhorar experiência, relacionamento e retenção de clientes" },
];

export const challengeById = new Map(challenges.map((c) => [c.id, c]));

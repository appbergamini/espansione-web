// @espansione/cis
// Instrumento comportamental (Mapeamento Comportamental) — itens, cálculo
// e a camada de pilares que o Teste de Competências consome.
//
// Nomenclatura: "Mapeamento Comportamental" em toda superfície de cliente.
// Nunca o nome do instrumento de origem, nunca os rótulos de fator.

export {
  BLOCOS_RANKING,
  PARES_FORCADOS,
  PESOS_RANKING,
  PESO_PAR,
  TOTAL_BRUTO,
} from './instrumento.js';

export { calcularScores, COEFICIENTES } from './scoring.js';

export {
  PILARES,
  ROTULO_PILAR,
  LEXICO_PILAR,
  ETIQUETA_POR_CONTEXTO,
  derivarPilares,
  lerGap,
} from './pilares.js';

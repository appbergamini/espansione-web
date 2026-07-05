// =====================================================================
// Helpers do catálogo do Mapa de Identidade (FINAL — 30/público).
// Camada de acesso sobre catalog.generated.js (fonte = Excel).
// =====================================================================
import {
  CATALOGO_IDENTIDADE,
  MATRIZ_INDICADORES,
  PUBLICOS_IDENTIDADE,
} from './catalog.generated.js';

export { CATALOGO_IDENTIDADE, MATRIZ_INDICADORES, PUBLICOS_IDENTIDADE };

export const VALOR_NA = -1;
export const MAX_MATURITY = 3;

// 4 sistemas na ordem canônica (derivados da matriz)
export const SISTEMAS = MATRIZ_INDICADORES.reduce(
  (acc, i) => (acc.includes(i.sistema) ? acc : [...acc, i.sistema]),
  []
);

const DRIVER_FAMILIES = ['choice_driver', 'choice_driver_main', 'value_driver', 'improvement_driver'];

const BY_ID = new Map(CATALOGO_IDENTIDADE.map((q) => [q.id, q]));
export function perguntaById(id) {
  return BY_ID.get(id) || null;
}

export function perguntasPorPublico(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.publico === publico);
}

// núcleo comparável (24) de um público — o que compõe a maturidade e a triangulação
export function maturidadeCore(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.publico === publico && q.score_family === 'maturity');
}

export function npsCore(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.publico === publico && q.score_family === 'nps');
}

export function satisfacaoCore(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.publico === publico && q.score_family === 'satisfaction');
}

export function driversCore(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.publico === publico && DRIVER_FAMILIES.includes(q.score_family));
}

// bloco aberto (só sócios) e demais abertas
export function abertasDoPublico(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.publico === publico && q.aberta);
}

// perguntas obrigatórias ainda não respondidas por UM respondente (considera condicional).
// "Não sei/Não se aplica" (-1) conta como respondida em escalas.
export function obrigatoriasFaltando(publico, answers = {}) {
  const faltando = [];
  for (const q of perguntasPorPublico(publico)) {
    if (!q.obrigatoria) continue;
    if (q.regra_condicional) {
      const dep = answers[q.regra_condicional.depende];
      if (!q.regra_condicional.valores.includes(String(dep))) continue;
    }
    const v = answers[q.id];
    const respondida = q.response_type.startsWith('escala') ? typeof v === 'number' : v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
    if (!respondida) faltando.push(q.id);
  }
  return faltando;
}

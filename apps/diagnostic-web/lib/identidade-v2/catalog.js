// =====================================================================
// Mapa de Identidade Estratégica (MVP v1) — acesso ao catálogo.
// Helpers à mão sobre CATALOGO_IDENTIDADE (gerado do Excel validado).
// NÃO duplicar metadados aqui; tudo vem do catálogo gerado.
// =====================================================================
import { CATALOGO_IDENTIDADE } from './catalog.generated.js';

export { CATALOGO_IDENTIDADE };

export const SISTEMAS = ['Marca', 'Negócios', 'Comunicação', 'Pessoas'];
export const PUBLICOS = ['socios', 'colaboradores', 'clientes'];
export const SUBPERFIL_LIDER = 'lider';

const byId = new Map(CATALOGO_IDENTIDADE.map((q) => [q.id, q]));

/** Pergunta pelo ID do catálogo. */
export function getPergunta(id) {
  return byId.get(id) || null;
}

const ordenar = (qs) => qs.slice().sort((a, b) => (a.ordem_core ?? 9999) - (b.ordem_core ?? 9999));

/**
 * Filtro genérico do Core por público.
 * @param {string} publico  socios | colaboradores | clientes
 * @param {object} [opts]
 * @param {string} [opts.familia]      filtra por score_family (ex.: 'maturity')
 * @param {boolean} [opts.incluirLider=true]  inclui o bloco condicional de líder
 */
export function perguntasCore(publico, { familia, incluirLider = true } = {}) {
  return ordenar(
    CATALOGO_IDENTIDADE.filter((q) => {
      if (q.tier_mvp !== 'Core' || q.publico !== publico) return false;
      if (familia && q.score_family !== familia) return false;
      if (!incluirLider && q.subperfil === SUBPERFIL_LIDER) return false;
      return true;
    }),
  );
}

/** Perguntas de maturidade do Core de um público (entram na nota). */
export function maturidadeCore(publico, opts = {}) {
  return perguntasCore(publico, { ...opts, familia: 'maturity' });
}

/** Formulário de colaboradores; com líder=true inclui o bloco condicional. */
export function formularioColaboradores({ lider = false } = {}) {
  return maturidadeCore('colaboradores', { incluirLider: lider });
}

/** Formulário de clientes/fornecedores. */
export function formularioClientes() {
  return maturidadeCore('clientes');
}

/** Bloco condicional de líder no Core (autoavaliação de maturidade — 5 perguntas). */
export function blocoLider() {
  return ordenar(
    CATALOGO_IDENTIDADE.filter(
      (q) => q.subperfil === SUBPERFIL_LIDER && q.tier_mvp === 'Core' && q.score_family === 'maturity',
    ),
  );
}

/** Pergunta(s) de priorização (score_family none) de um público. */
export function priorizacao(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.sistema === 'Priorização' && q.publico === publico);
}

/** Perguntas de NPS/eNPS no Core de um público (índice à parte; entra na v1). */
export function npsCore(publico) {
  return ordenar(CATALOGO_IDENTIDADE.filter((q) => q.score_family === 'nps' && q.tier_mvp === 'Core' && q.publico === publico));
}

/** Campos de perfil de um público. */
export function perfil(publico) {
  return CATALOGO_IDENTIDADE.filter((q) => q.sistema === 'Perfil' && q.publico === publico);
}

/**
 * Indicadores canônicos comparáveis entre públicos (cobertura 2P/3P) —
 * base da tabela de gaps Sócios × Equipe × Externo.
 */
export function indicadoresComparaveis() {
  const map = new Map();
  for (const q of CATALOGO_IDENTIDADE) {
    if (q.score_family !== 'maturity' || !q.indicador_canonico) continue;
    const e = map.get(q.indicador_canonico) || { indicador_canonico: q.indicador_canonico, sistema: q.sistema, publicos: new Set(), cobertura: q.anchor_cobertura };
    e.publicos.add(q.publico);
    map.set(q.indicador_canonico, e);
  }
  return [...map.values()]
    .filter((e) => e.publicos.size >= 2)
    .map((e) => ({ ...e, publicos: [...e.publicos] }));
}

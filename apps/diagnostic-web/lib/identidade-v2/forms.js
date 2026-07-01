// =====================================================================
// Mapa de Identidade Estratégica (MVP v1) — montagem de formulário.
// Decide, a partir do catálogo, QUAIS perguntas um respondente vê (por
// público e perfil de líder) e valida o preenchimento.
// =====================================================================
import {
  perfil,
  priorizacao,
  npsCore,
  maturidadeCore,
  formularioColaboradores,
  formularioClientes,
} from './catalog.js';

/**
 * Monta o formulário de um respondente do Mapa de Identidade (instrumento
 * único e independente do Mapa de Maturidade). Ordem: perfil → maturidade →
 * eNPS/NPS → priorização.
 * @param {string} publico  socios | colaboradores | clientes
 * @param {object} [opts]
 * @param {boolean} [opts.lider=false]  colaborador que é líder (abre bloco condicional)
 * @returns {Array} perguntas ordenadas
 */
export function montarFormulario(publico, { lider = false } = {}) {
  const perfilQs = perfil(publico);
  if (publico === 'socios') {
    return [...perfilQs, ...maturidadeCore('socios'), ...priorizacao('socios')];
  }
  if (publico === 'colaboradores') {
    return [...perfilQs, ...formularioColaboradores({ lider }), ...npsCore('colaboradores'), ...priorizacao('colaboradores')];
  }
  if (publico === 'clientes') {
    return [...perfilQs, ...formularioClientes(), ...npsCore('clientes'), ...priorizacao('clientes')];
  }
  return [];
}

/** Uma resposta está preenchida? (N/A = -1 conta como resposta válida.) */
export function respostaPreenchida(pergunta, valor) {
  switch (pergunta.response_type) {
    case 'escala4_concordancia':
    case 'escala4_frequencia':
    case 'escala_0_10':
    case 'escala_0_10_nps':
    case 'numero':
      return typeof valor === 'number' && Number.isFinite(valor);
    case 'multipla_ate3':
      return Array.isArray(valor) && valor.length >= 1;
    default: // texto_curto, selecao_unica, etc.
      return typeof valor === 'string' ? valor.trim().length > 0 : valor != null && valor !== '';
  }
}

/**
 * IDs das perguntas obrigatórias ainda não preenchidas.
 * @param {Array} perguntas  saída de montarFormulario
 * @param {Object} answers   { questionId: valor }
 */
export function obrigatoriasFaltando(perguntas, answers = {}) {
  return perguntas
    .filter((p) => p.obrigatoria && !respostaPreenchida(p, answers[p.id]))
    .map((p) => p.id);
}

/** Quantas das perguntas exibidas já foram respondidas (para a barra de progresso). */
export function progresso(perguntas, answers = {}) {
  const respondidas = perguntas.filter((p) => respostaPreenchida(p, answers[p.id])).length;
  return { respondidas, total: perguntas.length };
}

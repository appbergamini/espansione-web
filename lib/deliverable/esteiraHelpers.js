// lib/deliverable/esteiraHelpers.js
//
// TASK FIX.4 — helpers que cruzam o grafo do catálogo com o estado
// atual dos outputs de um projeto. Não acessam banco diretamente —
// recebem `outputsDoProjeto` como entrada pra ficarem testáveis e
// reutilizáveis entre API, UI e pipeline.

import {
  CATALOGO_AGENTES,
  getAgenteByNum,
  getDependentes,
  getPrimeiroFaltante,
  podeExecutar,
} from '../agents/catalog';

/**
 * @typedef {Object} CascataExclusao
 * @property {number}   alvo              agent_num solicitado para exclusão
 * @property {number[]} dependentes       agent_nums que serão invalidados
 *                                        em cascata (dependem transitivamente
 *                                        do alvo E têm output presente).
 * @property {number}   total_afetados    1 + dependentes.length
 * @property {boolean}  tem_cascata       dependentes.length > 0
 */

/**
 * Analisa o efeito em cascata de apagar um output.
 *
 * @param {number} agentNumAApagar
 * @param {Array<{agent_num:number}>} outputsDoProjeto
 * @returns {CascataExclusao}
 */
export function analisarCascataExclusao(agentNumAApagar, outputsDoProjeto = []) {
  const alvo = Number(agentNumAApagar);
  const presentes = new Set(
    (outputsDoProjeto || [])
      .map(o => Number(o?.agent_num))
      .filter(Number.isFinite),
  );

  const dependentesTeoricos = getDependentes(alvo);
  const dependentes = dependentesTeoricos.filter(n => presentes.has(n));

  return {
    alvo,
    dependentes,
    total_afetados: 1 + dependentes.length,
    tem_cascata: dependentes.length > 0,
  };
}

/**
 * Determina qual é o próximo agente que pode ou deve ser executado,
 * considerando o estado atual. Prioriza o primeiro faltante; se esse
 * primeiro ainda não tem dependências satisfeitas, retorna `bloqueado=true`
 * com a lista de faltantes — a UI decide como apresentar.
 *
 * @param {Array<{agent_num:number}>} outputsDoProjeto
 * @param {boolean} [incluiEvp=false]  Considera Agente 14 como esperado
 * @returns {{ agente: number, bloqueado: boolean, dependenciasAusentes: number[], meta: import('../agents/catalog').AgenteMeta|null }|null}
 */
export function determinarProximoAgente(outputsDoProjeto = [], incluiEvp = false) {
  const presentes = (outputsDoProjeto || [])
    .map(o => Number(o?.agent_num))
    .filter(Number.isFinite);

  const faltante = getPrimeiroFaltante(presentes, incluiEvp);
  if (faltante === null) return null;

  const { ok, faltando } = podeExecutar(faltante, presentes);
  return {
    agente: faltante,
    bloqueado: !ok,
    dependenciasAusentes: faltando,
    meta: getAgenteByNum(faltante),
  };
}

/**
 * Dado o conjunto de outputs presentes, retorna a agent_num do "maior
 * output consecutivo" a partir do 1 — útil pra `etapa_atual` do projeto
 * pós-exclusão em cascata. Se outputs=[1,2,3,5] retorna 3 (quebrou no 4).
 *
 * @param {Array<{agent_num:number}>} outputsDoProjeto
 * @returns {number}
 */
export function ultimaEtapaConsecutiva(outputsDoProjeto = []) {
  const set = new Set(
    (outputsDoProjeto || [])
      .map(o => Number(o?.agent_num))
      .filter(Number.isFinite),
  );
  // Ordem canônica não-modular (1..13 + 15). Modulares pulam.
  const ordenados = CATALOGO_AGENTES
    .filter(a => !a.modular)
    .map(a => a.agent_num)
    .sort((a, b) => a - b);

  let ultima = 0;
  for (const num of ordenados) {
    if (set.has(num)) ultima = num;
    else break;
  }
  return ultima;
}

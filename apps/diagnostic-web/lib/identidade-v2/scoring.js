// =====================================================================
// Mapa de Identidade Estratégica (MVP v1) — engine de score (puro).
// Generaliza mapa-maturidade/scoring.js: escala 0–3, N/A=-1 excluída,
// hierarquia indicador_canonico → objetivo → sistema → geral, dirigida
// por score_family. SEM peso na v1 (média simples).
//
// Famílias:
//   maturity      → nota normalizada (média válidas ÷ 3) × 100  [entra na nota]
//   nps           → (%promotores − %detratores), índice à parte
//   satisfaction  → média 0–10, índice à parte
//   none/priorização → ranking por frequência (não pontua)
// =====================================================================
import {
  SISTEMAS,
  indicadoresComparaveis,
  maturidadeCore,
  formularioMaturidadeFree,
  npsCore,
  priorizacao,
} from './catalog.js';

const NA = -1;
const MAX_MATURITY = 3;

/** Média das respostas válidas (>=0); ignora N/A (-1) e ausentes. null se nenhuma. */
export function mediaValidas(valores) {
  const v = valores.filter((x) => typeof x === 'number' && x >= 0);
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

/** Normaliza média 0–3 em 0–100. */
export function notaNormalizada(media) {
  return media == null ? null : Math.round((media / MAX_MATURITY) * 1000) / 10;
}

/**
 * Pool de respostas de uma pergunta entre vários respondentes.
 * @param {Array<Object>} respondentes  cada um = { [questionId]: value }
 */
function poolPergunta(respondentes, qid) {
  return respondentes.map((r) => r[qid]).filter((x) => x !== undefined && x !== null);
}

/**
 * Agrega a maturidade de um público.
 * @param {Array<Object>} respondentes  respostas (questionId→valor) de cada respondente
 * @param {Array<Object>} perguntas     perguntas de maturidade Core do público (do catálogo)
 * @returns {{ geral:number|null, sistemas:Object, indicadores:Object, nRespondentes:number }}
 */
export function agregarMaturidade(respondentes, perguntas) {
  // 1) média por pergunta (pool entre respondentes)
  const mediaPergunta = {};
  for (const p of perguntas) mediaPergunta[p.id] = mediaValidas(poolPergunta(respondentes, p.id));

  // 2) indicador_canonico = média das perguntas dele → normaliza
  const indMedias = {}; // canon -> { medias:[], sistema, objetivo }
  for (const p of perguntas) {
    const canon = p.indicador_canonico;
    if (!canon) continue;
    const m = mediaPergunta[p.id];
    if (m == null) continue;
    (indMedias[canon] = indMedias[canon] || { medias: [], sistema: p.sistema, objetivo: p.objetivo }).medias.push(m);
  }
  const indicadores = {};
  for (const [canon, e] of Object.entries(indMedias)) {
    indicadores[canon] = {
      nota: notaNormalizada(mediaValidas(e.medias)),
      sistema: e.sistema,
      objetivo: e.objetivo,
    };
  }

  // 3) objetivo = média dos indicadores; sistema = média dos objetivos; geral = média dos 4 sistemas
  const sistemas = {};
  for (const sis of SISTEMAS) {
    const indsDoSis = Object.values(indicadores).filter((i) => i.sistema === sis && i.nota != null);
    if (!indsDoSis.length) {
      sistemas[sis] = { nota: null, objetivos: {} };
      continue;
    }
    const objMap = {};
    for (const i of indsDoSis) (objMap[i.objetivo] = objMap[i.objetivo] || []).push(i.nota);
    const objetivos = {};
    for (const [obj, notas] of Object.entries(objMap)) objetivos[obj] = round1(avg(notas));
    sistemas[sis] = { nota: round1(avg(Object.values(objetivos))), objetivos };
  }
  const notasSistemas = SISTEMAS.map((s) => sistemas[s].nota).filter((n) => n != null);
  const geral = notasSistemas.length ? round1(avg(notasSistemas)) : null;

  return { geral, sistemas, indicadores, nRespondentes: respondentes.length };
}

/** NPS / eNPS a partir de notas 0–10. */
export function calcularNps(valores) {
  const v = valores.filter((x) => typeof x === 'number' && x >= 0 && x <= 10);
  if (!v.length) return { score: null, total: 0, promotores: 0, neutros: 0, detratores: 0 };
  const promotores = v.filter((x) => x >= 9).length;
  const detratores = v.filter((x) => x <= 6).length;
  const neutros = v.length - promotores - detratores;
  return {
    score: Math.round(((promotores - detratores) / v.length) * 100),
    total: v.length,
    promotores,
    neutros,
    detratores,
  };
}

/** Satisfação 0–10: média. */
export function calcularSatisfacao(valores) {
  const v = valores.filter((x) => typeof x === 'number' && x >= 0 && x <= 10);
  return v.length ? { media: round1(v.reduce((a, b) => a + b, 0) / v.length), total: v.length } : { media: null, total: 0 };
}

/**
 * Gaps entre públicos por indicador_canonico comparável ([2P]/[3P]).
 * @param {Object} maturidadePorPublico  { socios:{indicadores}, colaboradores:{...}, clientes:{...} }
 */
export function calcularGaps(maturidadePorPublico) {
  const comparaveis = indicadoresComparaveis();
  const gaps = [];
  for (const c of comparaveis) {
    const porPublico = {};
    for (const pub of c.publicos) {
      const nota = maturidadePorPublico[pub]?.indicadores?.[c.indicador_canonico]?.nota;
      if (nota != null) porPublico[pub] = nota;
    }
    const notas = Object.values(porPublico);
    if (notas.length < 2) continue;
    const max = Math.max(...notas);
    const min = Math.min(...notas);
    gaps.push({
      indicador_canonico: c.indicador_canonico,
      sistema: c.sistema,
      cobertura: c.cobertura,
      porPublico,
      max,
      min,
      gap: round1(max - min),
    });
  }
  return gaps.sort((a, b) => b.gap - a.gap);
}

/**
 * Ranking de priorização: conta frequência das escolhas (até 3 por respondente).
 * @param {Array<Array<string>>} escolhas  array de seleções por respondente
 */
export function agregarPriorizacao(escolhas) {
  const cont = {};
  for (const sel of escolhas) for (const tema of (sel || [])) cont[tema] = (cont[tema] || 0) + 1;
  return Object.entries(cont)
    .map(([tema, count]) => ({ tema, count }))
    .sort((a, b) => b.count - a.count);
}

/** Perguntas de maturidade que entram na nota de um público/produto. */
function maturidadeDoPublico(publico, produto) {
  if (publico === 'socios' && produto === 'maturidade_free') return formularioMaturidadeFree();
  return maturidadeCore(publico);
}

/**
 * Monta o result_json completo a partir das respostas por público.
 * @param {object} args
 * @param {Object<string, Array<Object>>} args.respostasPorPublico  { socios:[map], colaboradores:[map], clientes:[map] }
 * @param {string} args.produto
 * @param {string} [args.geradoEm]  ISO timestamp (injetado pelo caller)
 */
export function montarResultado({ respostasPorPublico, produto, geradoEm = null }) {
  const porPublico = {};
  const indices = {};
  const priorizacaoOut = {};

  for (const [publico, respondentes] of Object.entries(respostasPorPublico)) {
    if (!respondentes || !respondentes.length) continue;

    // maturidade
    porPublico[publico] = agregarMaturidade(respondentes, maturidadeDoPublico(publico, produto));

    // NPS / eNPS (1ª pergunta nps do público, se houver)
    const npsQ = npsCore(publico)[0];
    if (npsQ) {
      const valores = respondentes.map((r) => r[npsQ.id]).filter((x) => typeof x === 'number');
      const chave = publico === 'colaboradores' ? 'enps' : 'nps';
      indices[chave] = { publico, ...calcularNps(valores) };
    }

    // priorização (1ª pergunta de priorização do público)
    const priQ = priorizacao(publico)[0];
    if (priQ) {
      priorizacaoOut[publico] = agregarPriorizacao(respondentes.map((r) => r[priQ.id]));
    }
  }

  const gaps = calcularGaps(porPublico);

  return { produto, geradoEm, porPublico, gaps, indices, priorizacao: priorizacaoOut };
}

// helpers numéricos
function avg(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function round1(n) { return n == null ? null : Math.round(n * 10) / 10; }

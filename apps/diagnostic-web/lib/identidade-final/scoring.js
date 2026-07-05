// =====================================================================
// Mapa de Identidade (FINAL) — engine de score + triangulação (puro).
// =====================================================================
// Núcleo (score_family=maturity): escala concordância 0–3, N/A=-1 excluído.
//   nota do indicador = (média das válidas ÷ 3) × 100  (1 pergunta = 1 indicador)
//   sistema = média dos 6 indicadores; geral = média dos 4 sistemas.
// Multi-respondente: as respostas de uma pergunta são "pooladas" entre pessoas.
// Triangulação: por indicador_codigo (mesmo construto nos 3 públicos) → gap.
// Índices à parte (não entram na maturidade): satisfação (0–10), eNPS/NPS,
// drivers (múltipla escolha — ranking de frequência).
import {
  SISTEMAS,
  MATRIZ_INDICADORES,
  MAX_MATURITY,
  maturidadeCore,
  npsCore,
  satisfacaoCore,
  driversCore,
} from './catalog.js';

export function mediaValidas(valores) {
  const v = valores.filter((x) => typeof x === 'number' && x >= 0);
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}
export function notaNormalizada(media) {
  return media == null ? null : Math.round((media / MAX_MATURITY) * 1000) / 10;
}
function poolPergunta(respondentes, qid) {
  return respondentes.map((r) => r[qid]).filter((x) => x !== undefined && x !== null);
}
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

// maturidade de um público → indicadores (por código), sistemas e geral
export function agregarMaturidade(respondentes, perguntas) {
  const indicadores = {}; // codigo -> { nota, sistema, indicador }
  for (const p of perguntas) {
    if (!p.indicador_codigo) continue;
    indicadores[p.indicador_codigo] = {
      nota: notaNormalizada(mediaValidas(poolPergunta(respondentes, p.id))),
      sistema: p.sistema,
      indicador: p.indicador,
    };
  }
  const sistemas = {};
  for (const sis of SISTEMAS) {
    const notas = Object.values(indicadores).filter((i) => i.sistema === sis && i.nota != null).map((i) => i.nota);
    sistemas[sis] = { nota: notas.length ? round1(avg(notas)) : null };
  }
  const notasSistemas = SISTEMAS.map((s) => sistemas[s].nota).filter((n) => n != null);
  return {
    geral: notasSistemas.length ? round1(avg(notasSistemas)) : null,
    sistemas,
    indicadores,
    nRespondentes: respondentes.length,
  };
}

export function calcularNps(valores) {
  const v = valores.filter((x) => typeof x === 'number' && x >= 0 && x <= 10);
  if (!v.length) return { score: null, total: 0, promotores: 0, neutros: 0, detratores: 0 };
  const promotores = v.filter((x) => x >= 9).length;
  const detratores = v.filter((x) => x <= 6).length;
  return {
    score: Math.round(((promotores - detratores) / v.length) * 100),
    total: v.length,
    promotores,
    neutros: v.length - promotores - detratores,
    detratores,
  };
}

export function calcularSatisfacao(valores) {
  const v = valores.filter((x) => typeof x === 'number' && x >= 0 && x <= 10);
  return v.length ? { media: round1(avg(v)), total: v.length } : { media: null, total: 0 };
}

// ranking de frequência de uma pergunta de driver (seleção múltipla / única)
export function agregarDrivers(selecoes) {
  const cont = {};
  for (const sel of selecoes) {
    const arr = Array.isArray(sel) ? sel : typeof sel === 'string' && sel ? [sel] : [];
    for (const t of arr) cont[t] = (cont[t] || 0) + 1;
  }
  return Object.entries(cont).map(([opcao, count]) => ({ opcao, count })).sort((a, b) => b.count - a.count);
}

// triangulação: nota de cada um dos 24 indicadores nos 3 públicos + gap
export function calcularTriangulacao(porPublico) {
  return MATRIZ_INDICADORES.map((ind) => {
    const notas = {};
    for (const [pub, dados] of Object.entries(porPublico)) {
      const nota = dados?.indicadores?.[ind.codigo]?.nota;
      if (nota != null) notas[pub] = nota;
    }
    const vals = Object.values(notas);
    const gap = vals.length >= 2 ? round1(Math.max(...vals) - Math.min(...vals)) : null;
    return {
      codigo: ind.codigo,
      sistema: ind.sistema,
      indicador: ind.indicador,
      porPublico: notas,
      max: vals.length ? Math.max(...vals) : null,
      min: vals.length ? Math.min(...vals) : null,
      gap,
    };
  }).sort((a, b) => (b.gap ?? -1) - (a.gap ?? -1));
}

// result_json completo a partir das respostas por público
// respostasPorPublico = { socios:[{qid:val}], colaboradores:[...], clientes:[...] }
export function montarResultado({ respostasPorPublico, geradoEm = null }) {
  const porPublico = {};
  const indices = { satisfacao: {} };
  const drivers = {};

  for (const [publico, respondentes] of Object.entries(respostasPorPublico)) {
    if (!respondentes || !respondentes.length) continue;

    porPublico[publico] = agregarMaturidade(respondentes, maturidadeCore(publico));

    const npsQ = npsCore(publico)[0];
    if (npsQ) {
      const v = respondentes.map((r) => r[npsQ.id]).filter((x) => typeof x === 'number');
      indices[publico === 'colaboradores' ? 'enps' : 'nps'] = { publico, indicador: npsQ.indicador, ...calcularNps(v) };
    }

    const satQ = satisfacaoCore(publico);
    if (satQ.length) {
      indices.satisfacao[publico] = satQ.map((q) => ({
        id: q.id,
        indicador: q.indicador,
        ...calcularSatisfacao(respondentes.map((r) => r[q.id]).filter((x) => typeof x === 'number')),
      }));
    }

    const drv = driversCore(publico);
    if (drv.length) {
      drivers[publico] = drv.map((q) => ({
        id: q.id,
        familia: q.score_family,
        indicador: q.indicador,
        ranking: agregarDrivers(respondentes.map((r) => r[q.id])),
      }));
    }
  }

  return {
    geradoEm,
    schema_version: 'identidade-final-1',
    porPublico,
    triangulacao: calcularTriangulacao(porPublico),
    indices,
    drivers,
  };
}

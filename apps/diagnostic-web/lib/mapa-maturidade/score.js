// =====================================================================
// Mapa da Maturidade (FINAL) — cálculo de score (funções puras).
// =====================================================================
// Escala de frequência 0–3; "Não sei/Não se aplica" (-1) é EXCLUÍDO do
// cálculo (nem soma, nem denominador). Cada pergunta é um indicador:
//   nota da pergunta = (valor / 3) × 100
//   nota do sistema  = média das notas das perguntas válidas do sistema
//   nota geral       = média das notas dos 4 sistemas (25% cada)
// Nível pela régua oficial (4 faixas). Sem base-15, sem trava de N/A.
import {
  CATALOGO_MATURIDADE,
  SISTEMAS_MATURIDADE,
  REGUA_MATURIDADE,
  VALOR_NA,
  MAX_POR_PERGUNTA,
  perguntasPorSistema,
} from './catalog.js';

function valido(v) {
  return typeof v === 'number' && v >= 0 && v <= MAX_POR_PERGUNTA;
}

// nota 0–100 de uma resposta de frequência (null se N/A ou ausente)
export function notaPergunta(valor) {
  return valido(valor) ? (valor / MAX_POR_PERGUNTA) * 100 : null;
}

// faixa/nível da régua para uma nota 0–100
export function faixaDaNota(nota) {
  if (nota == null) return null;
  const r = Math.round(nota);
  return REGUA_MATURIDADE.find((f) => r >= f.min && r <= f.max) || REGUA_MATURIDADE[REGUA_MATURIDADE.length - 1];
}

// resultado de um sistema
export function computarSistema(answers, sistema) {
  const perguntas = perguntasPorSistema(sistema);
  const notas = [];
  const alertas = [];   // indicadores frágeis (nota 0 ou 1) — com o sinal de alerta
  const destaques = []; // indicadores fortes (nota máxima) — o que sustenta o pilar
  const atencao = [];   // indicadores medianos (nota 2) — presentes mas inconsistentes
  let naCount = 0;
  for (const q of perguntas) {
    const v = answers[q.id];
    if (v === VALOR_NA) {
      naCount += 1;
      continue;
    }
    if (!valido(v)) continue;
    notas.push((v / MAX_POR_PERGUNTA) * 100);
    if (v <= 1 && q.sinal_alerta) {
      alertas.push({ id: q.id, indicador: q.indicador, dimensao: q.dimensao, sinal: q.sinal_alerta, valor: v });
    } else if (v >= MAX_POR_PERGUNTA) {
      destaques.push({ id: q.id, indicador: q.indicador, dimensao: q.dimensao, o_que_identifica: q.o_que_identifica, valor: v });
    } else if (v === 2) {
      atencao.push({ id: q.id, indicador: q.indicador, dimensao: q.dimensao, valor: v });
    }
  }
  const nota = notas.length ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10 : null;
  const faixa = faixaDaNota(nota);
  return {
    sistema,
    nota,
    respostas_validas: notas.length,
    na_count: naCount,
    nivel: faixa ? faixa.nivel : null,
    nivel_nome: faixa ? faixa.nivel_nome : null,
    leitura: faixa ? faixa.leitura : null,
    mensagem: faixa ? faixa.mensagem : null,
    alertas,
    destaques,
    atencao,
  };
}

// nota geral = média das notas dos sistemas com dados
export function computarGeral(sistemas) {
  const validos = sistemas.filter((s) => s.nota != null);
  if (!validos.length) return null;
  return Math.round((validos.reduce((s, x) => s + x.nota, 0) / validos.length) * 10) / 10;
}

// atributos de marca marcados na condicional (MM2-MAR-10b) — fora do score
export function atributosDeMarca(answers) {
  const cond = CATALOGO_MATURIDADE.find((q) => q.score_family === 'brand_attributes');
  if (!cond) return [];
  const v = answers[cond.id];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) return v.split('|').map((s) => s.trim()).filter(Boolean);
  return [];
}

// resultado completo consolidado (persistido em result_json)
export function buildResultado(answers = {}, meta = {}) {
  const sistemas = SISTEMAS_MATURIDADE.map((s) => computarSistema(answers, s));
  const geral = computarGeral(sistemas);
  const faixaGeral = faixaDaNota(geral);

  const criticos = sistemas
    .filter((s) => s.nivel != null && s.nivel <= 2)
    .sort((a, b) => a.nota - b.nota)
    .map((s) => s.sistema);
  const fortes = sistemas.filter((s) => s.nivel === 4).map((s) => s.sistema);

  return {
    assessment_id: meta.assessment_id || null,
    projeto_id: meta.projeto_id || null,
    schema_version: 'maturidade-final-1',
    general_score: geral,
    general_level: faixaGeral ? faixaGeral.nivel_nome : null,
    general_nivel: faixaGeral ? faixaGeral.nivel : null,
    general_leitura: faixaGeral ? faixaGeral.leitura : null,
    general_mensagem: faixaGeral ? faixaGeral.mensagem : null,
    sistemas,
    critical_systems: criticos,
    strong_systems: fortes,
    atributos_marca: atributosDeMarca(answers),
  };
}

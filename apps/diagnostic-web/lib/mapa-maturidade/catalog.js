// =====================================================================
// Helpers do catálogo do Mapa da Maturidade (FINAL — 4 sistemas × 10).
// Camada de acesso sobre catalog.generated.js (fonte = Excel).
// =====================================================================
import {
  CATALOGO_MATURIDADE,
  SISTEMAS_MATURIDADE,
  REGUA_MATURIDADE,
  CADASTRO_MATURIDADE,
} from './catalog.generated.js';

export { CATALOGO_MATURIDADE, SISTEMAS_MATURIDADE, REGUA_MATURIDADE, CADASTRO_MATURIDADE };

export const VALOR_NA = -1; // "Não sei/Não se aplica" — excluído do cálculo
export const MAX_POR_PERGUNTA = 3;

const BY_ID = new Map(CATALOGO_MATURIDADE.map((q) => [q.id, q]));

export function perguntaById(id) {
  return BY_ID.get(id) || null;
}

// as 40 perguntas que compõem a nota (score_family=maturity, pontua=true)
export function perguntasQuePontuam() {
  return CATALOGO_MATURIDADE.filter((q) => q.pontua);
}

export function perguntasPorSistema(sistema) {
  return CATALOGO_MATURIDADE.filter((q) => q.sistema === sistema && q.pontua);
}

// perguntas condicionais (ex.: MM2-MAR-10b — atributos de marca)
export function perguntasCondicionais() {
  return CATALOGO_MATURIDADE.filter((q) => q.exibicao === 'condicional');
}

// dada uma condicional e as respostas atuais, deve ser exibida?
export function condicionalVisivel(pergunta, answers) {
  const regra = pergunta && pergunta.regra_condicional;
  if (!regra) return true;
  const v = answers ? answers[regra.depende] : undefined;
  return regra.valores.includes(Number(v));
}

// perguntas obrigatórias ainda não respondidas (considerando visibilidade condicional).
// "Não sei/Não se aplica" (-1) conta como respondida.
export function obrigatoriasFaltando(answers = {}) {
  const faltando = [];
  for (const q of CATALOGO_MATURIDADE) {
    if (!q.obrigatoria) continue;
    if (q.exibicao === 'condicional' && !condicionalVisivel(q, answers)) continue;
    const v = answers[q.id];
    const ok = q.response_type === 'escala4_frequencia' ? typeof v === 'number' : v != null && v !== '';
    if (!ok) faltando.push(q.id);
  }
  return faltando;
}

// estrutura do formulário: cadastro + 4 sistemas com suas perguntas (condicionais anexadas)
export function montarFormulario() {
  return {
    cadastro: CADASTRO_MATURIDADE,
    sistemas: SISTEMAS_MATURIDADE.map((sistema) => ({
      sistema,
      perguntas: CATALOGO_MATURIDADE.filter((q) => q.sistema === sistema),
    })),
  };
}

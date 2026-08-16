// =====================================================================
// Acessores do catálogo. Camada fina sobre catalog.generated.js, que é
// emitido dos Excel — mesmo padrão de lib/mapa-maturidade/catalog.js.
// =====================================================================
import {
  CATALOGO_VERSAO,
  FAIXAS_VERSAO,
  CAPACIDADES,
  PILARES,
  N_BLOCOS,
  K_APARICOES,
  SEM_ANCORA,
  COMPETENCIAS,
  BLOCOS,
  BANCO_ITENS,
  ANCORAS,
  ANCORADOS,
  FAIXAS,
  LEITURA_FAIXA,
} from './catalog.generated.js';

export {
  CATALOGO_VERSAO, FAIXAS_VERSAO, CAPACIDADES, PILARES,
  N_BLOCOS, K_APARICOES, SEM_ANCORA,
  COMPETENCIAS, BLOCOS, BANCO_ITENS, ANCORAS, ANCORADOS, FAIXAS, LEITURA_FAIXA,
};

export const CHAVES = COMPETENCIAS.map((c) => c.chave);

const POR_CHAVE = new Map(COMPETENCIAS.map((c) => [c.chave, c]));
export function competencia(chave) {
  return POR_CHAVE.get(chave) || null;
}
export function nomeDe(chave) {
  return POR_CHAVE.get(chave)?.nome || chave;
}
export function capacidadeDe(chave) {
  return POR_CHAVE.get(chave)?.capacidade || null;
}
export function competenciasDaCapacidade(capacidade) {
  return COMPETENCIAS.filter((c) => c.capacidade === capacidade);
}

const BLOCO_POR_ID = new Map(BLOCOS.map((b) => [b.id, b]));
export function bloco(id) {
  return BLOCO_POR_ID.get(id) || null;
}

const FAIXA_POR_CHAVE = new Map(FAIXAS.map((f) => [f.competencia, f]));
export function faixaDe(chave) {
  return FAIXA_POR_CHAVE.get(chave) || null;
}

const LEITURA_POR_CHAVE = new Map(LEITURA_FAIXA.map((l) => [l.competencia, l]));
export function leituraDe(chave) {
  return LEITURA_POR_CHAVE.get(chave) || null;
}

const ANCORADOS_POR_CHAVE = new Map();
for (const a of ANCORADOS) {
  if (!ANCORADOS_POR_CHAVE.has(a.competencia)) ANCORADOS_POR_CHAVE.set(a.competencia, []);
  ANCORADOS_POR_CHAVE.get(a.competencia).push(a);
}
export function ancoradosDe(chave) {
  return ANCORADOS_POR_CHAVE.get(chave) || [];
}

/**
 * A etapa 2 só pode rodar para uma competência quando existirem os DOIS itens
 * ancorados dela. Enquanto o banco estiver incompleto (22 itens pendentes), a
 * etapa fica atrás de flag e o nível sai como estimado — nunca afirmado.
 */
export function temAncoradosCompletos(chave) {
  return ancoradosDe(chave).length >= 2;
}
export function competenciasComAncorados() {
  return CHAVES.filter(temAncoradosCompletos);
}
export const ETAPA2_DISPONIVEL = CHAVES.every(temAncoradosCompletos);

/**
 * Ordem de exibição das 4 opções de um bloco, randomizada por sessão e
 * reproduzível a partir da seed. A ordem é gravada em `ordem_exibida` para
 * auditar viés de posição — sem isso não há como calibrar desejabilidade.
 */
export function ordemDoBloco(blocoId, seed) {
  const b = BLOCO_POR_ID.get(blocoId);
  if (!b) return [];
  let h = 0;
  const material = `${seed}:${blocoId}`;
  for (let i = 0; i < material.length; i++) h = (h * 31 + material.charCodeAt(i)) >>> 0;
  const idx = b.opcoes.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

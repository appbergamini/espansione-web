// =====================================================================
// Pontuação da etapa 1 (escolha forçada), ranking e seleção da ramificação.
//
// Tudo aqui é agnóstico à contagem de blocos: usa K_APARICOES do catálogo.
// Trocar 12 por 15 blocos não muda uma linha deste arquivo.
//
// O instrumento é IPSATIVO: a soma dos 12 scores é sempre 0 por construção.
// Ele produz posição relativa dentro do perfil, nunca nível absoluto. Não
// derivar percentil daqui enquanto não houver base normativa.
// =====================================================================
import { CHAVES, CAPACIDADES, BLOCOS, K_APARICOES, capacidadeDe, competenciasDaCapacidade } from './catalog.js';

export const POSICOES = ['mais_forte', 'forte', 'intermediaria', 'fragil', 'mais_fragil'];

export const ROTULO_POSICAO = {
  mais_forte: 'Mais forte',
  forte: 'Forte',
  intermediaria: 'Intermediária',
  fragil: 'Frágil',
  mais_fragil: 'Mais frágil',
};

/**
 * @param {Object} respostas — { B01: { mais: 'chave', menos: 'chave' }, ... }
 * @returns {{ scores, porCapacidade, integridade }}
 */
export function pontuarEscolhaForcada(respostas = {}) {
  const scores = Object.fromEntries(CHAVES.map((c) => [c, 0]));
  const problemas = [];
  let respondidos = 0;

  for (const b of BLOCOS) {
    const r = respostas[b.id];
    if (!r || !r.mais || !r.menos) continue;
    respondidos++;

    const doBloco = new Set(b.opcoes.map((o) => o.competencia));
    if (!doBloco.has(r.mais)) problemas.push(`${b.id}: "mais" (${r.mais}) não é opção deste bloco`);
    if (!doBloco.has(r.menos)) problemas.push(`${b.id}: "menos" (${r.menos}) não é opção deste bloco`);
    if (r.mais === r.menos) problemas.push(`${b.id}: "mais" e "menos" são a mesma opção`);

    if (scores[r.mais] !== undefined) scores[r.mais] += 1;
    if (scores[r.menos] !== undefined) scores[r.menos] -= 1;
  }

  const porCapacidade = Object.fromEntries(
    CAPACIDADES.map((cap) => [cap, competenciasDaCapacidade(cap).reduce((a, c) => a + scores[c.chave], 0)])
  );

  const soma = Object.values(scores).reduce((a, b) => a + b, 0);
  const completo = respondidos === BLOCOS.length;
  if (completo && soma !== 0) problemas.push(`soma dos scores é ${soma}, deveria ser 0`);

  return {
    scores,
    porCapacidade,
    integridade: {
      somaZero: soma === 0,
      soma,
      blocosRespondidos: respondidos,
      blocosEsperados: BLOCOS.length,
      completo,
      valido: problemas.length === 0,
      problemas,
    },
  };
}

/**
 * Converte o score relativo em uma das 5 posições do relatório.
 * O limiar acompanha K_APARICOES, então a escala continua simétrica com
 * qualquer contagem de blocos. Score igual → posição igual, sempre.
 */
export function posicaoRelativa(score, k = K_APARICOES) {
  const limiar = Math.ceil(k / 2);
  if (score >= limiar) return 'mais_forte';
  if (score > 0) return 'forte';
  if (score === 0) return 'intermediaria';
  if (score > -limiar) return 'fragil';
  return 'mais_fragil';
}

/**
 * Ranking do mais forte para o mais frágil.
 * Empate: prevalece (fica mais frágil) a que estiver na capacidade de menor
 * score — regra da SPEC. Empate remanescente cai em ordem alfabética só para
 * a saída ser determinística; ele NÃO decide a trilha (ver selecionarAprofundamento).
 */
export function ranquear(scores, porCapacidade) {
  return [...CHAVES]
    .map((chave) => ({
      chave,
      score: scores[chave],
      capacidade: capacidadeDe(chave),
      scoreCapacidade: porCapacidade[capacidadeDe(chave)],
      posicao: posicaoRelativa(scores[chave]),
    }))
    .sort((a, b) =>
      b.score - a.score ||
      b.scoreCapacidade - a.scoreCapacidade ||
      a.chave.localeCompare(b.chave)
    );
}

/**
 * Seleciona as competências que vão para a ramificação (etapa 2).
 *
 * O empate no corte NÃO é resolvido nem por regra arbitrária nem pelo
 * respondente: aprofunda-se TODAS as competências empatadas no patamar mais
 * frágil. Quem responde não tem como saber qual escolher, e o desempate
 * automático era instável — o bottom-3 só se repete em ~72% num
 * teste-reteste, e o corte empata em ~44% dos casos. Mais blocos não
 * resolvem (24 blocos levam o overlap a apenas 78%).
 *
 * Custo medido em 50 mil respondentes simulados: 3 competências em 55% dos
 * casos (22 telas), 4 em 30% (24 telas), 5 em 9% (26), p99 em 30 telas.
 * Mediana inalterada.
 *
 * As âncoras de evidência NÃO entram aqui: elas verificam declaração contra
 * evidência, e se influenciassem o ranking o Índice de Coerência passaria a
 * verificar um resultado que ajudou a produzir. Além disso só cobrem 8 das 12.
 */
export function selecionarAprofundamento(scores, porCapacidade, n = 3) {
  const doMaisFragil = ranquear(scores, porCapacidade).reverse();
  const scoreCorte = doMaisFragil[n - 1].score;

  // Todas as que estão no corte ou abaixo dele.
  const selecionadas = doMaisFragil.filter((c) => c.score <= scoreCorte).map((c) => c.chave);

  return {
    // 'ampliado_por_empate' é dado de calibração: mede quantas vezes o corte
    // não separou sozinho.
    criterio: selecionadas.length === n ? 'por_score' : 'ampliado_por_empate',
    selecionadas,
    ampliadoPorEmpate: selecionadas.length > n,
    minimo: n,
    scoreCorte,
  };
}

/**
 * Nível afirmado a partir dos 2 itens ancorados de uma competência.
 * Concordância ou adjacência → afirmado (prevalece o maior).
 * Distância de 2 ou mais → estimado, e o relatório precisa dizer isso.
 */
export function nivelAfirmado(niveis = []) {
  const validos = niveis.filter((n) => Number.isInteger(n) && n >= 1 && n <= 4);
  if (validos.length === 0) return { nivel: null, confianca: null };
  if (validos.length === 1) return { nivel: validos[0], confianca: 'estimado' };
  const [a, b] = validos;
  if (Math.abs(a - b) <= 1) return { nivel: Math.max(a, b), confianca: 'afirmado' };
  return { nivel: Math.round((a + b) / 2), confianca: 'estimado' };
}

/** Resultado consolidado da etapa 1, no formato que vai para comp_scores. */
export function consolidar(respostas) {
  const { scores, porCapacidade, integridade } = pontuarEscolhaForcada(respostas);
  const ranking = ranquear(scores, porCapacidade);
  return {
    scores,
    porCapacidade,
    integridade,
    ranking,
    capacidades: CAPACIDADES.map((cap) => ({
      capacidade: cap,
      score: porCapacidade[cap],
      competencias: competenciasDaCapacidade(cap).map((c) => ({
        chave: c.chave,
        score: scores[c.chave],
        posicao: posicaoRelativa(scores[c.chave]),
      })),
    })),
  };
}

// =====================================================================
// Motor de faixas: posição de cada pilar frente à faixa desejada da
// competência, e a rota de trilha que sai daí.
//
// VOCABULÁRIO — a palavra "aderência" está aposentada deste sistema.
// Ela significava TRÊS coisas diferentes no material de origem:
//   · posição de um pilar frente a uma faixa   → aqui: posição na faixa
//   · % dos 48 checks dentro da faixa          → aqui: Índice de Ajuste
//   · declaração × evidência (as 4 âncoras)    → aqui: Índice de Coerência
// Os dois índices são informação do avaliador e nunca aparecem no relatório.
// =====================================================================
import { FAIXAS, LEITURA_FAIXA, PILARES, CHAVES, faixaDe, leituraDe, FAIXAS_VERSAO } from './catalog.js';

/**
 * Tolerância de borda. Um pilar só é SINALIZADO quando a distância até a
 * borda da faixa for MAIOR que delta — estar fora por 1 ponto não é achado.
 *
 * Por que existe: com delta 0, a regra 4 da trilha ("todos os pilares dentro
 * → fragilidade técnica, não comportamental") dispara em 5,7% dos casos, e o
 * motor encontra em média 2,25 pilares fora por competência. Ou seja, o
 * relatório SEMPRE acharia um culpado comportamental — exatamente o que a
 * regra editorial condena. Com delta 10 a regra 4 dispara em ~20% e a média
 * cai para 1,47.
 *
 * Versionado, e não constante: recalibrar cria versão nova e os relatórios
 * já entregues continuam explicáveis. NUNCA baixar o delta para "achar
 * alguma coisa" num respondente específico.
 */
export const TOLERANCIA_PADRAO = { versao: 'delta-v1', delta: 10 };

export const ROTAS = ['regular', 'desenvolver', 'compensar', 'tecnica', 'confianca_baixa'];

/** Distância até a borda da faixa. 0 quando está dentro. */
export function distanciaDaBorda(valor, faixa) {
  if (valor < faixa.minimo) return faixa.minimo - valor;
  if (valor > faixa.maximo) return valor - faixa.maximo;
  return 0;
}

export function posicaoNaFaixa(valor, faixa) {
  if (valor < faixa.minimo) return 'abaixo';
  if (valor > faixa.maximo) return 'acima';
  return 'dentro';
}

/**
 * Avalia os 4 pilares de uma competência.
 * @param {string} chave
 * @param {Object} pilares — { determinacao: {natural, emContexto}, ... }
 * @param {number} delta
 */
export function avaliarCompetencia(chave, pilares, delta = TOLERANCIA_PADRAO.delta) {
  const f = faixaDe(chave);
  if (!f) return null;
  const porPilar = {};
  for (const p of PILARES) {
    // A leitura opera sobre o pilar NATURAL. O "em contexto" entra na leitura
    // de gap, não na de faixa — o bloco adaptado quase não diferencia entre
    // características e desloca tudo para cima de forma quase uniforme.
    const valor = pilares[p].natural;
    const faixa = f.faixas[p];
    const distancia = distanciaDaBorda(valor, faixa);
    porPilar[p] = {
      valor,
      faixa,
      posicao: posicaoNaFaixa(valor, faixa),
      distancia,
      // ESTRITAMENTE maior. Com delta 0 isso recai no comportamento original
      // (qualquer pilar fora é sinalizado) sem precisar de caso especial —
      // `>=` marcaria até quem está DENTRO, cuja distância é 0. É também a
      // convenção usada na simulação que produziu os números do plano.
      sinalizado: distancia > delta,
    };
  }
  const sinalizados = PILARES.filter((p) => porPilar[p].sinalizado);
  return {
    competencia: chave,
    confianca: f.confianca,
    porPilar,
    sinalizados,
    acima: sinalizados.filter((p) => porPilar[p].posicao === 'acima'),
    abaixo: sinalizados.filter((p) => porPilar[p].posicao === 'abaixo'),
    pilarCritico: leituraDe(chave)?.pilarCritico || null,
  };
}

/**
 * Rota da trilha para uma competência frágil ou intermediária.
 *
 * DESVIO CONSCIENTE DA SPEC: a regra 5 (Confiança BAIXA → não gerar
 * recomendação comportamental) é avaliada PRIMEIRO, não por último. Avaliada
 * na ordem da tabela original, a regra 1 dispararia antes e emitiria uma
 * recomendação comportamental justamente onde a leitura explica pouco — o
 * que esvaziaria a regra 5.
 *
 * `compensavel` não é derivável dos dados: a SPEC (caso 3b) fala de pilar
 * "dificilmente desenvolvível ou não exigido pelo papel", que é julgamento.
 * Entra como decisão externa, e por padrão não dispara.
 */
export function rotaDaTrilha(avaliacao, { compensavel = false } = {}) {
  if (!avaliacao) return null;
  if (avaliacao.confianca === 'BAIXA') {
    return {
      rota: 'confianca_baixa',
      pilarAlvo: null,
      motivo: 'A leitura comportamental explica pouco desta competência.',
    };
  }
  if (avaliacao.sinalizados.length === 0) {
    return {
      rota: 'tecnica',
      pilarAlvo: null,
      motivo: 'Nenhum pilar fora da faixa: a fragilidade não é comportamental.',
    };
  }
  // Excesso antes de falta: é o padrão invisível, a pessoa não sabe que a
  // própria força atrapalha. Um pilar por ciclo.
  const alvo = avaliacao.acima[0] || avaliacao.abaixo[0];
  if (compensavel) {
    return { rota: 'compensar', pilarAlvo: alvo, motivo: 'Desvio a compensar por processo, parceria ou delegação.' };
  }
  return avaliacao.acima.length
    ? { rota: 'regular', pilarAlvo: alvo, motivo: 'Fragilidade por excesso.' }
    : { rota: 'desenvolver', pilarAlvo: alvo, motivo: 'Fragilidade por falta.' };
}

/** Avalia as 12 de uma vez. */
export function avaliarTodas(pilares, delta = TOLERANCIA_PADRAO.delta) {
  return CHAVES.map((c) => avaliarCompetencia(c, pilares, delta));
}

/**
 * ÍNDICE DE AJUSTE — % dos 4×12 checks em que o pilar está dentro da faixa.
 * Mede o quanto o perfil comportamental favorece o conjunto de competências
 * exigido de um dono de PME. Baixo = tensão estrutural entre perfil e papel,
 * que é conversa de próximo estágio, não de treinamento.
 *
 * Nunca chega perto de 100: como os pilares somam 200, estar dentro das 48
 * é impossível por construção. Calibrar a expectativa pela distribuição real.
 * Só painel do avaliador.
 */
export function indiceAjuste(pilares, delta = TOLERANCIA_PADRAO.delta) {
  const todas = avaliarTodas(pilares, delta);
  let dentro = 0;
  let total = 0;
  for (const a of todas) {
    for (const p of PILARES) {
      total++;
      if (a.porPilar[p].posicao === 'dentro') dentro++;
    }
  }
  const valor = Math.round((dentro / total) * 100);
  return {
    valor,
    dentro,
    total,
    leitura: valor >= 50 ? 'perfil favorece o papel' : valor >= 30 ? 'tensão pontual' : 'tensão estrutural',
  };
}

/**
 * REGRA DE VIABILIDADE — como os 4 pilares somam 200, a soma dos pontos
 * médios das 4 faixas de uma competência precisa ficar entre 185 e 215.
 * Fora disso a faixa é insatisfazível e marcaria todo respondente como fora.
 * Corolário: no máximo dois pilares podem ter faixa alta simultânea.
 */
export function viabilidade(chave) {
  const f = faixaDe(chave);
  if (!f) return null;
  const soma = PILARES.reduce((a, p) => a + (f.faixas[p].minimo + f.faixas[p].maximo) / 2, 0);
  return { competencia: chave, soma, viavel: soma >= 185 && soma <= 215 };
}
export function viabilidadeDeTodas() {
  return FAIXAS.map((f) => viabilidade(f.competencia));
}

export const METADADOS = {
  faixasVersao: FAIXAS_VERSAO,
  deltaVersao: TOLERANCIA_PADRAO.versao,
  delta: TOLERANCIA_PADRAO.delta,
  totalDeChecks: FAIXAS.length * PILARES.length,
  leituras: LEITURA_FAIXA.length,
};

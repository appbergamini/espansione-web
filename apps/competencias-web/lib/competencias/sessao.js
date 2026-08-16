// =====================================================================
// Máquina de estados do teste. Pura: recebe as respostas, devolve qual
// tela mostrar. Nenhum acesso a banco — testável sem infraestrutura, e a
// regra de fluxo mora num lugar só.
//
// DECISÕES DE 16/08 QUE DIVERGEM DA SPEC (deliberadas, do dono do produto):
//
//  1. PROGRESSO mostra etapa E contagem de perguntas. A SPEC §5.2 proibia
//     contagem por questão; na tela real a barra vazia na etapa 1 produzia
//     a mesma ansiedade por outro caminho.
//
//  2. EMPATE NO CORTE não vira escolha de ninguém — nem de regra
//     arbitrária, nem do respondente. Aprofunda-se TODAS as competências
//     empatadas no patamar mais frágil. O número de telas passa a variar:
//     22 em 55% dos casos, 24 em 30%, 26 em 9%, p99 em 30.
//
//  3. AVANÇO AUTOMÁTICO EM TODAS as etapas, inclusive nas âncoras. A SPEC
//     pedia toque em Continuar nas âncoras para evitar toque acidental numa
//     contagem factual; com o botão Voltar isso deixou de ser necessário, e
//     o comportamento misto confundia mais do que protegia.
//
//  4. DÁ PARA VOLTAR e rever/corrigir uma resposta anterior.
// =====================================================================
import {
  BLOCOS, ANCORAS, N_BLOCOS, ETAPA2_DISPONIVEL,
  ancoradosDe, ordemDoBloco, nomeDe,
} from './catalog.js';
import { pontuarEscolhaForcada, selecionarAprofundamento, nivelAfirmado } from './score.js';

export const FASES = ['etapa1', 'etapa2', 'etapa3', 'concluido'];

export const ROTULO_ETAPA = {
  1: 'Como você se descreve',
  2: 'Situações do dia a dia',
  3: 'Alguns números do seu negócio',
};

/**
 * Tela de instrução na virada de etapa.
 *
 * As três etapas têm três FORMATOS de pergunta diferentes, e até aqui elas
 * emendavam em silêncio: quem estava escolhendo palavras sobre si de
 * repente lia um cenário, e depois de repente informava quantos clientes
 * atendeu no mês. A troca sem aviso lê como erro do sistema, e a etapa 3
 * ainda por cima assusta — parece que vão pedir dados que a pessoa não
 * tem à mão.
 *
 * Cada texto faz uma coisa que o instrumento precisa:
 *   etapa 2 — pede o que a pessoa FAZ, não o que seria o certo fazer.
 *             Sem isso o item ancorado vira teste de conhecimento.
 *   etapa 3 — avisa que faixa e estimativa servem. Sem isso a pessoa sai
 *             para procurar o número exato, e boa parte não volta.
 *
 * Não há transição para a etapa 1: a abertura do teste já explica a
 * escala, e duas telas de aviso seguidas antes da primeira pergunta é
 * uma a mais.
 */
export const TRANSICAO_ETAPA = {
  2: {
    id: 'etapa2',
    titulo: 'Agora muda o tipo de pergunta',
    texto: 'Em vez de escolher palavras, você vai ler uma situação concreta e marcar o que costuma fazer — não o que seria o certo fazer. São poucas telas, só sobre as competências em que as suas respostas pediram mais detalhe.',
    rotulo: 'Continuar',
  },
  3: {
    id: 'etapa3',
    titulo: 'As últimas, e são de outro tipo',
    texto: 'Quatro perguntas sobre o que acontece no seu negócio, não sobre como você se vê. Elas existem para comparar uma coisa com a outra. São faixas, não números exatos: responda de cabeça, sem consultar nada.',
    rotulo: 'Continuar',
  },
};

const ANCORADOS_POR_COMPETENCIA = 2;

const respondido = (respostas, id) => respostas[id] !== undefined && respostas[id] !== null;

/**
 * A lista ORDENADA de telas desta sessão.
 *
 * O miolo da etapa 2 só é conhecido depois que a etapa 1 fecha — antes
 * disso a lista sai com os blocos e as âncoras, e cresce quando o corte
 * fica definido. É por isso que o denominador do contador pode subir uma
 * vez no meio do teste.
 */
export function telasDaSessao(respostas = {}, { etapa2Habilitada = ETAPA2_DISPONIVEL } = {}) {
  const lista = BLOCOS.map((b) => ({ id: b.id, etapa: 1, tipo: 'escolha_forcada', bloco: b }));

  const etapa1Completa = BLOCOS.every((b) => respondido(respostas, b.id));
  let selecao = null;

  if (etapa1Completa && etapa2Habilitada) {
    const { scores, porCapacidade } = pontuarEscolhaForcada(respostas);
    selecao = selecionarAprofundamento(scores, porCapacidade);
    for (const c of selecao.selecionadas) {
      for (const a of ancoradosDe(c).slice(0, ANCORADOS_POR_COMPETENCIA)) {
        lista.push({ id: a.id, etapa: 2, tipo: 'item_ancorado', ancorado: a });
      }
    }
  }

  for (const a of ANCORAS) lista.push({ id: a.id, etapa: 3, tipo: 'ancora_evidencia', ancora: a });

  return { lista, selecao, etapa1Completa };
}

/**
 * @param {Object} args
 * @param {Object} args.respostas
 * @param {string} args.seed — ordem das opções, reproduzível
 * @param {string|null} args.telaAtual — id de uma tela já respondida, para rever
 */
export function estadoDaSessao({ respostas = {}, seed = 'sem-seed', telaAtual = null, etapa2Habilitada = ETAPA2_DISPONIVEL } = {}) {
  const { lista, selecao } = telasDaSessao(respostas, { etapa2Habilitada });

  // Só para navegação. O contador visível é POR BLOCO — ver progressoDe.
  const total = Math.max(lista.length, totalMinimoDeTelas({ etapa2Habilitada }));

  const iFrontier = lista.findIndex((t) => !respondido(respostas, t.id));

  // Revisitar uma tela anterior só vale se ela existe nesta sessão.
  const iPedida = telaAtual ? lista.findIndex((t) => t.id === telaAtual) : -1;
  const revisitando = iPedida >= 0 && (iFrontier === -1 || iPedida < iFrontier);
  const i = revisitando ? iPedida : iFrontier;

  if (i === -1) {
    return {
      fase: 'concluido',
      tela: {
        tipo: 'fim',
        // Sem numerar: a barra já conta as ETAPAS do teste. Numerar os
        // INSTRUMENTOS aqui poria a mesma palavra contando duas coisas.
        titulo: 'Teste concluído',
        texto: 'Falta o Mapeamento Comportamental, que acabou de abrir. O seu relatório é gerado quando os dois estiverem completos.',
        acao: { rotulo: 'Fazer o Mapeamento Comportamental', destino: 'comportamental' },
        anterior: lista[lista.length - 1]?.id || null,
      },
      progresso: progressoDe(3, { etapa2Habilitada, lista, respostas, fim: true }),
      selecao,
      integridade: pontuarEscolhaForcada(respostas).integridade,
      niveis: etapa2Habilitada && selecao ? niveisDasSelecionadas(respostas, selecao.selecionadas) : null,
    };
  }

  const t = lista[i];
  const anterior = i > 0 ? lista[i - 1] : null;

  const base = {
    fase: `etapa${t.etapa}`,
    progresso: progressoDe(t.etapa, { etapa2Habilitada, lista, respostas }),
    // Vem ANEXADA à tela real, não no lugar dela — mesma decisão do
    // comportamental: dispensar um aviso não deve custar uma ida ao
    // servidor, e quem decide quando passar é quem está respondendo.
    // A tela sabe qual transição é (`id`), então a de etapa 2 dispensada
    // não engole a de etapa 3.
    transicao: anterior && anterior.etapa !== t.etapa ? TRANSICAO_ETAPA[t.etapa] || null : null,
    selecao,
    navegacao: {
      anterior: i > 0 ? lista[i - 1].id : null,
      // Só faz sentido enquanto se está revendo: no fluxo normal, "próxima"
      // é decidida pela resposta, não por navegação.
      proxima: revisitando && i + 1 < lista.length ? lista[i + 1].id : null,
      revisitando,
      // Quando está revendo, oferece o caminho de volta para onde parou.
      frontier: revisitando && iFrontier >= 0 ? lista[iFrontier].id : null,
      posicao: i + 1,
      total,
    },
  };

  // Avanço automático em TODAS as etapas — inclusive nas âncoras.
  if (t.tipo === 'escolha_forcada') {
    const ordem = ordemDoBloco(t.id, seed);
    return {
      ...base,
      tela: {
        tipo: 'escolha_forcada',
        id: t.id,
        opcoes: ordem.map((k) => t.bloco.opcoes[k]),
        ordemExibida: ordem,
        resposta: respostas[t.id] || null,
        avancoAutomatico: true,
      },
    };
  }

  if (t.tipo === 'item_ancorado') {
    return {
      ...base,
      tela: {
        tipo: 'item_ancorado',
        id: t.id,
        competencia: t.ancorado.competencia,
        situacao: t.ancorado.situacao,
        // Ordem crescente de proficiência: a ordem É a escala. Embaralhar
        // destruiria a medida.
        niveis: t.ancorado.niveis,
        resposta: respostas[t.id] || null,
        avancoAutomatico: true,
      },
    };
  }

  return {
    ...base,
    tela: {
      tipo: 'ancora_evidencia',
      id: t.id,
      pergunta: t.ancora.pergunta,
      opcoes: t.ancora.opcoes,
      resposta: respostas[t.id] || null,
      avancoAutomatico: true,
    },
  };
}

/** Nível afirmado de cada competência aprofundada, dos seus 2 ancorados. */
export function niveisDasSelecionadas(respostas, selecionadas = []) {
  const out = {};
  for (const c of selecionadas) {
    const marcados = ancoradosDe(c)
      .slice(0, ANCORADOS_POR_COMPETENCIA)
      .map((a) => respostas[a.id]?.nivel)
      .filter((n) => Number.isInteger(n));
    out[c] = nivelAfirmado(marcados);
  }
  return out;
}

/**
 * Progresso POR BLOCO, não global.
 *
 * Um contador global teria denominador móvel: o tamanho da etapa 2 só é
 * conhecido depois que a etapa 1 fecha, então "12 de 22" viraria "12 de 26"
 * no meio do teste, e a barra recuaria. Denominador que muda parece defeito.
 *
 * Com um segmento por etapa, cada denominador já é conhecido quando o seu
 * bloco começa, e nada anda para trás. A etapa 2 crescer deixa de ser
 * visível como anomalia — ela é um bloco próprio, do tamanho que precisar.
 */
function progressoDe(etapa, { etapa2Habilitada, lista, respostas, fim = false }) {
  const etapas = etapa2Habilitada ? [1, 2, 3] : [1, 3];
  const contarEtapa = (n) => {
    const doBloco = lista.filter((t) => t.etapa === n);
    return { total: doBloco.length, feitas: doBloco.filter((t) => respondido(respostas, t.id)).length };
  };

  const segmentos = etapas.map((n, i) => {
    const { total, feitas } = contarEtapa(n);
    // A etapa 2 ainda não tem tamanho antes de a etapa 1 fechar.
    const totalMostrado = total || (n === 2 ? 3 * ANCORADOS_POR_COMPETENCIA : 0);
    return {
      etapa: n,
      indice: i + 1,
      rotulo: ROTULO_ETAPA[n],
      total: totalMostrado,
      feitas,
      percentual: totalMostrado ? Math.round((feitas / totalMostrado) * 100) : 0,
      estado: fim || feitas >= totalMostrado ? 'completo' : n === etapa ? 'atual' : feitas > 0 ? 'atual' : 'pendente',
    };
  });

  const atual = segmentos.find((s) => s.etapa === etapa) || segmentos[segmentos.length - 1];
  const indiceAtual = segmentos.indexOf(atual) + 1;

  return {
    etapa: indiceAtual,
    de: segmentos.length,
    rotulo: fim ? 'Concluído' : ROTULO_ETAPA[etapa],
    // Montada aqui, não na tela: um lugar só decide como o progresso é dito.
    legenda: fim ? 'Concluído' : `Etapa ${indiceAtual} de ${segmentos.length} · ${ROTULO_ETAPA[etapa]}`,
    // Contagem LOCAL do bloco atual.
    pergunta: fim ? atual.total : Math.min(atual.feitas + 1, atual.total),
    deTotal: atual.total,
    segmentos,
    percentual: fim ? 100 : atual.percentual,
  };
}

/** Quantas telas a sessão tem hoje. Varia com o empate no corte. */
export function totalDeTelas(respostas = {}, opts = {}) {
  return telasDaSessao(respostas, opts).lista.length;
}

/** Menor número possível de telas: corte limpo, 3 competências aprofundadas. */
export function totalMinimoDeTelas({ etapa2Habilitada = ETAPA2_DISPONIVEL } = {}) {
  return N_BLOCOS + (etapa2Habilitada ? 3 * ANCORADOS_POR_COMPETENCIA : 0) + ANCORAS.length;
}

/** Valida antes de gravar — mais barato que descobrir no cálculo. */
export function validarResposta(itemId, payload, { seed = 'sem-seed' } = {}) {
  const bloco = BLOCOS.find((b) => b.id === itemId);
  if (bloco) {
    const chaves = bloco.opcoes.map((o) => o.competencia);
    if (!payload || !payload.mais || !payload.menos) return erro('faltam "mais" e "menos"');
    if (!chaves.includes(payload.mais)) return erro(`"${payload.mais}" não é opção de ${itemId}`);
    if (!chaves.includes(payload.menos)) return erro(`"${payload.menos}" não é opção de ${itemId}`);
    if (payload.mais === payload.menos) return erro('"mais" e "menos" não podem ser a mesma opção');
    return { ok: true, etapa: 1, payload: { mais: payload.mais, menos: payload.menos }, ordemExibida: ordemDoBloco(itemId, seed) };
  }

  const ancora = ANCORAS.find((a) => a.id === itemId);
  if (ancora) {
    const v = payload?.valor;
    if (!Number.isInteger(v) || v < 0 || v > 4) return erro('valor da âncora deve ser inteiro de 0 a 4');
    return { ok: true, etapa: 3, payload: { valor: v } };
  }

  if (/^ANC-/.test(String(itemId))) {
    const chave = String(itemId).replace(/^ANC-/, '').replace(/-\d+$/, '');
    if (ancoradosDe(chave).some((a) => a.id === itemId)) {
      const n = payload?.nivel;
      if (!Number.isInteger(n) || n < 1 || n > 4) return erro('nível deve ser inteiro de 1 a 4');
      return { ok: true, etapa: 2, payload: { nivel: n } };
    }
  }

  return erro(`item desconhecido: ${itemId}`);
}

function erro(motivo) {
  return { ok: false, motivo };
}

export { nomeDe };

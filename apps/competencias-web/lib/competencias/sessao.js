// =====================================================================
// Máquina de estados das 22 telas. Pura: recebe as respostas, devolve qual
// é a próxima tela. Nenhum acesso a banco aqui — o que a torna testável
// sem infraestrutura, e o que mantém a regra de fluxo num lugar só.
//
// UX que a SPEC fixa e este arquivo faz valer:
//  · o enunciado da escala é explicado UMA vez, na abertura;
//  · uma questão por tela;
//  · etapas 1 e 2 avançam sozinhas depois da marcação completa;
//  · as âncoras EXIGEM toque em Continuar — não avançam sozinhas;
//  · progresso é mostrado por ETAPA, nunca por questão individual.
// =====================================================================
import {
  BLOCOS, ANCORAS, N_BLOCOS, ETAPA2_DISPONIVEL,
  ancoradosDe, ordemDoBloco, nomeDe,
} from './catalog.js';
import { pontuarEscolhaForcada, selecionarAprofundamento, confirmarSelecao, nivelAfirmado } from './score.js';

export const FASES = ['abertura', 'etapa1', 'escolha', 'etapa2', 'etapa3', 'concluido'];

export const ROTULO_ETAPA = {
  1: 'Como você se descreve',
  2: 'Situações do dia a dia',
  3: 'Alguns números do seu negócio',
};

const ANCORADOS_POR_COMPETENCIA = 2;

/** Quantas telas a sessão terá, dado o que está habilitado. */
export function totalDeTelas({ etapa2Habilitada = ETAPA2_DISPONIVEL } = {}) {
  return N_BLOCOS + (etapa2Habilitada ? 3 * ANCORADOS_POR_COMPETENCIA : 0) + ANCORAS.length;
}

function respondido(respostas, id) {
  return respostas[id] !== undefined && respostas[id] !== null;
}

/**
 * Estado completo da sessão a partir das respostas cruas.
 *
 * @param {Object} args
 * @param {Object} args.respostas — { 'B01': {mais,menos}, 'EVI-01': {valor}, 'ANC-...': {nivel} }
 * @param {string[]} args.escolhas — competências escolhidas pelo respondente no empate
 * @param {string} args.seed — para a ordem das opções
 * @param {boolean} args.etapa2Habilitada
 */
export function estadoDaSessao({ respostas = {}, escolhas = [], seed = 'sem-seed', etapa2Habilitada = ETAPA2_DISPONIVEL } = {}) {
  // ── etapa 1 ───────────────────────────────────────────────────────
  const blocoPendente = BLOCOS.find((b) => !respondido(respostas, b.id));
  const blocosRespondidos = N_BLOCOS - BLOCOS.filter((b) => !respondido(respostas, b.id)).length;

  if (blocoPendente) {
    return {
      fase: 'etapa1',
      tela: {
        tipo: 'escolha_forcada',
        id: blocoPendente.id,
        opcoes: ordemDoBloco(blocoPendente.id, seed).map((i) => blocoPendente.opcoes[i]),
        ordemExibida: ordemDoBloco(blocoPendente.id, seed),
        avancoAutomatico: true,
      },
      progresso: progresso(1, etapa2Habilitada),
      contagem: { etapa1: `${blocosRespondidos}/${N_BLOCOS}` },
      selecao: null,
    };
  }

  // etapa 1 fechada → dá para calcular o corte
  const { scores, porCapacidade, integridade } = pontuarEscolhaForcada(respostas);
  const parcial = selecionarAprofundamento(scores, porCapacidade);

  // ── empate no corte: quem decide é o respondente ──────────────────
  const precisaEscolher = parcial.criterio === 'por_escolha' && escolhas.length < parcial.faltam;
  if (etapa2Habilitada && precisaEscolher) {
    return {
      fase: 'escolha',
      tela: {
        tipo: 'escolha_de_aprofundamento',
        // Sem números: o respondente não vê score em nenhum momento.
        titulo: 'Estas competências ficaram no mesmo patamar.',
        instrucao: parcial.faltam === 1
          ? 'Escolha a que você quer aprofundar.'
          : `Escolha ${parcial.faltam} para aprofundar.`,
        opcoes: parcial.escolher.map((c) => ({ chave: c, nome: nomeDe(c) })),
        escolherQuantas: parcial.faltam,
        avancoAutomatico: false,
      },
      progresso: progresso(2, etapa2Habilitada),
      selecao: parcial,
    };
  }

  const selecionadas = etapa2Habilitada
    ? confirmarSelecaoSegura(parcial, escolhas)
    : parcial.selecionadas.concat(parcial.escolher.slice(0, parcial.faltam));

  // ── etapa 2: itens ancorados das 3 selecionadas ───────────────────
  if (etapa2Habilitada) {
    const fila = selecionadas.flatMap((c) => ancoradosDe(c).slice(0, ANCORADOS_POR_COMPETENCIA));
    const pendente = fila.find((a) => !respondido(respostas, a.id));
    if (pendente) {
      return {
        fase: 'etapa2',
        tela: {
          tipo: 'item_ancorado',
          id: pendente.id,
          competencia: pendente.competencia,
          situacao: pendente.situacao,
          // Níveis embaralhados na exibição? NÃO — a ordem crescente de
          // proficiência é a própria escala. Embaralhar destruiria a medida.
          niveis: pendente.niveis,
          avancoAutomatico: true,
        },
        progresso: progresso(2, etapa2Habilitada),
        contagem: { etapa2: `${fila.filter((a) => respondido(respostas, a.id)).length}/${fila.length}` },
        selecao: { ...parcial, selecionadas },
      };
    }
  }

  // ── etapa 3: âncoras de evidência ─────────────────────────────────
  const ancoraPendente = ANCORAS.find((a) => !respondido(respostas, a.id));
  if (ancoraPendente) {
    return {
      fase: 'etapa3',
      tela: {
        tipo: 'ancora_evidencia',
        id: ancoraPendente.id,
        pergunta: ancoraPendente.pergunta,
        opcoes: ancoraPendente.opcoes,
        // exige Continuar — é contagem factual, não impressão
        avancoAutomatico: false,
      },
      progresso: progresso(3, etapa2Habilitada),
      contagem: { etapa3: `${ANCORAS.filter((a) => respondido(respostas, a.id)).length}/${ANCORAS.length}` },
      selecao: { ...parcial, selecionadas },
    };
  }

  // ── fim ───────────────────────────────────────────────────────────
  return {
    fase: 'concluido',
    tela: {
      tipo: 'fim',
      // NADA DE RESULTADO PARCIAL. Só sinal de progresso: resultado parcial
      // vira o produto na cabeça do cliente e o segundo instrumento nunca é feito.
      titulo: 'Etapa 1 de 2 concluída',
      texto: 'O Mapeamento Comportamental foi liberado na sua conta. O relatório é gerado quando os dois estiverem completos.',
      avancoAutomatico: false,
    },
    progresso: { etapa: 3, de: 3, rotulo: 'Concluído', percentual: 100 },
    selecao: { ...parcial, selecionadas },
    integridade,
    niveis: etapa2Habilitada ? niveisDasSelecionadas(respostas, selecionadas) : null,
  };
}

function confirmarSelecaoSegura(parcial, escolhas) {
  try {
    return confirmarSelecao(parcial, escolhas);
  } catch {
    return parcial.selecionadas.concat(parcial.escolher.slice(0, parcial.faltam));
  }
}

/** Nível afirmado das 3 aprofundadas, a partir dos 2 ancorados de cada. */
export function niveisDasSelecionadas(respostas, selecionadas) {
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

/** Progresso por ETAPA, nunca por questão. */
export function progresso(etapa, etapa2Habilitada = ETAPA2_DISPONIVEL) {
  const de = etapa2Habilitada ? 3 : 2;
  const normalizada = etapa2Habilitada ? etapa : etapa === 3 ? 2 : etapa;
  return {
    etapa: normalizada,
    de,
    rotulo: ROTULO_ETAPA[etapa],
    percentual: Math.round(((normalizada - 1) / de) * 100),
  };
}

/**
 * Valida uma resposta antes de gravar. Rejeitar aqui é mais barato do que
 * descobrir depois que a checagem de integridade não fecha.
 */
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

  const ancorado = todosOsAncorados().find((a) => a.id === itemId);
  if (ancorado) {
    const n = payload?.nivel;
    if (!Number.isInteger(n) || n < 1 || n > 4) return erro('nível deve ser inteiro de 1 a 4');
    return { ok: true, etapa: 2, payload: { nivel: n } };
  }

  return erro(`item desconhecido: ${itemId}`);
}

function erro(motivo) {
  return { ok: false, motivo };
}

function todosOsAncorados() {
  const vistos = new Set();
  const out = [];
  for (const b of BLOCOS) {
    for (const o of b.opcoes) {
      if (vistos.has(o.competencia)) continue;
      vistos.add(o.competencia);
      out.push(...ancoradosDe(o.competencia));
    }
  }
  return out;
}

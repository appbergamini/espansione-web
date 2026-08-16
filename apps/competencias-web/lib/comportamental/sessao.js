// =====================================================================
// Máquina de estados do Mapeamento Comportamental (instrumento 2).
//
// Pura, como a do teste: recebe as respostas, devolve a próxima tela.
//
// O instrumento é respondido DUAS vezes — natural e em contexto — porque é
// da diferença entre as duas que sai a leitura de "o que sustenta e o que
// custa". Não é repetição: é a medida.
//
// DIFERENÇA IMPORTANTE PARA O APP ORIGINAL: aqui NÃO existe tela de
// resultado no fim. O relatório só é gerado com os dois instrumentos
// concluídos; mostrar resultado aqui faria o cliente parar no meio.
// =====================================================================
import { BLOCOS_RANKING, PARES_FORCADOS } from '@espansione/cis';

export const MOMENTOS = ['natural', 'contexto'];

export const TEXTO_MOMENTO = {
  natural: {
    titulo: 'Como você é',
    instrucao: 'Pense em você fora da pressão do dia a dia — do jeito que você é quando não precisa se ajustar a nada.',
    rank: 'Ordene as quatro palavras, da que mais se parece com você para a que menos se parece.',
    par: 'Escolha a frase mais parecida com você. Vá com a primeira impressão.',
  },
  contexto: {
    titulo: 'Como o negócio pede que você seja',
    instrucao: 'Agora pense no que o seu papel na empresa exige de você hoje — mesmo que não seja o seu jeito natural.',
    rank: 'Ordene as quatro palavras, da que o seu papel mais exige para a que menos exige.',
    par: 'Escolha a frase mais próxima do que o seu papel pede. Primeira impressão.',
  },
};

/** Todas as telas, na ordem: rank natural, par natural, rank contexto, par contexto. */
export function telas() {
  const out = [];
  for (const momento of MOMENTOS) {
    const r = momento === 'natural' ? 'R1' : 'R2';
    const p = momento === 'natural' ? 'P1' : 'P2';
    BLOCOS_RANKING.forEach((_, i) => out.push({ id: `${r}-${String(i + 1).padStart(2, '0')}`, tipo: 'ranking', momento, indice: i }));
    PARES_FORCADOS.forEach((_, i) => out.push({ id: `${p}-${String(i + 1).padStart(2, '0')}`, tipo: 'par', momento, indice: i }));
  }
  return out;
}

export const TOTAL_TELAS = telas().length;

const respondido = (respostas, id) => respostas[id] !== undefined && respostas[id] !== null;

/**
 * @param {Object} respostas — { 'R1-01': {ordem:[2,0,3,1]}, 'P1-01': {escolha:'a'}, ... }
 */
export function estadoDaSessao({ respostas = {} } = {}) {
  const todas = telas();
  const feitas = todas.filter((t) => respondido(respostas, t.id)).length;
  const pendente = todas.find((t) => !respondido(respostas, t.id));

  if (!pendente) {
    return {
      fase: 'concluido',
      tela: {
        tipo: 'fim',
        // Sem numeração aqui também: a pessoa acabou de ver "Etapa 1 de 3"
        // no teste, e um segundo esquema de contagem só confunde.
        titulo: 'Tudo pronto',
        // O relatório é ESCRITO a partir daqui, e isso leva cerca de um
        // minuto. Prometer "já pode ser lido" e entregar um spinner de 60s
        // é pior do que avisar: a espera avisada é espera, a espera não
        // avisada é travamento.
        texto: 'Os dois estão completos. O seu relatório está sendo escrito agora, a partir das suas respostas — leva cerca de um minuto.',
        acao: { rotulo: 'Ver o meu relatório', destino: 'relatorio' },
      },
      progresso: { momento: null, legenda: 'Concluído', pergunta: todas.length, deTotal: todas.length, percentual: 100 },
    };
  }

  // A troca de momento merece uma tela de transição: sem ela a pessoa acha
  // que o teste travou e está repetindo as mesmas perguntas.
  const anterior = todas[todas.indexOf(pendente) - 1];
  const trocouDeMomento = pendente.indice === 0 && pendente.tipo === 'ranking' && (!anterior || anterior.momento !== pendente.momento);

  const base = {
    fase: pendente.momento,
    progresso: {
      momento: pendente.momento,
      legenda: pendente.momento === 'natural' ? 'Como você é' : 'O que o papel pede',
      // Mesma decisão da tela do teste: o momento dá o contexto, a contagem
      // dá o tamanho. Aqui importa mais ainda, porque as mesmas palavras
      // voltam na segunda passagem e sem contador parece que travou.
      pergunta: feitas + 1,
      deTotal: todas.length,
      percentual: Math.round((feitas / todas.length) * 100),
    },
  };

  // A transição vem ANEXADA à tela real, não no lugar dela: quem decide
  // quando passar é o cliente, sem precisar de uma ida ao servidor só para
  // dispensar um aviso.
  // Vale para OS DOIS momentos, não só o segundo.
  //
  // Antes, quem começava caía direto em "ordene estas quatro palavras" sem
  // nunca ler `natural.instrucao` — que estava escrita e nunca era usada.
  // Isso não era só falta de aviso: a instrução é "pense em você fora da
  // pressão do dia a dia", e é ela que separa o momento natural do momento
  // de contexto. Sem ela a pessoa responde o primeiro bloco já pensando no
  // trabalho, os dois blocos ficam parecidos, e o vão entre eles — que é o
  // que o bloco dos pilares mostra e o seguinte explica — some.
  base.transicao = trocouDeMomento
    ? {
        id: pendente.momento,
        titulo: TEXTO_MOMENTO[pendente.momento].titulo,
        texto: TEXTO_MOMENTO[pendente.momento].instrucao,
        rotulo: pendente.momento === 'natural' ? 'Começar' : 'Continuar',
      }
    : null;

  if (pendente.tipo === 'ranking') {
    return {
      ...base,
      tela: {
        tipo: 'ranking',
        id: pendente.id,
        momento: pendente.momento,
        instrucao: TEXTO_MOMENTO[pendente.momento].rank,
        // Só o rótulo: o fator por trás de cada palavra nunca vai ao cliente.
        palavras: BLOCOS_RANKING[pendente.indice].map((it, i) => ({ indice: i, label: it.l })),
      },
    };
  }

  const par = PARES_FORCADOS[pendente.indice];
  return {
    ...base,
    tela: {
      tipo: 'par',
      id: pendente.id,
      momento: pendente.momento,
      instrucao: TEXTO_MOMENTO[pendente.momento].par,
      a: par.a,
      b: par.b,
    },
  };
}

/** Valida antes de gravar — mais barato que descobrir no cálculo. */
export function validarResposta(itemId, payload) {
  const tela = telas().find((t) => t.id === itemId);
  if (!tela) return { ok: false, motivo: `tela desconhecida: ${itemId}` };

  if (tela.tipo === 'ranking') {
    const ordem = payload?.ordem;
    if (!Array.isArray(ordem) || ordem.length !== 4) return { ok: false, motivo: 'a ordem precisa ter 4 posições' };
    if (!ordem.every((v) => Number.isInteger(v) && v >= 0 && v <= 3)) return { ok: false, motivo: 'ordem com índice inválido' };
    if (new Set(ordem).size !== 4) return { ok: false, motivo: 'a ordem não pode repetir palavra' };
    return { ok: true, payload: { ordem } };
  }

  const escolha = payload?.escolha;
  if (escolha !== 'a' && escolha !== 'b') return { ok: false, motivo: 'escolha precisa ser "a" ou "b"' };
  return { ok: true, payload: { escolha } };
}

/**
 * Converte as respostas gravadas no formato que calcularScores espera.
 * Reconstrói contra o catálogo do pacote: o que ficou salvo é índice, não
 * rótulo, então mudar o texto de um item não invalida respostas antigas.
 */
export function montarRaw(respostas) {
  const raw = { r1: [], p1: [], r2: [], p2: [] };
  for (const t of telas()) {
    const r = respostas[t.id];
    if (!r) continue;
    if (t.tipo === 'ranking') {
      const bloco = BLOCOS_RANKING[t.indice];
      const ordenado = r.ordem.map((i) => bloco[i]);
      raw[t.momento === 'natural' ? 'r1' : 'r2'].push(ordenado);
    } else {
      const par = PARES_FORCADOS[t.indice];
      raw[t.momento === 'natural' ? 'p1' : 'p2'].push(r.escolha === 'a' ? par.fa : par.fb);
    }
  }
  return raw;
}

export function estaCompleto(respostas) {
  return telas().every((t) => respondido(respostas, t.id));
}

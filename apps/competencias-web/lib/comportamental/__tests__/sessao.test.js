import test from 'node:test';
import assert from 'node:assert/strict';

import { BLOCOS_RANKING, PARES_FORCADOS, calcularScores, derivarPilares, PILARES } from '@espansione/cis';
import { estadoDaSessao, validarResposta, montarRaw, telas, TOTAL_TELAS, estaCompleto, MOMENTOS } from '../sessao.js';

let seed = 5150;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
function embaralhar(a) {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c;
}

/** Caminha o fluxo inteiro respondendo tudo, e devolve as respostas. */
function caminharTudo() {
  const respostas = {};
  let guarda = 0;
  const vistas = [];
  while (guarda++ < 80) {
    const e = estadoDaSessao({ respostas });
    if (e.fase === 'concluido') break;
    vistas.push(e.tela.id);
    respostas[e.tela.id] = respostaPara(e.tela.id);
  }
  return { respostas, vistas, guarda };
}
function respostaPara(id) {
  const t = telas().find((x) => x.id === id);
  return t.tipo === 'ranking' ? { ordem: embaralhar([0, 1, 2, 3]) } : { escolha: rnd() < 0.5 ? 'a' : 'b' };
}

// ── estrutura ────────────────────────────────────────────────────────
test('o instrumento tem 28 telas: 8 rankings + 6 pares, duas vezes', () => {
  assert.equal(TOTAL_TELAS, (BLOCOS_RANKING.length + PARES_FORCADOS.length) * 2);
  assert.equal(TOTAL_TELAS, 28);
  for (const m of MOMENTOS) {
    assert.equal(telas().filter((t) => t.momento === m && t.tipo === 'ranking').length, 8);
    assert.equal(telas().filter((t) => t.momento === m && t.tipo === 'par').length, 6);
  }
  assert.equal(new Set(telas().map((t) => t.id)).size, 28, 'id de tela repetido');
});

test('a ordem é: tudo do natural, depois tudo do contexto', () => {
  const ms = telas().map((t) => t.momento);
  assert.equal(ms.indexOf('contexto'), ms.lastIndexOf('natural') + 1);
});

// ── fluxo ────────────────────────────────────────────────────────────
test('começa no primeiro ranking do momento natural', () => {
  const e = estadoDaSessao({});
  assert.equal(e.fase, 'natural');
  assert.equal(e.tela.tipo, 'ranking');
  assert.equal(e.tela.palavras.length, 4);
});

test('a troca de momento anexa a transição à primeira tela do contexto', () => {
  const respostas = {};
  for (const t of telas().filter((x) => x.momento === 'natural')) respostas[t.id] = respostaPara(t.id);
  const e = estadoDaSessao({ respostas });
  assert.equal(e.fase, 'contexto');
  assert.ok(e.transicao, 'a primeira tela do contexto precisa vir com a transição');
  assert.match(e.transicao.titulo, /o negócio pede/i);
  // a tela real vem junto: dispensar o aviso não custa uma ida ao servidor
  assert.equal(e.tela.tipo, 'ranking');
  assert.ok(e.tela.id.startsWith('R2-'));
});

/**
 * Antes este teste cobrava o contrário: "nunca no momento natural". A
 * decisão foi invertida em 16/08, e o motivo fica aqui para não ser
 * desfeita por engano.
 *
 * Contra: quem chega aqui acabou de clicar em "Fazer o Mapeamento
 * Comportamental" na tela de conclusão do teste, e passa a ver duas telas
 * de aviso seguidas.
 *
 * A favor, e é o que pesou: a instrução do momento natural é "pense em
 * você fora da pressão do dia a dia", e é ela que separa os dois momentos.
 * O enunciado do ranking natural diz só "a que mais se parece com você" —
 * ambíguo sobre QUAL você, enquanto o do contexto já diz "o que o seu
 * papel exige" e fica bem enquadrado sozinho. Essa assimetria fazia o
 * primeiro bloco ser respondido em modo trabalho, os dois blocos saírem
 * parecidos e o vão entre eles encolher — que é exatamente o que o
 * relatório mede. Custo: um clique. Benefício: o instrumento medir o que
 * diz medir.
 */
test('a transição some depois de a primeira tela do momento ser respondida', () => {
  const respostas = {};
  const naturais = telas().filter((x) => x.momento === 'natural');
  for (const t of naturais) respostas[t.id] = respostaPara(t.id);
  assert.ok(estadoDaSessao({ respostas }).transicao, 'a virada para o contexto precisa avisar');

  const primeiraContexto = telas().find((t) => t.momento === 'contexto');
  respostas[primeiraContexto.id] = respostaPara(primeiraContexto.id);
  assert.equal(estadoDaSessao({ respostas }).transicao, null, 'a transição não pode reaparecer no meio do bloco');
});

test('caminhada E2E: 28 telas, nenhuma repetida, terminando em concluído', () => {
  const { respostas, vistas, guarda } = caminharTudo();
  assert.ok(guarda < 80, 'o fluxo não terminou');
  assert.equal(vistas.length, 28);
  assert.equal(new Set(vistas).size, 28);
  assert.ok(estaCompleto(respostas));
  assert.equal(estadoDaSessao({ respostas }).fase, 'concluido');
});

test('NÃO existe tela de resultado no fim — só sinal de progresso', () => {
  const { respostas } = caminharTudo();
  const e = estadoDaSessao({ respostas });
  const texto = JSON.stringify(e.tela).toLowerCase();
  for (const proibido of ['determinação', 'conexão', 'constância', 'precisão', 'perfil', 'score', 'ousadia']) {
    assert.ok(!texto.includes(proibido), `a tela final vazou "${proibido}"`);
  }
  assert.match(e.tela.titulo, /Tudo pronto/);
  assert.equal(e.tela.acao?.destino, 'relatorio', 'a tela final precisa levar ao relatorio');
  assert.doesNotMatch(e.tela.titulo, /etapa/i, 'não criar um segundo esquema de numeração');
});

test('a tela de ranking não expõe o fator por trás da palavra', () => {
  const e = estadoDaSessao({});
  for (const p of e.tela.palavras) {
    assert.deepEqual(Object.keys(p).sort(), ['indice', 'label']);
  }
  assert.ok(!JSON.stringify(e.tela).includes('"d"'), 'o fator não pode ir ao cliente');
});

test('progresso traz contagem de perguntas, e o denominador é fixo em 28', () => {
  const respostas = {};
  for (let i = 0; i < 6; i++) {
    const e = estadoDaSessao({ respostas });
    assert.equal(e.progresso.pergunta, i + 1);
    assert.equal(e.progresso.deTotal, 28);
    assert.equal(e.progresso.percentual, Math.round((i / 28) * 100));
    respostas[e.tela.id] = respostaPara(e.tela.id);
  }
});

test('a contagem NÃO reinicia na virada para o momento contexto', () => {
  const respostas = {};
  for (const t of telas().filter((x) => x.momento === 'natural')) respostas[t.id] = respostaPara(t.id);
  const e = estadoDaSessao({ respostas });
  // 14 do natural já respondidas: a próxima é a 15, não a 1
  assert.equal(e.progresso.pergunta, 15);
  assert.equal(e.progresso.percentual, 50);
});

test('no fim, 28 de 28 e 100%', () => {
  const { respostas } = caminharTudo();
  const e = estadoDaSessao({ respostas });
  assert.equal(e.progresso.percentual, 100);
  assert.equal(e.progresso.pergunta, 28);
  assert.equal(e.progresso.deTotal, 28);
});

// ── validação ────────────────────────────────────────────────────────
test('validarResposta exige permutação completa de 4 no ranking', () => {
  assert.equal(validarResposta('R1-01', { ordem: [0, 1, 2, 3] }).ok, true);
  assert.equal(validarResposta('R1-01', { ordem: [3, 2, 1, 0] }).ok, true);
  assert.equal(validarResposta('R1-01', { ordem: [0, 1, 2] }).ok, false);
  assert.equal(validarResposta('R1-01', { ordem: [0, 0, 1, 2] }).ok, false);
  assert.equal(validarResposta('R1-01', { ordem: [0, 1, 2, 4] }).ok, false);
  assert.equal(validarResposta('R1-01', {}).ok, false);
});

test('validarResposta aceita só "a" ou "b" no par', () => {
  assert.equal(validarResposta('P1-01', { escolha: 'a' }).ok, true);
  assert.equal(validarResposta('P1-01', { escolha: 'b' }).ok, true);
  assert.equal(validarResposta('P1-01', { escolha: 'c' }).ok, false);
  assert.equal(validarResposta('P2-06', { escolha: 'a' }).ok, true);
  assert.equal(validarResposta('X9-99', { escolha: 'a' }).ok, false);
});

// ── ligação com o pacote ─────────────────────────────────────────────
test('montarRaw produz exatamente o que calcularScores espera', () => {
  const { respostas } = caminharTudo();
  const raw = montarRaw(respostas);
  assert.equal(raw.r1.length, 8);
  assert.equal(raw.r2.length, 8);
  assert.equal(raw.p1.length, 6);
  assert.equal(raw.p2.length, 6);
  for (const bloco of [...raw.r1, ...raw.r2]) {
    assert.equal(bloco.length, 4);
    assert.equal(new Set(bloco.map((i) => i.d)).size, 4, 'cada bloco tem um item de cada fator');
  }
  for (const f of [...raw.p1, ...raw.p2]) assert.ok('DISC'.includes(f));

  const s = calcularScores(raw);
  assert.equal(Object.values(s.disc).reduce((a, b) => a + b, 0), 200);
  assert.equal(Object.values(s.dA).reduce((a, b) => a + b, 0), 200);
});

test('os 4 pilares saem da resposta real e somam 200 nos dois momentos', () => {
  const { respostas } = caminharTudo();
  const p = derivarPilares(calcularScores(montarRaw(respostas)));
  assert.deepEqual(Object.keys(p).sort(), [...PILARES].sort());
  assert.equal(PILARES.reduce((a, k) => a + p[k].natural, 0), 200);
  assert.equal(PILARES.reduce((a, k) => a + p[k].emContexto, 0), 200);
});

test('gravar índice em vez de rótulo: a resposta sobrevive a mudança de texto', () => {
  const respostas = { 'R1-01': { ordem: [2, 0, 3, 1] } };
  const raw = montarRaw(respostas);
  const bloco = BLOCOS_RANKING[0];
  assert.deepEqual(raw.r1[0], [bloco[2], bloco[0], bloco[3], bloco[1]]);
});

test('resposta parcial monta raw parcial sem quebrar', () => {
  const raw = montarRaw({ 'R1-01': { ordem: [0, 1, 2, 3] }, 'P1-01': { escolha: 'a' } });
  assert.equal(raw.r1.length, 1);
  assert.equal(raw.p1.length, 1);
  assert.equal(raw.r2.length, 0);
  assert.equal(estaCompleto({ 'R1-01': { ordem: [0, 1, 2, 3] } }), false);
});


// ── instrução na virada de momento ───────────────────────────────────
/**
 * A instrução do momento `natural` — "pense em você fora da pressão do dia
 * a dia" — é o que separa os dois momentos. Ela existia escrita em
 * TEXTO_MOMENTO e nunca era mostrada: quem começava caía direto no
 * ranking. Sem ela a pessoa responde o primeiro bloco já pensando no
 * trabalho, os dois blocos ficam parecidos e o vão entre eles some — que
 * é justamente o que o relatório mede. Não é aviso de UX, é validade.
 */
test('os DOIS momentos abrem com a sua instrução, uma vez cada', () => {
  const respostas = {};
  const vistas = [];
  let guarda = 0;

  while (guarda++ < 60) {
    const e = estadoDaSessao({ respostas });
    if (e.tela.tipo === 'fim') break;
    if (e.transicao) vistas.push(e.transicao);
    respostas[e.tela.id] = e.tela.tipo === 'ranking' ? { ordem: [0, 1, 2, 3] } : { escolha: 0 };
  }

  assert.deepEqual(vistas.map((t) => t.id), ['natural', 'contexto'], 'faltou a instrução de um dos momentos');
  for (const t of vistas) {
    assert.ok(t.titulo && t.texto && t.rotulo, `transição ${t.id} incompleta`);
  }
  // O que a instrução do primeiro momento precisa fazer.
  assert.match(vistas[0].texto, /fora da pressão/i);
  assert.match(vistas[1].texto, /papel|exige/i);
});

test('a transição vem ANEXADA à tela, não no lugar dela', () => {
  // Sem isso, dispensar o aviso custaria uma ida ao servidor — e quem
  // volta uma pergunta perderia a tela real por causa do aviso.
  const e = estadoDaSessao({ respostas: {} });
  assert.ok(e.transicao, 'a primeira tela deveria trazer a instrução');
  assert.ok(e.tela?.id, 'a tela real precisa vir junto com a transição');
});

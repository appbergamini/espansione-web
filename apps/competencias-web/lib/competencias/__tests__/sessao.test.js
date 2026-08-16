import test from 'node:test';
import assert from 'node:assert/strict';

import { BLOCOS, ANCORAS, N_BLOCOS, CHAVES, ancoradosDe } from '../catalog.js';
import {
  estadoDaSessao, validarResposta, telasDaSessao, totalDeTelas, totalMinimoDeTelas, ROTULO_ETAPA,
} from '../sessao.js';

const SEED = 'sessao-teste';

function responderTodosOsBlocos(escolha = 0) {
  const r = {};
  for (const b of BLOCOS) {
    r[b.id] = { mais: b.opcoes[escolha].competencia, menos: b.opcoes[(escolha + 1) % 4].competencia };
  }
  return r;
}
function responderTudo(respostas = responderTodosOsBlocos()) {
  let guarda = 0;
  while (guarda++ < 80) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    if (e.fase === 'concluido') break;
    respostas[e.tela.id] = e.tela.tipo === 'escolha_forcada'
      ? { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia }
      : e.tela.tipo === 'item_ancorado' ? { nivel: 3 } : { valor: 2 };
  }
  return respostas;
}

// ── fluxo ────────────────────────────────────────────────────────────
test('sessão vazia começa na etapa 1, no primeiro bloco', () => {
  const e = estadoDaSessao({ seed: SEED });
  assert.equal(e.fase, 'etapa1');
  assert.equal(e.tela.tipo, 'escolha_forcada');
  assert.equal(e.tela.id, BLOCOS[0].id);
  assert.equal(e.tela.opcoes.length, 4);
});

test('a ordem das opções é embaralhada pela seed, mas o conteúdo é o mesmo', () => {
  const a = estadoDaSessao({ seed: 'A' }).tela;
  const b = estadoDaSessao({ seed: 'B' }).tela;
  assert.deepEqual(a.opcoes.map((o) => o.competencia).sort(), b.opcoes.map((o) => o.competencia).sort());
  assert.deepEqual([...a.ordemExibida].sort(), [0, 1, 2, 3]);
});

test('caminhada E2E: nenhuma tela repetida, terminando em concluído', () => {
  const respostas = {};
  const vistas = [];
  let guarda = 0;
  while (guarda++ < 80) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    if (e.fase === 'concluido') break;
    vistas.push(e.tela.id);
    respostas[e.tela.id] = e.tela.tipo === 'escolha_forcada'
      ? { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia }
      : e.tela.tipo === 'item_ancorado' ? { nivel: 2 } : { valor: 1 };
  }
  assert.ok(guarda < 80, 'o fluxo não terminou');
  assert.equal(new Set(vistas).size, vistas.length, 'tela repetida');
  assert.equal(vistas.length, totalDeTelas(respostas, { etapa2Habilitada: true }));
  assert.equal(estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true }).fase, 'concluido');
});

// ── AVANÇO AUTOMÁTICO EM TUDO ────────────────────────────────────────
test('todas as etapas avançam sozinhas — nada de comportamento misto', () => {
  const respostas = {};
  const tipos = new Set();
  let guarda = 0;
  while (guarda++ < 80) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    if (e.fase === 'concluido') break;
    tipos.add(e.tela.tipo);
    assert.equal(e.tela.avancoAutomatico, true, `${e.tela.tipo} não avança sozinha`);
    respostas[e.tela.id] = e.tela.tipo === 'escolha_forcada'
      ? { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia }
      : e.tela.tipo === 'item_ancorado' ? { nivel: 2 } : { valor: 1 };
  }
  assert.deepEqual([...tipos].sort(), ['ancora_evidencia', 'escolha_forcada', 'item_ancorado']);
});

// ── EMPATE: aprofunda todas, sem perguntar a ninguém ─────────────────
test('não existe mais tela de escolha de aprofundamento', () => {
  for (let i = 0; i < 4; i++) {
    const respostas = responderTodosOsBlocos(i);
    let guarda = 0;
    while (guarda++ < 80) {
      const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
      if (e.fase === 'concluido') break;
      assert.notEqual(e.tela.tipo, 'escolha_de_aprofundamento');
      assert.notEqual(e.fase, 'escolha');
      respostas[e.tela.id] = e.tela.tipo === 'escolha_forcada'
        ? { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia }
        : e.tela.tipo === 'item_ancorado' ? { nivel: 2 } : { valor: 1 };
    }
  }
});

test('empate no corte aprofunda TODAS as empatadas, com 2 telas cada', () => {
  // 5 competências no fundo com o mesmo score
  const respostas = responderTodosOsBlocos();
  const { selecao, lista } = telasDaSessao(respostas, { etapa2Habilitada: true });
  assert.ok(selecao.selecionadas.length >= 3, 'no mínimo 3 competências');
  const ancorados = lista.filter((t) => t.etapa === 2);
  assert.equal(ancorados.length, selecao.selecionadas.length * 2, '2 ancorados por competência');
  assert.equal(lista.length, N_BLOCOS + ancorados.length + ANCORAS.length);
  if (selecao.selecionadas.length > 3) assert.equal(selecao.criterio, 'ampliado_por_empate');
  else assert.equal(selecao.criterio, 'por_score');
});

test('o total nunca fica abaixo do mínimo, e cresce com o empate', () => {
  const minimo = totalMinimoDeTelas({ etapa2Habilitada: true });
  assert.equal(minimo, N_BLOCOS + 6 + ANCORAS.length);
  for (let i = 0; i < 4; i++) {
    const respostas = responderTodosOsBlocos(i);
    const total = totalDeTelas(respostas, { etapa2Habilitada: true });
    assert.ok(total >= minimo, `total ${total} < mínimo ${minimo}`);
    assert.equal((total - N_BLOCOS - ANCORAS.length) % 2, 0, 'ancorados sempre em pares');
  }
});

// ── contador POR BLOCO: o denominador nunca muda no meio do bloco ────
test('o contador é local ao bloco, não global', () => {
  const e = estadoDaSessao({ respostas: {}, seed: SEED, etapa2Habilitada: true });
  assert.equal(e.progresso.deTotal, N_BLOCOS, 'na etapa 1 o denominador é o nº de blocos');
  assert.equal(e.progresso.pergunta, 1);
});

test('o denominador de um bloco NÃO muda enquanto se está dentro dele', () => {
  const respostas = {};
  const denominadores = new Set();
  for (let i = 0; i < N_BLOCOS; i++) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    denominadores.add(e.progresso.deTotal);
    assert.equal(e.progresso.pergunta, i + 1);
    respostas[e.tela.id] = { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[1].competencia };
  }
  assert.equal(denominadores.size, 1, `denominador oscilou dentro da etapa 1: ${[...denominadores]}`);
});

test('o aprofundamento é um bloco próprio, com o seu tamanho', () => {
  const respostas = responderTodosOsBlocos();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  assert.equal(e.fase, 'etapa2');
  const { selecao } = telasDaSessao(respostas, { etapa2Habilitada: true });
  assert.equal(e.progresso.deTotal, selecao.selecionadas.length * 2);
  assert.equal(e.progresso.pergunta, 1, 'o bloco novo começa em 1, não continua a contagem anterior');
});

test('o progresso traz um segmento por bloco, e nenhum recua', () => {
  const respostas = {};
  let anteriores = null;
  let guarda = 0;
  while (guarda++ < 80) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    const segs = e.progresso.segmentos;
    assert.equal(segs.length, 3, 'três blocos');
    assert.deepEqual(segs.map((s) => s.etapa), [1, 2, 3]);
    if (anteriores) {
      for (let i = 0; i < segs.length; i++) {
        const antes = anteriores[i].estado === 'completo' ? 100 : anteriores[i].percentual;
        const agora = segs[i].estado === 'completo' ? 100 : segs[i].percentual;
        assert.ok(agora >= antes, `segmento ${i + 1} recuou de ${antes}% para ${agora}%`);
      }
    }
    anteriores = segs;
    if (e.fase === 'concluido') break;
    respostas[e.tela.id] = e.tela.tipo === 'escolha_forcada'
      ? { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia }
      : e.tela.tipo === 'item_ancorado' ? { nivel: 2 } : { valor: 1 };
  }
  assert.ok(guarda < 80);
});

test('crescer a etapa 2 não mexe no bloco 1, que já estava completo', () => {
  const respostas = responderTodosOsBlocos();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  const bloco1 = e.progresso.segmentos.find((s) => s.etapa === 1);
  assert.equal(bloco1.estado, 'completo');
  assert.equal(bloco1.feitas, N_BLOCOS);
  assert.equal(bloco1.total, N_BLOCOS);
});

// ── VOLTAR ───────────────────────────────────────────────────────────
test('a primeira tela não tem para onde voltar', () => {
  const e = estadoDaSessao({ respostas: {}, seed: SEED });
  assert.equal(e.navegacao.anterior, null);
});

test('da segunda tela em diante dá para voltar, e a resposta vem preenchida', () => {
  const respostas = {};
  const primeira = estadoDaSessao({ respostas, seed: SEED });
  respostas[primeira.tela.id] = { mais: primeira.tela.opcoes[0].competencia, menos: primeira.tela.opcoes[1].competencia };

  const segunda = estadoDaSessao({ respostas, seed: SEED });
  assert.equal(segunda.navegacao.anterior, primeira.tela.id);

  const revendo = estadoDaSessao({ respostas, seed: SEED, telaAtual: primeira.tela.id });
  assert.equal(revendo.tela.id, primeira.tela.id);
  assert.equal(revendo.navegacao.revisitando, true);
  assert.deepEqual(revendo.tela.resposta, respostas[primeira.tela.id], 'a resposta anterior tem de vir preenchida');
  assert.equal(revendo.navegacao.frontier, segunda.tela.id, 'oferece o caminho de volta para onde parou');
  assert.equal(revendo.navegacao.proxima, segunda.tela.id);
});

test('revisitar não muda o progresso já conquistado', () => {
  const respostas = {};
  for (let i = 0; i < 5; i++) {
    const e = estadoDaSessao({ respostas, seed: SEED });
    respostas[e.tela.id] = { mais: e.tela.opcoes[0].computed || e.tela.opcoes[0].competencia, menos: e.tela.opcoes[1].competencia };
  }
  const normal = estadoDaSessao({ respostas, seed: SEED });
  const revendo = estadoDaSessao({ respostas, seed: SEED, telaAtual: BLOCOS[1].id });
  assert.equal(revendo.progresso.respondidas, normal.progresso.respondidas);
  assert.equal(revendo.progresso.percentual, normal.progresso.percentual);
});

test('não dá para "voltar" para uma tela à frente da fronteira', () => {
  const respostas = {};
  const adiante = BLOCOS[8].id;
  const e = estadoDaSessao({ respostas, seed: SEED, telaAtual: adiante });
  assert.equal(e.tela.id, BLOCOS[0].id, 'deve ignorar o pedido e ficar na fronteira');
  assert.equal(e.navegacao.revisitando, false);
});

test('da tela final dá para voltar e corrigir a última resposta', () => {
  const respostas = responderTudo();
  const fim = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  assert.equal(fim.fase, 'concluido');
  assert.ok(fim.tela.anterior, 'a tela final precisa oferecer Voltar');
  const revendo = estadoDaSessao({ respostas, seed: SEED, telaAtual: fim.tela.anterior, etapa2Habilitada: true });
  assert.equal(revendo.tela.id, fim.tela.anterior);
  assert.ok(revendo.tela.resposta, 'com a resposta preenchida');
});

// ── progresso ────────────────────────────────────────────────────────
test('progresso traz etapa E contagem de perguntas', () => {
  const e = estadoDaSessao({ respostas: {}, seed: SEED });
  assert.equal(e.progresso.etapa, 1);
  assert.equal(e.progresso.rotulo, ROTULO_ETAPA[1]);
  assert.equal(e.progresso.pergunta, 1);
  assert.equal(e.progresso.percentual, 0);
  assert.match(e.progresso.legenda, /Etapa 1 de 3/);
});

test('a contagem avança junto com as respostas', () => {
  const respostas = {};
  for (let i = 0; i < 5; i++) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    assert.equal(e.progresso.pergunta, i + 1);
    assert.equal(e.progresso.segmentos[0].feitas, i);
    respostas[e.tela.id] = { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[1].competencia };
  }
});

test('no fim, 100% e a contagem no total', () => {
  const respostas = responderTudo();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  assert.equal(e.progresso.percentual, 100);
  assert.equal(e.progresso.pergunta, e.progresso.deTotal);
  assert.equal(e.progresso.legenda, 'Concluído');
});

// ── tela final ───────────────────────────────────────────────────────
test('a tela final NÃO mostra resultado — só sinal de progresso', () => {
  const respostas = responderTudo();
  const { tela } = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  const texto = JSON.stringify(tela).toLowerCase();
  for (const proibido of ['score', 'mais_forte', 'mais_fragil', 'frágil', 'pontuação']) {
    assert.ok(!texto.includes(proibido), `a tela final vazou "${proibido}"`);
  }
  assert.match(tela.titulo, /Teste concluído/);
});

test('a tela final NÃO cria um segundo esquema de numeração', () => {
  const respostas = responderTudo();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  assert.doesNotMatch(e.tela.titulo, /etapa/i);
  assert.doesNotMatch(e.tela.texto, /etapa \d/i);
  assert.equal(e.progresso.legenda, 'Concluído');
});

test('o texto final não fala de métrica de funil com quem está respondendo', () => {
  const respostas = responderTudo();
  const { texto } = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true }).tela;
  for (const jargao of ['taxa', 'conversão', 'funil', 'percentual de quem']) {
    assert.ok(!texto.toLowerCase().includes(jargao), `jargão interno vazou: "${jargao}"`);
  }
});

test('a integridade e os níveis saem no fim', () => {
  const respostas = responderTudo();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  assert.ok(e.integridade.somaZero);
  assert.equal(Object.keys(e.niveis).length, e.selecao.selecionadas.length);
  for (const n of Object.values(e.niveis)) assert.equal(n.confianca, 'afirmado');
});

// ── validação ────────────────────────────────────────────────────────
test('validarResposta aceita bloco válido e devolve a ordem exibida', () => {
  const b = BLOCOS[0];
  const r = validarResposta(b.id, { mais: b.opcoes[0].competencia, menos: b.opcoes[1].competencia }, { seed: SEED });
  assert.equal(r.ok, true);
  assert.equal(r.etapa, 1);
  assert.deepEqual([...r.ordemExibida].sort(), [0, 1, 2, 3]);
});

test('validarResposta rejeita mais === menos, opção de fora e item inexistente', () => {
  const b = BLOCOS[0];
  assert.equal(validarResposta(b.id, { mais: b.opcoes[0].competencia, menos: b.opcoes[0].competencia }).ok, false);
  const deFora = CHAVES.find((c) => !b.opcoes.some((o) => o.competencia === c));
  assert.equal(validarResposta(b.id, { mais: deFora, menos: b.opcoes[1].competencia }).ok, false);
  assert.equal(validarResposta('B99', { mais: 'a', menos: 'b' }).ok, false);
  assert.equal(validarResposta('ANC-nao_existe-1', { nivel: 2 }).ok, false);
});

test('validarResposta limita a âncora a 0–4 e o ancorado a 1–4', () => {
  const a = ANCORAS[0];
  assert.equal(validarResposta(a.id, { valor: 0 }).ok, true);
  assert.equal(validarResposta(a.id, { valor: 4 }).ok, true);
  assert.equal(validarResposta(a.id, { valor: 5 }).ok, false);
  assert.equal(validarResposta(a.id, { valor: 2.5 }).ok, false);

  const anc = ancoradosDe('vender_negociar')[0];
  assert.equal(validarResposta(anc.id, { nivel: 1 }).ok, true);
  assert.equal(validarResposta(anc.id, { nivel: 4 }).ok, true);
  assert.equal(validarResposta(anc.id, { nivel: 0 }).ok, false);
  assert.equal(validarResposta(anc.id, { nivel: 5 }).ok, false);
});

test('a resposta gravada é só o que interessa — nada de campo extra do cliente', () => {
  const b = BLOCOS[0];
  const r = validarResposta(b.id, { mais: b.opcoes[0].competencia, menos: b.opcoes[1].competencia, admin: true }, { seed: SEED });
  assert.deepEqual(Object.keys(r.payload).sort(), ['mais', 'menos']);
});

test('os níveis de um item ancorado saem em ordem crescente, nunca embaralhados', () => {
  const respostas = responderTodosOsBlocos();
  const { lista } = telasDaSessao(respostas, { etapa2Habilitada: true });
  const anc = lista.find((t) => t.etapa === 2);
  assert.deepEqual(anc.ancorado.niveis.map((n) => n.nivel), [1, 2, 3, 4]);
});

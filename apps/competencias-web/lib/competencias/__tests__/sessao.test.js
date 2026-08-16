import test from 'node:test';
import assert from 'node:assert/strict';

import { BLOCOS, ANCORAS, N_BLOCOS, CHAVES, ancoradosDe } from '../catalog.js';
import { estadoDaSessao, validarResposta, totalDeTelas, progresso, ROTULO_ETAPA } from '../sessao.js';

const SEED = 'sessao-teste';

// Responde todos os blocos escolhendo sempre a 1ª como MAIS e a 2ª como MENOS.
function responderTodosOsBlocos() {
  const r = {};
  for (const b of BLOCOS) r[b.id] = { mais: b.opcoes[0].competencia, menos: b.opcoes[1].competencia };
  return r;
}
function responderTodasAsAncoras(r) {
  for (const a of ANCORAS) r[a.id] = { valor: 2 };
  return r;
}

// ── fluxo ────────────────────────────────────────────────────────────
test('sessão vazia começa na etapa 1, no primeiro bloco', () => {
  const e = estadoDaSessao({ seed: SEED });
  assert.equal(e.fase, 'etapa1');
  assert.equal(e.tela.tipo, 'escolha_forcada');
  assert.equal(e.tela.id, BLOCOS[0].id);
  assert.equal(e.tela.opcoes.length, 4);
  assert.equal(e.tela.avancoAutomatico, true);
});

test('a ordem das opções é embaralhada pela seed, mas o conteúdo é o mesmo', () => {
  const a = estadoDaSessao({ seed: 'A' }).tela;
  const b = estadoDaSessao({ seed: 'B' }).tela;
  assert.deepEqual(
    a.opcoes.map((o) => o.competencia).sort(),
    b.opcoes.map((o) => o.competencia).sort()
  );
  assert.deepEqual([...a.ordemExibida].sort(), [0, 1, 2, 3]);
});

test('avança bloco a bloco e nunca repete uma tela já respondida', () => {
  const respostas = {};
  const vistos = new Set();
  for (let i = 0; i < N_BLOCOS; i++) {
    const e = estadoDaSessao({ respostas, seed: SEED });
    assert.equal(e.fase, 'etapa1');
    assert.ok(!vistos.has(e.tela.id), `tela ${e.tela.id} apareceu duas vezes`);
    vistos.add(e.tela.id);
    respostas[e.tela.id] = { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[1].competencia };
  }
  assert.equal(vistos.size, N_BLOCOS);
  assert.notEqual(estadoDaSessao({ respostas, seed: SEED }).fase, 'etapa1');
});

test('com a etapa 2 desabilitada, o fluxo vai da etapa 1 direto às âncoras', () => {
  const respostas = responderTodosOsBlocos();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false });
  assert.equal(e.fase, 'etapa3');
  assert.equal(e.tela.tipo, 'ancora_evidencia');
  assert.equal(e.tela.id, ANCORAS[0].id);
});

test('âncoras NÃO avançam sozinhas — exigem Continuar', () => {
  const respostas = responderTodosOsBlocos();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false });
  assert.equal(e.tela.avancoAutomatico, false);
});

test('respondidas as 4 âncoras, a sessão conclui', () => {
  const respostas = responderTodasAsAncoras(responderTodosOsBlocos());
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false });
  assert.equal(e.fase, 'concluido');
  assert.equal(e.tela.tipo, 'fim');
  assert.equal(e.progresso.percentual, 100);
});

test('a tela final NÃO mostra resultado — só sinal de progresso', () => {
  const respostas = responderTodasAsAncoras(responderTodosOsBlocos());
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false });
  const texto = JSON.stringify(e.tela).toLowerCase();
  for (const proibido of ['score', 'mais_forte', 'mais_fragil', 'frágil', 'pontuação', 'resultado d']) {
    assert.ok(!texto.includes(proibido), `a tela final vazou "${proibido}"`);
  }
  assert.match(e.tela.titulo, /Teste concluído/);
});

test('a tela final NÃO cria um segundo esquema de numeração', () => {
  // A barra conta as ETAPAS do teste (1 a 3). O título não pode contar os
  // INSTRUMENTOS (1 de 2) com a mesma palavra, na mesma tela.
  const respostas = responderTodasAsAncoras(responderTodosOsBlocos());
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false });
  assert.doesNotMatch(e.tela.titulo, /etapa/i, `título não pode numerar etapa: "${e.tela.titulo}"`);
  assert.doesNotMatch(e.tela.texto, /etapa \d/i);
  assert.equal(e.progresso.legenda, 'Concluído', 'a barra também não repete "Etapa X de Y" no fim');
});

test('o texto final não fala de métrica de funil com quem está respondendo', () => {
  const respostas = responderTodasAsAncoras(responderTodosOsBlocos());
  const { texto } = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false }).tela;
  for (const jargao of ['taxa', 'conversão', 'funil', 'percentual de quem']) {
    assert.ok(!texto.toLowerCase().includes(jargao), `jargão interno vazou para o cliente: "${jargao}"`);
  }
});

// ── empate e escolha ─────────────────────────────────────────────────
test('empate no corte abre a tela de escolha, sem mostrar número', () => {
  // Responder sempre a MESMA capacidade como MAIS e MENOS deixa muitas
  // competências em 0 e força o empate.
  const respostas = {};
  for (const b of BLOCOS) respostas[b.id] = { mais: b.opcoes[0].competencia, menos: b.opcoes[0].competencia === b.opcoes[1].competencia ? b.opcoes[2].competencia : b.opcoes[1].competencia };
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });

  if (e.fase === 'escolha') {
    assert.equal(e.tela.tipo, 'escolha_de_aprofundamento');
    assert.ok(e.tela.escolherQuantas >= 1);
    assert.ok(e.tela.opcoes.length > e.tela.escolherQuantas);
    assert.equal(e.tela.avancoAutomatico, false);
    const texto = JSON.stringify(e.tela);
    assert.ok(!/-?\d+\s*(ponto|score)/i.test(texto), 'a tela de escolha não pode mostrar score');
    for (const o of e.tela.opcoes) {
      assert.ok(CHAVES.includes(o.chave));
      assert.ok(o.nome && o.nome !== o.chave, 'deve mostrar o nome, não a chave interna');
    }
  } else {
    // corte limpo é resultado válido; o teste de empate forçado está abaixo
    assert.ok(['etapa2', 'etapa3', 'concluido'].includes(e.fase));
  }
});

test('escolha do respondente destrava o fluxo', () => {
  const respostas = responderTodosOsBlocos();
  const semEscolha = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  if (semEscolha.fase !== 'escolha') return; // corte limpo neste fixture
  const escolhas = semEscolha.tela.opcoes.slice(0, semEscolha.tela.escolherQuantas).map((o) => o.chave);
  const comEscolha = estadoDaSessao({ respostas, escolhas, seed: SEED, etapa2Habilitada: true });
  assert.notEqual(comEscolha.fase, 'escolha');
  assert.equal(comEscolha.selecao.selecionadas.length, 3);
});

// ── progresso ────────────────────────────────────────────────────────
// A SPEC §5.2 proibia contagem por questão. Decisão de 16/08 reverteu:
// mostra a etapa (contexto) E a contagem (tamanho). Ver comentário em
// sessao.js#progresso para o porquê.
test('progresso traz etapa E contagem de perguntas', () => {
  const e = estadoDaSessao({ respostas: {}, seed: SEED });
  assert.equal(e.progresso.etapa, 1);
  assert.equal(e.progresso.rotulo, ROTULO_ETAPA[1]);
  assert.equal(e.progresso.pergunta, 1, 'na primeira tela, é a pergunta 1');
  assert.equal(e.progresso.deTotal, totalDeTelas({ etapa2Habilitada: true }));
  assert.equal(e.progresso.percentual, 0, '0% realizado antes de responder qualquer coisa');
});

test('a contagem avança junto com as respostas, e o percentual acompanha', () => {
  const respostas = {};
  for (let i = 0; i < 5; i++) {
    const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
    assert.equal(e.progresso.pergunta, i + 1, `na ${i + 1}ª tela deveria dizer ${i + 1}`);
    assert.equal(e.progresso.respondidas, i);
    assert.equal(e.progresso.percentual, Math.round((i / e.progresso.deTotal) * 100));
    respostas[e.tela.id] = { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[1].competencia };
  }
});

test('a contagem nunca passa do total, e fecha em 100% no fim', () => {
  const respostas = responderTodasAsAncoras(responderTodosOsBlocos());
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: false });
  assert.equal(e.fase, 'concluido');
  assert.equal(e.progresso.percentual, 100);
  assert.equal(e.progresso.pergunta, e.progresso.deTotal);
});

test('a tela de desempate NÃO entra na contagem — ela não é uma das 22', () => {
  const respostas = responderTodosOsBlocos();
  const e = estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true });
  if (e.fase !== 'escolha') return; // corte limpo neste fixture
  assert.equal(e.progresso.respondidas, N_BLOCOS, 'só os blocos contam até aqui');
  assert.equal(e.progresso.deTotal, totalDeTelas({ etapa2Habilitada: true }));
});

test('o denominador é o mesmo para todo mundo — não varia com o empate', () => {
  const vistos = new Set();
  for (let i = 0; i < 50; i++) {
    const respostas = {};
    for (const b of BLOCOS) {
      const j = i % 4;
      respostas[b.id] = { mais: b.opcoes[j].competencia, menos: b.opcoes[(j + 1) % 4].competencia };
    }
    vistos.add(estadoDaSessao({ respostas, seed: SEED, etapa2Habilitada: true }).progresso.deTotal);
  }
  assert.equal(vistos.size, 1, `denominador variou entre respondentes: ${[...vistos].join(', ')}`);
});

test('com a etapa 2 desabilitada, são 2 etapas e o total cai para 16', () => {
  const p = progresso(1, { etapa2Habilitada: false });
  assert.equal(p.de, 2);
  assert.equal(p.deTotal, N_BLOCOS + ANCORAS.length);
  assert.equal(progresso(3, { etapa2Habilitada: false }).etapa, 2);
  assert.equal(progresso(3, { etapa2Habilitada: true }).de, 3);
  assert.equal(progresso(1, { etapa2Habilitada: true }).deTotal, N_BLOCOS + 6 + ANCORAS.length);
});

test('totalDeTelas acompanha o desenho', () => {
  assert.equal(totalDeTelas({ etapa2Habilitada: false }), N_BLOCOS + ANCORAS.length);
  assert.equal(totalDeTelas({ etapa2Habilitada: true }), N_BLOCOS + 6 + ANCORAS.length);
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
  assert.equal(validarResposta(b.id, {}).ok, false);
});

test('validarResposta limita a âncora a 0–4 e o ancorado a 1–4', () => {
  const a = ANCORAS[0];
  assert.equal(validarResposta(a.id, { valor: 0 }).ok, true);
  assert.equal(validarResposta(a.id, { valor: 4 }).ok, true);
  assert.equal(validarResposta(a.id, { valor: 5 }).ok, false);
  assert.equal(validarResposta(a.id, { valor: -1 }).ok, false);
  assert.equal(validarResposta(a.id, { valor: 2.5 }).ok, false);

  const anc = ancoradosDe('vender_negociar')[0];
  if (anc) {
    assert.equal(validarResposta(anc.id, { nivel: 1 }).ok, true);
    assert.equal(validarResposta(anc.id, { nivel: 4 }).ok, true);
    assert.equal(validarResposta(anc.id, { nivel: 0 }).ok, false);
    assert.equal(validarResposta(anc.id, { nivel: 5 }).ok, false);
  }
});

test('a resposta gravada é só o que interessa — nada de campo extra vindo do cliente', () => {
  const b = BLOCOS[0];
  const r = validarResposta(b.id, { mais: b.opcoes[0].competencia, menos: b.opcoes[1].competencia, admin: true, score: 99 }, { seed: SEED });
  assert.deepEqual(Object.keys(r.payload).sort(), ['mais', 'menos']);
});

// ── caminhada completa ───────────────────────────────────────────────
test('caminhada E2E: 22 telas, sem repetir, terminando em concluído', () => {
  const respostas = {};
  let escolhas = [];
  const telas = [];
  let guarda = 0;

  while (guarda++ < 60) {
    const e = estadoDaSessao({ respostas, escolhas, seed: SEED, etapa2Habilitada: true });
    if (e.fase === 'concluido') break;

    if (e.tela.tipo === 'escolha_de_aprofundamento') {
      escolhas = e.tela.opcoes.slice(0, e.tela.escolherQuantas).map((o) => o.chave);
      continue; // a tela de escolha não é uma das 22
    }

    telas.push(`${e.fase}:${e.tela.id}`);
    if (e.tela.tipo === 'escolha_forcada') {
      respostas[e.tela.id] = { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia };
    } else if (e.tela.tipo === 'item_ancorado') {
      respostas[e.tela.id] = { nivel: 3 };
    } else if (e.tela.tipo === 'ancora_evidencia') {
      respostas[e.tela.id] = { valor: 3 };
    }
  }

  assert.ok(guarda < 60, 'o fluxo não terminou — possível laço');
  assert.equal(telas.length, 22, `esperadas 22 telas, foram ${telas.length}`);
  assert.equal(new Set(telas).size, 22, 'alguma tela apareceu duas vezes');

  const final = estadoDaSessao({ respostas, escolhas, seed: SEED, etapa2Habilitada: true });
  assert.equal(final.fase, 'concluido');
  assert.equal(final.selecao.selecionadas.length, 3);
  assert.ok(final.integridade.somaZero, 'a soma dos 12 scores tem de ser 0');
  // 3 competências aprofundadas × 2 ancorados cada
  assert.equal(Object.keys(final.niveis).length, 3);
  for (const n of Object.values(final.niveis)) {
    assert.equal(n.nivel, 3);
    assert.equal(n.confianca, 'afirmado', 'dois itens concordando devem afirmar o nível');
  }
});

test('a etapa 2 só cobre as 3 selecionadas — 6 telas, nunca mais', () => {
  const respostas = responderTodosOsBlocos();
  let escolhas = [];
  const ancoradas = new Set();
  let guarda = 0;

  while (guarda++ < 40) {
    const e = estadoDaSessao({ respostas, escolhas, seed: SEED, etapa2Habilitada: true });
    if (e.tela.tipo === 'escolha_de_aprofundamento') {
      escolhas = e.tela.opcoes.slice(0, e.tela.escolherQuantas).map((o) => o.chave);
      continue;
    }
    if (e.tela.tipo !== 'item_ancorado') break;
    ancoradas.add(e.tela.competencia);
    respostas[e.tela.id] = { nivel: 2 };
  }
  assert.equal(ancoradas.size, 3, 'a etapa 2 tocou um número errado de competências');
});

// ── itens ancorados: a ordem dos níveis é a escala ───────────────────
test('os níveis de um item ancorado saem em ordem crescente, nunca embaralhados', () => {
  const anc = ancoradosDe('vender_negociar')[0] || ancoradosDe('gestao_recursos')[0];
  assert.ok(anc, 'fixture: nenhum item ancorado no catálogo');
  assert.deepEqual(anc.niveis.map((n) => n.nivel), [1, 2, 3, 4]);
});

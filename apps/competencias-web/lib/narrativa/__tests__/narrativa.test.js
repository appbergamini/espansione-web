import test from 'node:test';
import assert from 'node:assert/strict';

import { BLOCOS } from '../../competencias/catalog.js';
import { consolidar } from '../../competencias/score.js';
import { gerarRelatorio, varrerRelatorio } from '../../competencias/relatorio.js';
import { montarBrief, conferirBrief } from '../brief.js';
import { aplicarNarrativa } from '../aplicar.js';
import { ESQUEMA_NARRATIVA, NARRATIVA_VERSAO, MODELO } from '../esquema.js';
import { SISTEMA, mensagem } from '../prompt.js';
import { aproveitavel } from '../repo.js';

let seed = 424242;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function respostasAleatorias() {
  const out = {};
  for (const b of BLOCOS) {
    const i = Math.floor(rnd() * 4);
    let j = Math.floor(rnd() * 3);
    if (j >= i) j++;
    out[b.id] = { mais: b.opcoes[i].competencia, menos: b.opcoes[j].competencia };
  }
  return out;
}

function relatorioAleatorio() {
  const consolidado = consolidar(respostasAleatorias());
  const v = [0, 0, 0, 0].map(() => 10 + Math.floor(rnd() * 80));
  const soma = v.reduce((a, b) => a + b, 0);
  const norm = v.map((x) => Math.round((x / soma) * 200));
  norm[0] += 200 - norm.reduce((a, b) => a + b, 0);
  const [d, i, s, c] = norm;
  const aprofundadas = consolidado.ranking.slice(-3).map((r) => r.chave);
  const niveis = Object.fromEntries(aprofundadas.map((k) => [k, { nivel: 2, confianca: 'afirmado' }]));
  return gerarRelatorio({
    consolidado,
    pilares: {
      determinacao: { natural: d, emContexto: d },
      conexao: { natural: i, emContexto: i },
      constancia: { natural: s, emContexto: s },
      precisao: { natural: c, emContexto: c },
    },
    niveis,
    aprofundadas,
  });
}

/** Narrativa completa e reconhecível, montada a partir do relatório real. */
function narrativaFalsa(relatorio) {
  const bloco = (id) => relatorio.blocos.find((b) => b.id === id);
  return {
    abertura: 'IA:abertura',
    fechamento: 'IA:fechamento',
    onde_voce_esta: { titulo: 'IA:t1', texto: 'IA:onde' },
    suas_competencias: { titulo: 'IA:t2', texto: 'IA:competencias' },
    jeito_de_trabalhar: {
      titulo: 'IA:t2b',
      texto: 'IA:jeito',
      pilares: bloco('jeito_de_trabalhar').pilares.map((p) => ({ pilar: p.nome, texto: `IA:pilar-jeito:${p.pilar}` })),
    },
    por_que: {
      titulo: 'IA:t3',
      texto: 'IA:porque',
      padraoRecorrente: 'IA:padrao',
      leituras: bloco('por_que').leituras.map((l) => ({ chave: l.chave, texto: `IA:leitura:${l.chave}` })),
    },
    sustenta_custa: {
      titulo: 'IA:t4',
      texto: 'IA:sustenta',
      leituras: bloco('sustenta_custa').leituras.map((l) => ({
        pilar: { determinacao: 'Determinação', conexao: 'Conexão', constancia: 'Constância', precisao: 'Precisão' }[l.pilar],
        texto: `IA:pilar:${l.pilar}`,
      })),
    },
    trilha: {
      titulo: 'IA:t5',
      introducao: 'IA:trilha-intro',
      itens: bloco('trilha').itens.map((i) => ({ chave: i.chave, texto: `IA:trilha:${i.chave}` })),
    },
    passo_7_dias: { titulo: 'IA:t6', texto: 'IA:passo' },
    convite: { titulo: 'IA:t7', texto: 'IA:convite' },
  };
}

/**
 * Remove TODO campo em que a IA pode escrever. O que sobra é a estrutura —
 * e a estrutura tem de sair idêntica dos dois lados. É o teste que sustenta
 * a afirmação "a IA não consegue deslocar um resultado".
 */
const CAMPOS_DE_TEXTO = new Set(['titulo', 'texto', 'introducao']);
function soEstrutura(no) {
  if (Array.isArray(no)) return no.map(soEstrutura);
  if (no && typeof no === 'object') {
    return Object.fromEntries(
      Object.entries(no).filter(([k]) => !CAMPOS_DE_TEXTO.has(k)).map(([k, v]) => [k, soEstrutura(v)])
    );
  }
  return no;
}

// ── o invariante ─────────────────────────────────────────────────────
test('a narrativa não altera nenhum resultado — só o texto', () => {
  for (let n = 0; n < 60; n++) {
    const rel = relatorioAleatorio();
    const com = aplicarNarrativa(rel, narrativaFalsa(rel));
    assert.deepEqual(
      soEstrutura(com.blocos),
      soEstrutura(rel.blocos),
      'a narrativa mexeu em posição, nível, ordem, rota ou chave'
    );
  }
});

test('sem narrativa, o relatório sai igual ao do motor', () => {
  const rel = relatorioAleatorio();
  const sem = aplicarNarrativa(rel, null);
  assert.deepEqual(sem.blocos, rel.blocos);
  assert.equal(sem.temNarrativa, false);
  assert.equal(sem.abertura, null);
});

test('narrativa inútil (undefined, string, array) degrada para o motor', () => {
  const rel = relatorioAleatorio();
  for (const lixo of [undefined, 'texto solto', 42, []]) {
    const r = aplicarNarrativa(rel, lixo);
    // Array vazio é objeto: passa, mas nenhum bloco casa e tudo cai no motor.
    assert.deepEqual(r.blocos.map((b) => b.titulo), rel.blocos.map((b) => b.titulo));
  }
});

// ── troca de texto ───────────────────────────────────────────────────
test('o texto da IA entra em todos os blocos', () => {
  const rel = relatorioAleatorio();
  const com = aplicarNarrativa(rel, narrativaFalsa(rel));
  const b = (id) => com.blocos.find((x) => x.id === id);

  assert.equal(com.abertura, 'IA:abertura');
  assert.equal(com.fechamento, 'IA:fechamento');
  assert.equal(b('onde_voce_esta').texto, 'IA:onde');
  assert.equal(b('suas_competencias').texto, 'IA:competencias');
  assert.equal(b('jeito_de_trabalhar').texto, 'IA:jeito');
  assert.equal(b('por_que').texto, 'IA:porque');
  assert.equal(b('sustenta_custa').texto, 'IA:sustenta');
  assert.equal(b('trilha').introducao, 'IA:trilha-intro');
  assert.equal(b('convite').texto, 'IA:convite');
  if (b('passo_7_dias').competencia) assert.equal(b('passo_7_dias').texto, 'IA:passo');

  for (const p of b('jeito_de_trabalhar').pilares) assert.equal(p.texto, `IA:pilar-jeito:${p.pilar}`);
  for (const l of b('por_que').leituras) assert.equal(l.texto, `IA:leitura:${l.chave}`);
  for (const l of b('sustenta_custa').leituras) assert.equal(l.texto, `IA:pilar:${l.pilar}`);
  for (const i of b('trilha').itens) assert.equal(i.texto, `IA:trilha:${i.chave}`);
});

test('a régua dos pilares é intocável pela narrativa', () => {
  for (let n = 0; n < 40; n++) {
    const rel = relatorioAleatorio();
    const motor = rel.blocos.find((b) => b.id === 'jeito_de_trabalhar');
    const com = aplicarNarrativa(rel, narrativaFalsa(rel)).blocos.find((b) => b.id === 'jeito_de_trabalhar');

    assert.equal(com.equilibrio, motor.equilibrio);
    for (const [i, p] of com.pilares.entries()) {
      const m = motor.pilares[i];
      assert.equal(p.pilar, m.pilar, 'a ordem dos pilares mudou');
      assert.equal(p.natural, m.natural);
      assert.equal(p.emContexto, m.emContexto);
      assert.equal(p.direcao, m.direcao);
      assert.equal(p.distante, m.distante);
      assert.equal(p.descricao, m.descricao, 'a linha de verbos é do produto, não da IA');
      // Geometria válida: as marcas ficam dentro do eixo.
      for (const v of [p.natural, p.emContexto]) assert.ok(v >= 0 && v <= 100, `marca fora do eixo: ${v}`);
    }
  }
});

test('os 4 pilares vêm ordenados do que mais define ao que menos aparece', () => {
  const rel = relatorioAleatorio();
  const b = rel.blocos.find((x) => x.id === 'jeito_de_trabalhar');
  assert.equal(b.pilares.length, 4);
  assert.deepEqual(b.pilares.map((p) => p.ordem), [1, 2, 3, 4]);
  for (let i = 1; i < b.pilares.length; i++) {
    assert.ok(b.pilares[i - 1].natural >= b.pilares[i].natural, 'a ordem não é decrescente');
  }
});

test('o relatório NÃO lista as 16 características — é a proibição do módulo', async () => {
  const { LEXICO_PILAR } = await import('@espansione/cis');
  const todas = Object.values(LEXICO_PILAR).flat();
  for (let n = 0; n < 30; n++) {
    const texto = JSON.stringify(relatorioAleatorio().blocos.find((b) => b.id === 'jeito_de_trabalhar'));
    const apareceram = todas.filter((c) => texto.includes(c));
    assert.deepEqual(apareceram, [], `o bloco dos pilares vazou característica: ${apareceram.join(', ')}`);
  }
});

test('texto vazio ou só espaço cai no motor, não apaga o bloco', () => {
  const rel = relatorioAleatorio();
  const original = rel.blocos.find((b) => b.id === 'convite').texto;
  const com = aplicarNarrativa(rel, { convite: { titulo: '   ', texto: '' } });
  const convite = com.blocos.find((b) => b.id === 'convite');
  assert.equal(convite.texto, original);
  assert.equal(convite.titulo, 'O próximo passo');
});

test('item com chave desconhecida é ignorado; item não citado mantém o texto do motor', () => {
  const rel = relatorioAleatorio();
  const porqueMotor = rel.blocos.find((b) => b.id === 'por_que');
  if (porqueMotor.leituras.length === 0) return;

  const com = aplicarNarrativa(rel, {
    por_que: { leituras: [{ chave: 'competencia_que_nao_existe', texto: 'IA:intrusa' }] },
  });
  const porque = com.blocos.find((b) => b.id === 'por_que');

  assert.equal(porque.leituras.length, porqueMotor.leituras.length, 'a IA não pode acrescentar leitura');
  for (const [i, l] of porque.leituras.entries()) {
    assert.equal(l.texto, porqueMotor.leituras[i].texto, 'leitura não citada devia ficar com o motor');
  }
  assert.equal(JSON.stringify(com.blocos).includes('IA:intrusa'), false);
});

test('padrão recorrente inventado pela IA é descartado quando o motor não achou nenhum', () => {
  // Perfil chapado: nenhum pilar fora de faixa, logo nenhum padrão.
  const consolidado = consolidar(respostasAleatorias());
  const rel = gerarRelatorio({
    consolidado,
    pilares: Object.fromEntries(
      ['determinacao', 'conexao', 'constancia', 'precisao'].map((p) => [p, { natural: 50, emContexto: 50 }])
    ),
    niveis: {},
    aprofundadas: [],
  });
  const motor = rel.blocos.find((b) => b.id === 'por_que');
  if (motor.padraoRecorrente) return; // este perfil por acaso tem padrão

  const com = aplicarNarrativa(rel, { por_que: { padraoRecorrente: 'IA:padrao inventado' } });
  assert.equal(com.blocos.find((b) => b.id === 'por_que').padraoRecorrente, null);
  assert.equal(JSON.stringify(com.blocos).includes('IA:padrao inventado'), false);
});

// ── o brief ──────────────────────────────────────────────────────────
test('o brief não carrega score, distância, valor de pilar nem gap', () => {
  for (let n = 0; n < 40; n++) {
    const brief = montarBrief(relatorioAleatorio());
    const texto = JSON.stringify(brief);
    // CHAVE, não palavra: "o seu jeito natural" é prosa legítima do motor;
    // `"natural": 63` é o objeto de pilar vazando. Só o segundo é bug.
    for (const chave of ['score', 'distancia', 'natural', 'emContexto', 'faixas', 'sinalizado', 'porPilar', 'valor']) {
      assert.equal(texto.includes(`"${chave}":`), false, `a chave "${chave}" vazou para o brief`);
    }
    assert.equal(/percentil/i.test(texto), false);
    // Nenhum número solto de dois ou três dígitos além de `ordem` (1..3).
    for (const m of texto.matchAll(/:\s*(\d+)/g)) {
      assert.ok(Number(m[1]) <= 12, `número suspeito no brief: ${m[1]}`);
    }
    assert.equal(conferirBrief(brief).limpo, true);
  }
});

test('conferirBrief pega um score plantado', () => {
  const brief = montarBrief(relatorioAleatorio());
  brief.debug = { score: 87 };
  assert.equal(conferirBrief(brief).limpo, false);
});

test('o brief tem uma entrada por item que a IA precisa escrever', () => {
  const rel = relatorioAleatorio();
  const brief = montarBrief(rel);
  const bloco = (id) => rel.blocos.find((b) => b.id === id);

  assert.equal(brief.competencias.length, 12);
  assert.equal(brief.capacidades.length, 4);
  assert.equal(brief.fragilidades.length, bloco('por_que').leituras.length);
  assert.equal(brief.trilha.itens.length, bloco('trilha').itens.length);
  assert.equal(brief.energia.pilares.length, bloco('sustenta_custa').leituras.length);
  // Nível pelo NOME, nunca pelo número.
  for (const c of brief.competencias) assert.notEqual(typeof c.nivel, 'number');
});

// ── a guarda de saída ────────────────────────────────────────────────
test('a varredura enxerga abertura e fechamento', () => {
  const rel = relatorioAleatorio();
  const limpo = aplicarNarrativa(rel, { abertura: 'Você tem um retrato do seu momento.' });
  assert.equal(varrerRelatorio(limpo).limpo, true);

  for (const campo of ['abertura', 'fechamento']) {
    const sujo = aplicarNarrativa(rel, { [campo]: 'Aqui você aparece fraco na leitura.' });
    const v = varrerRelatorio(sujo);
    assert.equal(v.limpo, false, `termo proibido passou por ${campo}`);
    assert.match(v.achados.join(' '), /fraco/i);
  }
});

test('a varredura pega número exposto vindo da IA', () => {
  const rel = relatorioAleatorio();
  const sujo = aplicarNarrativa(rel, { convite: { texto: 'Você ficou 32 pontos acima da faixa.' } });
  assert.equal(varrerRelatorio(sujo).limpo, false);
});

// ── contrato com a API ───────────────────────────────────────────────
test('todo objeto do esquema fecha additionalProperties e exige as chaves', () => {
  (function anda(no, caminho) {
    if (!no || typeof no !== 'object') return;
    if (no.type === 'object') {
      assert.equal(no.additionalProperties, false, `${caminho} deixou additionalProperties aberto`);
      assert.deepEqual(
        [...(no.required || [])].sort(),
        Object.keys(no.properties).sort(),
        `${caminho} não exige todas as propriedades`
      );
    }
    // Restrições que a API de saída estruturada não aceita.
    for (const proibida of ['minLength', 'maxLength', 'minItems', 'maxItems', 'minimum', 'maximum']) {
      assert.equal(proibida in no, false, `${caminho} usa ${proibida}, que não é suportado`);
    }
    for (const [k, v] of Object.entries(no)) anda(v, `${caminho}.${k}`);
  })(ESQUEMA_NARRATIVA, 'raiz');
});

test('o esquema cobre exatamente os blocos do motor, mais abertura e fechamento', () => {
  const rel = relatorioAleatorio();
  const doEsquema = new Set(Object.keys(ESQUEMA_NARRATIVA.properties));
  for (const b of rel.blocos) {
    assert.ok(doEsquema.has(b.id), `o esquema não tem lugar para o bloco "${b.id}"`);
  }
  assert.ok(doEsquema.has('abertura') && doEsquema.has('fechamento'));
});

test('o prompt carrega as proibições que a varredura cobra', () => {
  for (const termo of ['deficiente', 'fraco', 'ruim', 'percentil', 'aderência', 'DISC']) {
    assert.match(SISTEMA, new RegExp(termo, 'i'), `o prompt não proíbe "${termo}"`);
  }
  // Nunca falar de "CIS" nem chamar as 16 de competências.
  assert.equal(/\bCIS\b/.test(SISTEMA), false);
  assert.match(SISTEMA, /características/);
});

test('a mensagem leva os fatos e nenhum score', () => {
  const brief = montarBrief(relatorioAleatorio());
  const m = mensagem(brief);
  assert.match(m, /<fatos>/);
  assert.equal(/\bscore\b/i.test(m), false);
});

test('o cache só é aproveitado na versão de prompt que está no ar', () => {
  const ok = { narrativa_status: 'ok', narrativa: { abertura: 'x' }, narrativa_versao: NARRATIVA_VERSAO };
  assert.equal(aproveitavel(ok, NARRATIVA_VERSAO), true);
  assert.equal(aproveitavel({ ...ok, narrativa_versao: 'v0-antiga' }, NARRATIVA_VERSAO), false);
  assert.equal(aproveitavel({ ...ok, narrativa_status: 'gerando' }, NARRATIVA_VERSAO), false);
  assert.equal(aproveitavel({ ...ok, narrativa: null }, NARRATIVA_VERSAO), false);
  assert.equal(aproveitavel(null, NARRATIVA_VERSAO), false);
});

test('o modelo é o do topo da linha, sem sufixo de data', () => {
  assert.equal(MODELO, 'claude-opus-5');
});

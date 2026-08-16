import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CAPACIDADES, PILARES, CHAVES, COMPETENCIAS, BLOCOS, BANCO_ITENS, ANCORAS, ANCORADOS,
  FAIXAS, LEITURA_FAIXA, N_BLOCOS, K_APARICOES, SEM_ANCORA,
  capacidadeDe, competenciasDaCapacidade, faixaDe, leituraDe,
  ordemDoBloco, temAncoradosCompletos, ETAPA2_DISPONIVEL,
} from '../catalog.js';

import {
  pontuarEscolhaForcada, posicaoRelativa, ranquear, selecionarAprofundamento,
  nivelAfirmado, consolidar, POSICOES,
} from '../score.js';

import {
  TOLERANCIA_PADRAO, distanciaDaBorda, posicaoNaFaixa, avaliarCompetencia,
  avaliarTodas, rotaDaTrilha, indiceAjuste, viabilidadeDeTodas, ROTAS,
} from '../faixas.js';

// ── utilidades ───────────────────────────────────────────────────────
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

const pilaresDe = (d, i, s, c) => ({
  determinacao: { natural: d, emContexto: d },
  conexao: { natural: i, emContexto: i },
  constancia: { natural: s, emContexto: s },
  precisao: { natural: c, emContexto: c },
});

// ── catálogo ─────────────────────────────────────────────────────────
test('catálogo: 12 competências, 3 por capacidade', () => {
  assert.equal(COMPETENCIAS.length, 12);
  assert.equal(CHAVES.length, 12);
  assert.equal(new Set(CHAVES).size, 12);
  for (const cap of CAPACIDADES) assert.equal(competenciasDaCapacidade(cap).length, 3);
});

test('desenho BALANCEADO — toda competência aparece K vezes, sem presumir K', () => {
  const conta = Object.fromEntries(CHAVES.map((c) => [c, 0]));
  for (const b of BLOCOS) for (const o of b.opcoes) conta[o.competencia]++;
  const distintos = [...new Set(Object.values(conta))];
  assert.equal(distintos.length, 1, `desbalanceado: ${JSON.stringify(conta)}`);
  assert.equal(distintos[0], K_APARICOES);
  assert.equal(N_BLOCOS * 4, CHAVES.length * K_APARICOES, 'aritmética do desenho não fecha');
});

test('nenhum bloco repete capacidade nem competência', () => {
  for (const b of BLOCOS) {
    assert.equal(b.opcoes.length, 4, `${b.id} não tem 4 opções`);
    assert.equal(new Set(b.opcoes.map((o) => o.capacidade)).size, 4, `${b.id} repete capacidade`);
    assert.equal(new Set(b.opcoes.map((o) => o.competencia)).size, 4, `${b.id} repete competência`);
  }
});

test('banco tem uma afirmação por aparição, e toda opção de bloco existe no banco', () => {
  assert.equal(BANCO_ITENS.length, CHAVES.length * K_APARICOES);
  const doBanco = new Set(BANCO_ITENS.map((i) => i.afirmacao));
  for (const b of BLOCOS) {
    for (const o of b.opcoes) assert.ok(doBanco.has(o.afirmacao), `afirmação de ${b.id}/${o.opcao} não está no banco`);
  }
});

test('âncoras: 4 perguntas, 5 opções (0 a 4), cobrindo 8 das 12', () => {
  assert.equal(ANCORAS.length, 4);
  for (const a of ANCORAS) {
    assert.equal(a.opcoes.length, 5, `${a.id} não tem 5 opções`);
    assert.deepEqual(a.opcoes.map((o) => o.valor), [0, 1, 2, 3, 4]);
    for (const c of a.verifica) assert.ok(CHAVES.includes(c), `${a.id} verifica chave inválida ${c}`);
  }
  // as 4 sem cobertura factual — é por isso que âncora não serve de desempate
  assert.deepEqual([...SEM_ANCORA].sort(), [
    'coerencia_etica', 'comunicar_posicionar', 'formular_valor', 'persistir_ajustar',
  ]);
});

test('etapa 2 disponível: 2 itens ancorados por competência', () => {
  assert.equal(ANCORADOS.length, 24);
  for (const c of CHAVES) {
    assert.ok(temAncoradosCompletos(c), `${c} não tem os 2 ancorados`);
  }
  assert.equal(ETAPA2_DISPONIVEL, true);
});

test('todo item ancorado tem 4 níveis em ordem crescente e id único', () => {
  const ids = new Set();
  for (const a of ANCORADOS) {
    assert.deepEqual(a.niveis.map((n) => n.nivel), [1, 2, 3, 4], `${a.id} fora de ordem`);
    assert.equal(new Set(a.niveis.map((n) => n.texto)).size, 4, `${a.id} tem nível repetido`);
    assert.ok(!ids.has(a.id), `id repetido: ${a.id}`);
    ids.add(a.id);
    assert.ok(CHAVES.includes(a.competencia));
  }
});

test('REGRAS DE ESCRITA: situação ≤15 palavras, opção ≤18, sem a palavra que nomeia', async () => {
  const { COMPETENCIAS: comps } = await import('../catalog.js');
  const nomeDaChave = Object.fromEntries(comps.map((c) => [c.chave, c.nome]));
  const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const conta = (s) => s.split(/\s+/).filter(Boolean).length;
  const irrelevantes = new Set(['e', 'de', 'do', 'da', 'sob', 'para', 'com', 'sua', 'seu']);

  for (const a of ANCORADOS) {
    assert.ok(conta(a.situacao) <= 15, `${a.id}: situação com ${conta(a.situacao)} palavras`);
    const proibidas = semAcento(nomeDaChave[a.competencia])
      .split(/[^a-z0-9]+/).filter((p) => p.length >= 4 && !irrelevantes.has(p));
    for (const n of a.niveis) {
      assert.ok(conta(n.texto) <= 18, `${a.id} nível ${n.nivel}: ${conta(n.texto)} palavras`);
      const corpo = semAcento(n.texto).split(/[^a-z0-9]+/);
      for (const p of proibidas) {
        assert.ok(!corpo.includes(p), `${a.id} nível ${n.nivel} contém "${p}", que nomeia a competência`);
      }
    }
  }
});

test('o catálogo declara quantos ancorados ainda são rascunho — não esconder isso', async () => {
  const { ANCORADOS_EM_RASCUNHO, SEM_ANCORADOS_COMPLETOS } = await import('../catalog.generated.js');
  assert.deepEqual(SEM_ANCORADOS_COMPLETOS, []);
  assert.ok(ANCORADOS_EM_RASCUNHO > 0,
    'se chegou a zero, os itens foram calibrados — confirmar antes de afirmar nível como validado');
  assert.equal(ANCORADOS.filter((a) => a.rascunho).length, ANCORADOS_EM_RASCUNHO);
});

test('ordemDoBloco é permutação e é reproduzível pela seed', () => {
  for (const b of BLOCOS.slice(0, 4)) {
    const a1 = ordemDoBloco(b.id, 'seed-abc');
    const a2 = ordemDoBloco(b.id, 'seed-abc');
    assert.deepEqual(a1, a2, 'mesma seed deve dar a mesma ordem');
    assert.deepEqual([...a1].sort(), [0, 1, 2, 3], 'não é permutação de 4');
  }
  const variou = BLOCOS.some((b) => JSON.stringify(ordemDoBloco(b.id, 'A')) !== JSON.stringify(ordemDoBloco(b.id, 'B')));
  assert.ok(variou, 'seeds diferentes deveriam produzir ordens diferentes');
});

// ── pontuação ────────────────────────────────────────────────────────
test('CHECAGEM DE INTEGRIDADE: a soma dos 12 scores é sempre 0', () => {
  for (let i = 0; i < 2000; i++) {
    const { scores, integridade } = pontuarEscolhaForcada(respostasAleatorias());
    assert.equal(Object.values(scores).reduce((a, b) => a + b, 0), 0);
    assert.ok(integridade.somaZero);
    assert.ok(integridade.valido, integridade.problemas.join('; '));
    assert.ok(integridade.completo);
  }
});

test('score de cada competência fica dentro de ±K', () => {
  for (let i = 0; i < 500; i++) {
    const { scores } = pontuarEscolhaForcada(respostasAleatorias());
    for (const [c, v] of Object.entries(scores)) {
      assert.ok(v >= -K_APARICOES && v <= K_APARICOES, `${c} = ${v} fora de ±${K_APARICOES}`);
    }
  }
});

test('soma das capacidades também fecha em 0', () => {
  const { porCapacidade } = pontuarEscolhaForcada(respostasAleatorias());
  assert.equal(Object.values(porCapacidade).reduce((a, b) => a + b, 0), 0);
});

test('integridade acusa resposta inválida', () => {
  const b = BLOCOS[0];
  const foraDoBloco = CHAVES.find((c) => !b.opcoes.some((o) => o.competencia === c));
  const r1 = pontuarEscolhaForcada({ [b.id]: { mais: foraDoBloco, menos: b.opcoes[1].competencia } });
  assert.equal(r1.integridade.valido, false);
  assert.match(r1.integridade.problemas[0], /não é opção deste bloco/);

  const r2 = pontuarEscolhaForcada({ [b.id]: { mais: b.opcoes[0].competencia, menos: b.opcoes[0].competencia } });
  assert.equal(r2.integridade.valido, false);
  assert.match(r2.integridade.problemas.join(' '), /mesma opção/);
});

test('resposta parcial não é marcada como completa', () => {
  const parcial = { [BLOCOS[0].id]: { mais: BLOCOS[0].opcoes[0].competencia, menos: BLOCOS[0].opcoes[1].competencia } };
  const { integridade } = pontuarEscolhaForcada(parcial);
  assert.equal(integridade.completo, false);
  assert.equal(integridade.blocosRespondidos, 1);
  assert.equal(integridade.blocosEsperados, N_BLOCOS);
});

// ── escala de 5 posições ─────────────────────────────────────────────
test('posicaoRelativa é simétrica, cobre as 5 posições e acompanha K', () => {
  for (const k of [4, 5, 6, 8]) {
    const limiar = Math.ceil(k / 2);
    assert.equal(posicaoRelativa(k, k), 'mais_forte');
    assert.equal(posicaoRelativa(limiar, k), 'mais_forte');
    assert.equal(posicaoRelativa(limiar - 1, k), 'forte');
    assert.equal(posicaoRelativa(0, k), 'intermediaria');
    assert.equal(posicaoRelativa(-(limiar - 1), k), 'fragil');
    assert.equal(posicaoRelativa(-limiar, k), 'mais_fragil');
    assert.equal(posicaoRelativa(-k, k), 'mais_fragil');
  }
});

test('score igual sempre dá posição igual', () => {
  const { scores } = pontuarEscolhaForcada(respostasAleatorias());
  const porScore = new Map();
  for (const [c, v] of Object.entries(scores)) {
    const p = posicaoRelativa(v);
    if (porScore.has(v)) assert.equal(porScore.get(v), p, `score ${v} caiu em posições diferentes`);
    else porScore.set(v, p);
    assert.ok(POSICOES.includes(p));
  }
});

// ── ramificação ──────────────────────────────────────────────────────
test('selecionarAprofundamento devolve 3 quando o corte é limpo', () => {
  const scores = Object.fromEntries(CHAVES.map((c, i) => [c, i - 6]));
  const porCapacidade = Object.fromEntries(CAPACIDADES.map((c) => [c, 0]));
  const sel = selecionarAprofundamento(scores, porCapacidade);
  assert.equal(sel.criterio, 'por_score');
  assert.equal(sel.selecionadas.length, 3);
  assert.equal(sel.ampliadoPorEmpate, false);
});

test('empate no corte aprofunda TODAS as empatadas — ninguém escolhe', () => {
  // 5 competências no fundo com o mesmo score: o corte não separa.
  const scores = Object.fromEntries(CHAVES.map((c, i) => [c, i < 5 ? -2 : 1]));
  const porCapacidade = Object.fromEntries(CAPACIDADES.map((c) => [c, 0]));
  const sel = selecionarAprofundamento(scores, porCapacidade);
  assert.equal(sel.criterio, 'ampliado_por_empate');
  assert.equal(sel.selecionadas.length, 5, 'as 5 empatadas entram');
  assert.equal(sel.ampliadoPorEmpate, true);
  assert.equal(sel.escolher, undefined, 'não existe mais conjunto para escolher');
});

test('empate parcial: entram as abaixo do corte E as empatadas nele', () => {
  const scores = {};
  CHAVES.forEach((c, i) => { scores[c] = i === 0 ? -4 : i < 4 ? -2 : 2; });
  const porCapacidade = Object.fromEntries(CAPACIDADES.map((c) => [c, 0]));
  const sel = selecionarAprofundamento(scores, porCapacidade);
  assert.equal(sel.criterio, 'ampliado_por_empate');
  assert.equal(sel.selecionadas.length, 4, '1 abaixo + 3 empatadas no corte');
});

test('a seleção nunca repete competência, e nunca fica abaixo de 3', () => {
  for (let i = 0; i < 500; i++) {
    const { scores, porCapacidade } = pontuarEscolhaForcada(respostasAleatorias());
    const sel = selecionarAprofundamento(scores, porCapacidade);
    assert.equal(new Set(sel.selecionadas).size, sel.selecionadas.length);
    assert.ok(sel.selecionadas.length >= 3, `só ${sel.selecionadas.length} selecionadas`);
    // toda selecionada tem score <= o do corte
    for (const c of sel.selecionadas) assert.ok(scores[c] <= sel.scoreCorte);
    // e nenhuma de fora tem score menor que o corte
    for (const c of CHAVES.filter((x) => !sel.selecionadas.includes(x))) {
      assert.ok(scores[c] > sel.scoreCorte, `${c} ficou de fora com score ${scores[c]} <= corte ${sel.scoreCorte}`);
    }
  }
});

test('ranquear ordena do mais forte ao mais frágil e é determinístico', () => {
  const { scores, porCapacidade } = pontuarEscolhaForcada(respostasAleatorias());
  const r1 = ranquear(scores, porCapacidade);
  const r2 = ranquear(scores, porCapacidade);
  assert.deepEqual(r1.map((x) => x.chave), r2.map((x) => x.chave));
  for (let i = 1; i < r1.length; i++) assert.ok(r1[i - 1].score >= r1[i].score);
});

// ── nível afirmado ───────────────────────────────────────────────────
test('nivelAfirmado: concordância e adjacência afirmam; distância estima', () => {
  assert.deepEqual(nivelAfirmado([3, 3]), { nivel: 3, confianca: 'afirmado' });
  assert.deepEqual(nivelAfirmado([2, 3]), { nivel: 3, confianca: 'afirmado' });
  assert.deepEqual(nivelAfirmado([4, 3]), { nivel: 4, confianca: 'afirmado' });
  assert.deepEqual(nivelAfirmado([1, 4]), { nivel: 3, confianca: 'estimado' });
  assert.deepEqual(nivelAfirmado([1, 3]), { nivel: 2, confianca: 'estimado' });
  assert.deepEqual(nivelAfirmado([2]), { nivel: 2, confianca: 'estimado' });
  assert.deepEqual(nivelAfirmado([]), { nivel: null, confianca: null });
});

// ── faixas ───────────────────────────────────────────────────────────
test('REGRA DE VIABILIDADE: as 12 faixas somam entre 185 e 215', () => {
  const todas = viabilidadeDeTodas();
  assert.equal(todas.length, 12);
  for (const v of todas) {
    assert.ok(v.viavel, `${v.competencia}: soma dos pontos médios ${v.soma} fora de 185–215`);
  }
});

test('no máximo dois pilares com faixa alta na mesma competência', () => {
  for (const f of FAIXAS) {
    const altos = PILARES.filter((p) => (f.faixas[p].minimo + f.faixas[p].maximo) / 2 >= 60);
    assert.ok(altos.length <= 2, `${f.competencia} tem ${altos.length} pilares altos: ${altos.join(', ')}`);
  }
});

test('toda competência tem faixa e leitura, e o pilar crítico é válido', () => {
  for (const c of CHAVES) {
    const f = faixaDe(c);
    const l = leituraDe(c);
    assert.ok(f, `${c} sem faixa`);
    assert.ok(l, `${c} sem leitura`);
    assert.ok(PILARES.includes(l.pilarCritico), `${c}: pilar crítico inválido`);
    for (const p of PILARES) assert.ok(f.faixas[p].minimo < f.faixas[p].maximo);
    for (const campo of ['abaixo', 'dentro', 'acima']) assert.ok(l[campo].length > 0, `${c}.${campo} vazio`);
  }
  assert.equal(FAIXAS.length, 12);
  assert.equal(LEITURA_FAIXA.length, 12);
});

test('distanciaDaBorda e posicaoNaFaixa concordam', () => {
  const f = { minimo: 40, maximo: 70 };
  assert.equal(posicaoNaFaixa(30, f), 'abaixo');
  assert.equal(distanciaDaBorda(30, f), 10);
  assert.equal(posicaoNaFaixa(55, f), 'dentro');
  assert.equal(distanciaDaBorda(55, f), 0);
  assert.equal(posicaoNaFaixa(85, f), 'acima');
  assert.equal(distanciaDaBorda(85, f), 15);
  assert.equal(distanciaDaBorda(40, f), 0);
  assert.equal(distanciaDaBorda(70, f), 0);
});

test('a tolerância δ evita sinalizar quem passou da borda por pouco', () => {
  const chave = 'gestao_recursos'; // faixas D 15–50, I 20–55, S 40–80, C 50–90
  const quaseDentro = pilaresDe(55, 40, 60, 45); // D +5, C -5: fora, mas por pouco
  assert.equal(avaliarCompetencia(chave, quaseDentro, 0).sinalizados.length, 2);
  assert.equal(avaliarCompetencia(chave, quaseDentro, 10).sinalizados.length, 0);
});

test('δ maior faz a rota técnica disparar mais — é o efeito que justifica o parâmetro', () => {
  const perfis = Array.from({ length: 400 }, () => {
    const v = [0, 0, 0, 0].map(() => 10 + Math.floor(rnd() * 80));
    const soma = v.reduce((a, b) => a + b, 0);
    const norm = v.map((x) => Math.round((x / soma) * 200));
    norm[0] += 200 - norm.reduce((a, b) => a + b, 0);
    return pilaresDe(...norm);
  });
  const taxa = (delta) => {
    let n = 0;
    for (const p of perfis) for (const a of avaliarTodas(p, delta)) if (a.sinalizados.length === 0) n++;
    return n / (perfis.length * 12);
  };
  const t0 = taxa(0);
  const t10 = taxa(10);
  assert.ok(t10 > t0, `δ=10 deveria disparar mais técnica que δ=0 (${t10} vs ${t0})`);
  assert.ok(t0 < 0.25, `com δ=0 a válvula de honestidade quase não abre — obtido ${t0}`);
});

// ── rotas ────────────────────────────────────────────────────────────
test('Confiança BAIXA curto-circuita, mesmo com pilar fora da faixa', () => {
  // coerencia_etica é a única marcada BAIXA na v5
  const f = faixaDe('coerencia_etica');
  assert.equal(f.confianca, 'BAIXA');
  const bemFora = pilaresDe(95, 10, 10, 85);
  const av = avaliarCompetencia('coerencia_etica', bemFora);
  assert.ok(av.sinalizados.length > 0, 'fixture deveria ter pilar fora');
  assert.equal(rotaDaTrilha(av).rota, 'confianca_baixa');
});

test('nenhum pilar sinalizado → rota técnica, e não se inventa achado', () => {
  const f = faixaDe('gestao_recursos');
  const dentro = pilaresDe(
    Math.round((f.faixas.determinacao.minimo + f.faixas.determinacao.maximo) / 2),
    Math.round((f.faixas.conexao.minimo + f.faixas.conexao.maximo) / 2),
    Math.round((f.faixas.constancia.minimo + f.faixas.constancia.maximo) / 2),
    Math.round((f.faixas.precisao.minimo + f.faixas.precisao.maximo) / 2)
  );
  const r = rotaDaTrilha(avaliarCompetencia('gestao_recursos', dentro));
  assert.equal(r.rota, 'tecnica');
  assert.equal(r.pilarAlvo, null);
});

test('excesso tem prioridade sobre falta', () => {
  // iniciativa: D 55–95, I 35–75, S 20–55, C 10–45
  const comExcesso = pilaresDe(70, 50, 15, 65); // S abaixo (-5? não) e C acima
  const av = avaliarCompetencia('iniciativa_experimentacao', comExcesso, 0);
  assert.ok(av.acima.length > 0 && av.abaixo.length > 0, 'fixture precisa ter os dois lados');
  const r = rotaDaTrilha(av);
  assert.equal(r.rota, 'regular');
  assert.ok(av.acima.includes(r.pilarAlvo));
});

test('só falta → desenvolver; e compensar é decisão externa', () => {
  const f = faixaDe('vender_negociar'); // D 45–85, I 50–90, S 10–45, C 25–60
  const soFalta = pilaresDe(20, 55, 40, 85);
  const av = avaliarCompetencia('vender_negociar', soFalta, 0);
  const r = rotaDaTrilha(av);
  assert.ok(ROTAS.includes(r.rota));
  const rc = rotaDaTrilha(av, { compensavel: true });
  assert.equal(rc.rota, 'compensar');
});

// ── Índice de Ajuste ─────────────────────────────────────────────────
test('Índice de Ajuste fica em 0–100 e nunca chega a 100', () => {
  for (let i = 0; i < 200; i++) {
    const v = [0, 0, 0, 0].map(() => 10 + Math.floor(rnd() * 80));
    const soma = v.reduce((a, b) => a + b, 0);
    const norm = v.map((x) => Math.round((x / soma) * 200));
    norm[0] += 200 - norm.reduce((a, b) => a + b, 0);
    const idx = indiceAjuste(pilaresDe(...norm));
    assert.ok(idx.valor >= 0 && idx.valor <= 100);
    assert.ok(idx.valor < 100, 'estar dentro das 48 é impossível por construção');
    assert.equal(idx.total, 48);
  }
});

// ── consolidação ─────────────────────────────────────────────────────
test('consolidar entrega ranking e capacidades coerentes', () => {
  const c = consolidar(respostasAleatorias());
  assert.equal(c.ranking.length, 12);
  assert.equal(c.capacidades.length, 4);
  for (const cap of c.capacidades) {
    assert.equal(cap.competencias.length, 3);
    assert.equal(cap.competencias.reduce((a, x) => a + x.score, 0), cap.score);
  }
  assert.ok(c.integridade.somaZero);
});

test('metadados de versão viajam junto — sem eles não há como reproduzir', async () => {
  const { CATALOGO_VERSAO, FAIXAS_VERSAO } = await import('../catalog.js');
  const { METADADOS } = await import('../faixas.js');
  assert.ok(CATALOGO_VERSAO);
  assert.ok(FAIXAS_VERSAO);
  assert.equal(METADADOS.delta, TOLERANCIA_PADRAO.delta);
  assert.equal(METADADOS.totalDeChecks, 48);
});

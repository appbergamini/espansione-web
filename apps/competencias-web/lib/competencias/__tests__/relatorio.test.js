import test from 'node:test';
import assert from 'node:assert/strict';

import { BLOCOS, CHAVES, PILARES, CAPACIDADES, faixaDe } from '../catalog.js';
import { consolidar } from '../score.js';
import { gerarRelatorio, varrerRelatorio, TERMOS_PROIBIDOS } from '../relatorio.js';
import { etiqueta, etiquetasDe, PASSO_7_DIAS } from '../lexico.js';
import { LEXICO_PILAR } from '@espansione/cis';

let seed = 987654;
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
const pilaresDe = (d, i, s, c, ctx) => ({
  determinacao: { natural: d, emContexto: ctx?.[0] ?? d },
  conexao: { natural: i, emContexto: ctx?.[1] ?? i },
  constancia: { natural: s, emContexto: ctx?.[2] ?? s },
  precisao: { natural: c, emContexto: ctx?.[3] ?? c },
});

function relatorioAleatorio() {
  const consolidado = consolidar(respostasAleatorias());
  const v = [0, 0, 0, 0].map(() => 10 + Math.floor(rnd() * 80));
  const soma = v.reduce((a, b) => a + b, 0);
  const norm = v.map((x) => Math.round((x / soma) * 200));
  norm[0] += 200 - norm.reduce((a, b) => a + b, 0);
  const aprofundadas = consolidado.ranking.slice(-3).map((r) => r.chave);
  const niveis = Object.fromEntries(aprofundadas.map((c) => [c, { nivel: 2, confianca: 'afirmado' }]));
  return gerarRelatorio({ consolidado, pilares: pilaresDe(...norm), niveis, aprofundadas });
}

// ── léxico ───────────────────────────────────────────────────────────
test('toda competência tem uma etiqueta válida para cada pilar', () => {
  const todasAsCaracteristicas = new Set(PILARES.flatMap((p) => LEXICO_PILAR[p]));
  for (const c of CHAVES) {
    for (const p of PILARES) {
      const e = etiqueta(c, p);
      assert.ok(e, `${c}/${p} sem etiqueta`);
      assert.ok(todasAsCaracteristicas.has(e), `${c}/${p}: "${e}" não é uma das 16`);
      assert.ok(LEXICO_PILAR[p].includes(e), `${c}/${p}: "${e}" não pertence a esse pilar`);
    }
  }
});

test('etiquetasDe NUNCA devolve duas características do mesmo pilar', () => {
  const porPilar = Object.fromEntries(PILARES.map((p, i) => [p, { distancia: 30 - i * 5 }]));
  const saida = etiquetasDe('vender_negociar', [...PILARES, ...PILARES], porPilar, 3);
  assert.equal(saida.length, 3);
  assert.equal(new Set(saida.map((x) => x.pilar)).size, 3);
  assert.equal(new Set(saida.map((x) => x.caracteristica)).size, 3);
});

test('etiquetasDe prioriza o pilar mais distante da faixa', () => {
  const porPilar = { determinacao: { distancia: 5 }, conexao: { distancia: 40 }, constancia: { distancia: 12 }, precisao: { distancia: 0 } };
  const saida = etiquetasDe('formular_valor', ['determinacao', 'conexao', 'constancia'], porPilar, 1);
  assert.equal(saida[0].pilar, 'conexao');
});

test('há um passo de 7 dias para cada uma das 12', () => {
  for (const c of CHAVES) {
    assert.ok(PASSO_7_DIAS[c], `${c} sem passo de 7 dias`);
    assert.ok(PASSO_7_DIAS[c].length > 40, `${c}: passo genérico demais`);
  }
});

// ── estrutura ────────────────────────────────────────────────────────
test('o relatório tem os 7 blocos, na ordem', () => {
  const r = relatorioAleatorio();
  assert.deepEqual(r.blocos.map((b) => b.id), [
    'onde_voce_esta', 'suas_competencias', 'por_que', 'sustenta_custa', 'trilha', 'passo_7_dias', 'convite',
  ]);
});

test('a escala desenhada tem 5 passos e bate com o rótulo', async () => {
  const { ESCALA_CRESCENTE, NOME_NIVEL } = await import('../relatorio.js');
  const { ROTULO_POSICAO } = await import('../score.js');
  assert.equal(ESCALA_CRESCENTE.length, 5);
  assert.equal(ESCALA_CRESCENTE[0], 'mais_fragil', 'a escala cresce da esquerda para a direita');
  assert.equal(ESCALA_CRESCENTE[4], 'mais_forte');
  assert.deepEqual([...ESCALA_CRESCENTE].sort(), Object.keys(ROTULO_POSICAO).sort());

  const r = relatorioAleatorio();
  for (const c of r.blocos[1].capacidades.flatMap((x) => x.competencias)) {
    assert.ok(c.passo >= 1 && c.passo <= 5, `${c.chave}: passo ${c.passo} fora de 1–5`);
    assert.equal(c.de, 5);
    assert.equal(ROTULO_POSICAO[ESCALA_CRESCENTE[c.passo - 1]], c.posicao, `${c.chave}: passo e rótulo discordam`);
  }
});

test('o nível é nomeado, não só numerado', async () => {
  const { NOME_NIVEL } = await import('../relatorio.js');
  for (const n of [1, 2, 3, 4]) assert.ok(NOME_NIVEL[n]?.length > 4, `nível ${n} sem nome`);

  const consolidado = consolidar(respostasAleatorias());
  const aprofundadas = consolidado.ranking.slice(-3).map((x) => x.chave);
  const niveis = Object.fromEntries(aprofundadas.map((c) => [c, { nivel: 2, confianca: 'estimado' }]));
  const r = gerarRelatorio({ consolidado, pilares: pilaresDe(50, 50, 50, 50), niveis, aprofundadas });
  const todas = r.blocos[1].capacidades.flatMap((x) => x.competencias);
  for (const c of todas) {
    if (aprofundadas.includes(c.chave)) {
      assert.equal(c.nivelNome, NOME_NIVEL[2]);
      assert.equal(c.nivelEstimado, true);
    } else {
      assert.equal(c.nivelNome, null, `${c.chave} não pode ter nome de nível`);
    }
  }
});

test('a ordem das capacidades vem pronta para desenhar', () => {
  const r = relatorioAleatorio();
  const caps = r.blocos[0].capacidades;
  assert.deepEqual(caps.map((c) => c.ordem), [1, 2, 3, 4]);
  for (const c of caps) assert.equal(c.de, 4);
});

test('bloco 2 lista as 12 agrupadas nas 4 capacidades', () => {
  const r = relatorioAleatorio();
  const b2 = r.blocos[1];
  assert.equal(b2.capacidades.length, 4);
  const todas = b2.capacidades.flatMap((c) => c.competencias);
  assert.equal(todas.length, 12);
  assert.deepEqual(b2.capacidades.map((c) => c.capacidade), CAPACIDADES);
});

test('nível aparece SÓ nas 3 aprofundadas', () => {
  const consolidado = consolidar(respostasAleatorias());
  const aprofundadas = consolidado.ranking.slice(-3).map((r) => r.chave);
  const niveis = Object.fromEntries(aprofundadas.map((c) => [c, { nivel: 3, confianca: 'afirmado' }]));
  const r = gerarRelatorio({ consolidado, pilares: pilaresDe(50, 50, 50, 50), niveis, aprofundadas });
  const todas = r.blocos[1].capacidades.flatMap((c) => c.competencias);
  for (const c of todas) {
    if (aprofundadas.includes(c.chave)) assert.equal(c.nivel, 3, `${c.chave} deveria ter nível`);
    else assert.equal(c.nivel, null, `${c.chave} não pode ter nível`);
  }
});

test('a trilha tem no máximo 3 itens e não repete competência', () => {
  for (let i = 0; i < 100; i++) {
    const t = relatorioAleatorio().blocos[4];
    assert.ok(t.itens.length <= 3);
    assert.equal(new Set(t.itens.map((x) => x.chave)).size, t.itens.length);
  }
});

test('nenhuma leitura nomeia mais de 3 características, nunca duas do mesmo pilar', () => {
  for (let i = 0; i < 200; i++) {
    for (const l of relatorioAleatorio().blocos[2].leituras) {
      assert.ok(l.caracteristicas.length <= 3, `${l.chave} nomeou ${l.caracteristicas.length}`);
      assert.equal(new Set(l.caracteristicas.map((c) => c.pilar)).size, l.caracteristicas.length);
    }
  }
});

// ── regras editoriais ────────────────────────────────────────────────
test('sem pilar sinalizado, o texto DIZ que não há ponto de atenção — não força achado', () => {
  const consolidado = consolidar(respostasAleatorias());
  const f = faixaDe('gestao_recursos');
  const meio = (p) => Math.round((f.faixas[p].minimo + f.faixas[p].maximo) / 2);
  const r = gerarRelatorio({
    consolidado,
    pilares: pilaresDe(meio('determinacao'), meio('conexao'), meio('constancia'), meio('precisao')),
    niveis: {}, aprofundadas: [],
  });
  const leitura = r.blocos[2].leituras.find((l) => l.chave === 'gestao_recursos');
  if (leitura) {
    assert.equal(leitura.semPontoDeAtencao, true);
    assert.match(leitura.texto, /Sem pontos de atenção comportamentais/);
    assert.equal(leitura.caracteristicas.length, 0);
  }
});

test('Confiança BAIXA sinaliza a limitação ao cliente, em vez de fingir precisão', () => {
  const consolidado = consolidar(respostasAleatorias());
  const r = gerarRelatorio({
    consolidado, pilares: pilaresDe(95, 10, 10, 85), niveis: {}, aprofundadas: [],
  });
  const l = r.blocos[2].leituras.find((x) => x.chave === 'coerencia_etica');
  if (l) {
    assert.equal(l.leituraLimitada, true);
    assert.match(l.texto, /explica pouco/);
    assert.equal(l.caracteristicas.length, 0);
  }
});

test('pilar recorrente é dito UMA vez, não repetido N vezes', () => {
  let achou = false;
  for (let i = 0; i < 200 && !achou; i++) {
    const b3 = relatorioAleatorio().blocos[2];
    if (b3.padraoRecorrente) {
      achou = true;
      assert.ok(b3.padraoRecorrente.pilar);
      assert.match(b3.padraoRecorrente.texto, /padrão só/);
    }
  }
  assert.ok(achou, 'nenhum caso de pilar recorrente apareceu em 200 relatórios — revisar o fixture');
});

test('trilha inteiramente técnica muda o título do bloco e não inventa comportamento', () => {
  // Perfil no meio de todas as faixas possíveis → nada sinalizado
  const consolidado = consolidar(respostasAleatorias());
  const r = gerarRelatorio({ consolidado, pilares: pilaresDe(50, 50, 50, 50), niveis: {}, aprofundadas: [], delta: 60 });
  const t = r.blocos[4];
  assert.equal(r.meta.trilhaToda1Tecnica || t.itens.every((i) => i.rota === 'tecnica'), true);
  assert.equal(t.titulo, 'O que desenvolver');
  assert.match(t.introducao, /não é o que está no caminho/);
});

test('gap grande em 3+ pilares abre a conversa de próximo estágio', () => {
  const consolidado = consolidar(respostasAleatorias());
  const r = gerarRelatorio({
    consolidado,
    pilares: pilaresDe(70, 40, 50, 40, [30, 80, 20, 70]),
    niveis: {}, aprofundadas: [],
  });
  assert.match(r.blocos[3].texto, /cobra energia|configuração diferente/);
});

test('gap pequeno em toda a linha é lido como força, não como fragilidade', () => {
  const consolidado = consolidar(respostasAleatorias());
  const r = gerarRelatorio({
    consolidado, pilares: pilaresDe(50, 50, 50, 50, [52, 48, 51, 49]), niveis: {}, aprofundadas: [],
  });
  assert.match(r.blocos[3].texto, /é uma força/);
});

// ── varredura de QA ──────────────────────────────────────────────────
test('VARREDURA: nenhum relatório vaza termo proibido, chave crua ou número', () => {
  for (let i = 0; i < 300; i++) {
    const r = relatorioAleatorio();
    const v = varrerRelatorio(r);
    assert.ok(v.limpo, `relatório #${i} sujo: ${v.achados.join('; ')}`);
  }
});

test('a varredura realmente pega sujeira quando existe', () => {
  const sujo = { blocos: [{ id: 'x', titulo: 'ok', texto: 'Seu perfil DISC mostra 72 pontos de Dominância.' }] };
  const v = varrerRelatorio(sujo);
  assert.equal(v.limpo, false);
  assert.ok(v.achados.some((a) => a.includes('DISC')));
  assert.ok(v.achados.some((a) => a.includes('número exposto')));

  const comChaveCrua = { blocos: [{ id: 'x', texto: 'A competência vender_negociar precisa de atenção.' }] };
  assert.equal(varrerRelatorio(comChaveCrua).limpo, false);
});

test('a lista de proibições cobre o que a SPEC proíbe', () => {
  for (const t of ['DISC', 'percentil', 'deficiente', 'aderência']) {
    assert.ok(TERMOS_PROIBIDOS.some((x) => x.toLowerCase() === t.toLowerCase()), `${t} fora da lista`);
  }
});

test('o relatório exige os DOIS instrumentos — sem pilares, não gera', () => {
  const consolidado = consolidar(respostasAleatorias());
  assert.throws(() => gerarRelatorio({ consolidado, pilares: null }), /dois instrumentos/);
  assert.throws(() => gerarRelatorio({ consolidado: null, pilares: pilaresDe(50, 50, 50, 50) }), /dois instrumentos/);
});

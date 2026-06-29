import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mediaValidas,
  notaNormalizada,
  agregarMaturidade,
  calcularNps,
  calcularSatisfacao,
  calcularGaps,
  agregarPriorizacao,
  montarResultado,
} from '../scoring.js';
import { maturidadeCore } from '../catalog.js';
import { montarFormulario } from '../forms.js';

test('mediaValidas ignora N/A (-1) e ausentes', () => {
  assert.equal(mediaValidas([3, 1, -1, undefined, null, 2]), 2); // (3+1+2)/3
  assert.equal(mediaValidas([-1, -1]), null);
  assert.equal(mediaValidas([]), null);
});

test('notaNormalizada: 3→100, 1.5→50, null→null', () => {
  assert.equal(notaNormalizada(3), 100);
  assert.equal(notaNormalizada(1.5), 50);
  assert.equal(notaNormalizada(null), null);
});

test('agregarMaturidade: respondente "tudo 3" → geral 100 nos 4 sistemas', () => {
  const perguntas = maturidadeCore('socios');
  const resp = Object.fromEntries(perguntas.map((p) => [p.id, 3]));
  const r = agregarMaturidade([resp], perguntas);
  assert.equal(r.geral, 100);
  for (const sis of ['Marca', 'Negócios', 'Comunicação', 'Pessoas']) {
    assert.equal(r.sistemas[sis].nota, 100, `${sis} deveria ser 100`);
  }
  assert.equal(r.nRespondentes, 1);
});

test('agregarMaturidade: tudo N/A → notas nulas', () => {
  const perguntas = maturidadeCore('socios');
  const resp = Object.fromEntries(perguntas.map((p) => [p.id, -1]));
  const r = agregarMaturidade([resp], perguntas);
  assert.equal(r.geral, null);
});

test('agregarMaturidade: pool entre respondentes (média por pergunta)', () => {
  const perguntas = maturidadeCore('socios');
  // dois respondentes: um tudo 3, outro tudo 1 → média por pergunta = 2 → nota 66.7
  const a = Object.fromEntries(perguntas.map((p) => [p.id, 3]));
  const b = Object.fromEntries(perguntas.map((p) => [p.id, 1]));
  const r = agregarMaturidade([a, b], perguntas);
  assert.equal(r.geral, 66.7);
  assert.equal(r.nRespondentes, 2);
});

test('calcularNps: distribuição conhecida', () => {
  // 10 respostas: 5 promotores(9-10), 2 neutros(7-8), 3 detratores(<=6) → (50-30)=20
  const nps = calcularNps([10, 10, 9, 9, 9, 8, 7, 6, 5, 0]);
  assert.equal(nps.promotores, 5);
  assert.equal(nps.neutros, 2);
  assert.equal(nps.detratores, 3);
  assert.equal(nps.score, 20);
  assert.equal(calcularNps([]).score, null);
});

test('calcularSatisfacao: média', () => {
  assert.equal(calcularSatisfacao([8, 10, 6]).media, 8);
  assert.equal(calcularSatisfacao([]).media, null);
});

test('calcularGaps: indicador [3P] com notas distintas', () => {
  const mat = {
    socios: { indicadores: { 'marca.diferenciacao_clareza': { nota: 90 } } },
    colaboradores: { indicadores: { 'marca.diferenciacao_clareza': { nota: 50 } } },
    clientes: { indicadores: { 'marca.diferenciacao_clareza': { nota: 60 } } },
  };
  const gaps = calcularGaps(mat);
  const dif = gaps.find((g) => g.indicador_canonico === 'marca.diferenciacao_clareza');
  assert.ok(dif, 'deveria achar diferenciacao_clareza');
  assert.equal(dif.max, 90);
  assert.equal(dif.min, 50);
  assert.equal(dif.gap, 40);
  assert.deepEqual(Object.keys(dif.porPublico).sort(), ['clientes', 'colaboradores', 'socios']);
});

test('calcularGaps: ignora indicador com < 2 públicos', () => {
  const mat = { socios: { indicadores: { 'marca.diferenciacao_clareza': { nota: 80 } } }, colaboradores: { indicadores: {} }, clientes: { indicadores: {} } };
  const gaps = calcularGaps(mat);
  assert.equal(gaps.find((g) => g.indicador_canonico === 'marca.diferenciacao_clareza'), undefined);
});

test('montarResultado: sócios free "tudo 3" → geral 100, sem gaps (1 público)', () => {
  const perguntas = montarFormulario('socios', { produto: 'maturidade_free' });
  const resp = {};
  for (const q of perguntas) resp[q.id] = q.response_type.startsWith('escala4') ? 3 : (q.response_type === 'numero' ? 1 : 'x');
  const r = montarResultado({ respostasPorPublico: { socios: [resp] }, produto: 'maturidade_free', geradoEm: 'T' });
  assert.equal(r.porPublico.socios.geral, 100);
  assert.equal(r.gaps.length, 0); // só 1 público → nada a comparar
  assert.equal(r.geradoEm, 'T');
});

test('agregarPriorizacao: ranking por frequência', () => {
  const r = agregarPriorizacao([['Liderança', 'Cultura e valores'], ['Liderança'], ['Cultura e valores', 'Liderança']]);
  assert.equal(r[0].tema, 'Liderança');
  assert.equal(r[0].count, 3);
});

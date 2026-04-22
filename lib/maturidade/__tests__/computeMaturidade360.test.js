// lib/maturidade/__tests__/computeMaturidade360.test.js
// Roda com: node lib/maturidade/__tests__/computeMaturidade360.test.js

import assert from 'node:assert/strict';
import { computeMaturidade360, agregateMaturidades } from '../computeMaturidade360.js';

let passed = 0, failed = 0;
const test = (name, fn) => {
  try { fn(); console.log(`ok   — ${name}`); passed++; }
  catch (e) { console.error(`fail — ${name}\n     ${e.message}`); failed++; }
};

const mkAllAt = (valor, prefix = 'parte6_q') => {
  const o = {};
  for (let i = 1; i <= 48; i++) o[`${prefix}${i}`] = valor;
  return o;
};

test('computa scores corretamente com todas as respostas em 3', () => {
  const r = computeMaturidade360(mkAllAt(3));
  // 8 perguntas × 3 = 24 de 32 = 75% (Baixa, limite inferior)
  assert.equal(r.pilares.estrategia.score, 24);
  assert.equal(r.pilares.estrategia.percentual, 75);
  assert.equal(r.pilares.estrategia.prioridade, 'Baixa');
  assert.equal(r.completude.respondidas, 48);
  assert.equal(r.total.score, 144);
  assert.equal(r.total.percentual, 75);
});

test('aceita prefixos alternativos (p6_q e maturidade_q)', () => {
  const respostas = {};
  for (let i = 1; i <= 8; i++) respostas[`p6_q${i}`] = 4;
  for (let i = 9; i <= 16; i++) respostas[`maturidade_q${i}`] = 2;
  const r = computeMaturidade360(respostas);
  assert.equal(r.pilares.estrategia.percentual, 100);
  assert.equal(r.pilares.financas.percentual, 50);
});

test('aceita strings numéricas', () => {
  const respostas = {};
  for (let i = 1; i <= 8; i++) respostas[`parte6_q${i}`] = '4';
  const r = computeMaturidade360(respostas);
  assert.equal(r.pilares.estrategia.percentual, 100);
});

test('respostas incompletas: pilar vazio vira null, pilar parcial extrapola', () => {
  const respostas = { parte6_q1: 4, parte6_q2: 4 }; // só 2 de 48
  const r = computeMaturidade360(respostas);
  assert.equal(r.completude.respondidas, 2);
  assert.equal(r.pilares.estrategia.respondidas, 2);
  // Extrapolação: média 4 × 8 perguntas = 32 / 32 = 100%
  assert.equal(r.pilares.estrategia.percentual, 100);
  assert.equal(r.pilares.financas.percentual, null);
  assert.equal(r.pilares.financas.prioridade, null);
});

test('classifica prioridades corretamente (<50 / 50-74 / >=75)', () => {
  const respostas = {};
  for (let i = 1; i <= 8; i++)  respostas[`parte6_q${i}`] = 4;  // 100%
  for (let i = 9; i <= 16; i++) respostas[`parte6_q${i}`] = 2;  // 50%
  for (let i = 17; i <= 24; i++) respostas[`parte6_q${i}`] = 1; // 25%
  const r = computeMaturidade360(respostas);
  assert.equal(r.pilares.estrategia.prioridade, 'Baixa');
  assert.equal(r.pilares.financas.prioridade,   'Media');
  assert.equal(r.pilares.comercial.prioridade,  'Alta');
});

test('pilar_mais_forte e pilar_mais_fraco', () => {
  const r = computeMaturidade360({
    ...Object.fromEntries([1,2,3,4,5,6,7,8].map(i => [`parte6_q${i}`, 4])),        // estrategia 100
    ...Object.fromEntries([17,18,19,20,21,22,23,24].map(i => [`parte6_q${i}`, 1])), // comercial 25
  });
  assert.equal(r.pilar_mais_forte, 'estrategia');
  assert.equal(r.pilar_mais_fraco, 'comercial');
});

test('retorna null para input inválido', () => {
  assert.equal(computeMaturidade360(null), null);
  assert.equal(computeMaturidade360(undefined), null);
  assert.equal(computeMaturidade360('string'), null);
});

test('agregateMaturidades: média de 2 sócios com divergência alta', () => {
  const m1 = computeMaturidade360(mkAllAt(4)); // 100% em tudo
  const m2 = computeMaturidade360(mkAllAt(2)); // 50%  em tudo
  const agg = agregateMaturidades([m1, m2]);
  assert.equal(agg.pilares.estrategia.percentual, 75);       // (100+50)/2
  assert.equal(agg.pilares.estrategia.divergencia_entre_socios, 'alta'); // desvio > 15
  assert.equal(agg.socios_respondentes, 2);
  assert.deepEqual(agg.pilares.estrategia.scores_individuais, [32, 16]);
});

test('agregateMaturidades: divergência baixa quando sócios respondem parecido', () => {
  const m1 = computeMaturidade360(mkAllAt(3));
  const m2 = computeMaturidade360(mkAllAt(3));
  const agg = agregateMaturidades([m1, m2]);
  assert.equal(agg.pilares.estrategia.divergencia_entre_socios, 'baixa');
});

test('agregateMaturidades: 1 único sócio retorna o próprio objeto', () => {
  const m = computeMaturidade360(mkAllAt(3));
  const agg = agregateMaturidades([m]);
  assert.deepEqual(agg, m);
});

test('agregateMaturidades: array vazio retorna null', () => {
  assert.equal(agregateMaturidades([]), null);
  assert.equal(agregateMaturidades(null), null);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

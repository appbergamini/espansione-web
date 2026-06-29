import test from 'node:test';
import assert from 'node:assert/strict';
import { montarFormulario, respostaPreenchida, obrigatoriasFaltando, progresso } from '../forms.js';
import { getPergunta } from '../catalog.js';

test('montarFormulario sócios free = perfil + 24 maturidade (sem priorização)', () => {
  const f = montarFormulario('socios', { produto: 'maturidade_free' });
  const mat = f.filter((q) => q.score_family === 'maturity');
  const pri = f.filter((q) => q.sistema === 'Priorização');
  assert.equal(mat.length, 24);
  assert.equal(pri.length, 0);
  assert.ok(f.some((q) => q.sistema === 'Perfil'), 'inclui perfil');
});

test('montarFormulario sócios pago = perfil + 36 maturidade + priorização', () => {
  const f = montarFormulario('socios', { produto: 'identidade_pago' });
  assert.equal(f.filter((q) => q.score_family === 'maturity').length, 36);
  assert.equal(f.filter((q) => q.sistema === 'Priorização').length, 1);
});

test('montarFormulario colaboradores: líder abre o bloco condicional (+5)', () => {
  const semLider = montarFormulario('colaboradores', { lider: false }).filter((q) => q.score_family === 'maturity').length;
  const comLider = montarFormulario('colaboradores', { lider: true }).filter((q) => q.score_family === 'maturity').length;
  assert.equal(semLider, 32);
  assert.equal(comLider, 37);
  // eNPS entra no formulário do colaborador (índice à parte, mas coletado na v1)
  assert.ok(montarFormulario('colaboradores').some((q) => q.score_family === 'nps'), 'deve incluir eNPS');
});

test('montarFormulario clientes = perfil + 24 + priorização', () => {
  const f = montarFormulario('clientes');
  assert.equal(f.filter((q) => q.score_family === 'maturity').length, 24);
  assert.equal(f.filter((q) => q.sistema === 'Priorização').length, 1);
});

test('respostaPreenchida: escala aceita N/A (-1); múltipla exige >=1', () => {
  const escala = getPergunta('SD-MAR-N2'); // escala4_frequencia
  assert.equal(respostaPreenchida(escala, 0), true);
  assert.equal(respostaPreenchida(escala, -1), true); // N/A é resposta
  assert.equal(respostaPreenchida(escala, undefined), false);
  const pri = getPergunta('PRI-SOC'); // multipla_ate3
  assert.equal(respostaPreenchida(pri, ['Liderança']), true);
  assert.equal(respostaPreenchida(pri, []), false);
});

test('obrigatoriasFaltando lista só as não preenchidas', () => {
  const f = montarFormulario('socios', { produto: 'maturidade_free' });
  const valDe = (q) => {
    if (/escala4|escala_0_10|numero/.test(q.response_type)) return 3;
    if (q.response_type === 'multipla_ate3') return ['x'];
    return 'ok';
  };
  const todas = Object.fromEntries(f.map((q) => [q.id, valDe(q)]));
  assert.deepEqual(obrigatoriasFaltando(f, todas), []);
  // remove uma resposta obrigatória
  const obrig = f.find((q) => q.obrigatoria);
  const semUma = { ...todas }; delete semUma[obrig.id];
  assert.deepEqual(obrigatoriasFaltando(f, semUma), [obrig.id]);
});

test('progresso conta respondidas/total', () => {
  const f = montarFormulario('socios', { produto: 'maturidade_free' });
  const p0 = progresso(f, {});
  assert.equal(p0.respondidas, 0);
  assert.equal(p0.total, f.length);
});

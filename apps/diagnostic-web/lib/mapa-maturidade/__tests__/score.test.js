import test from 'node:test';
import assert from 'node:assert/strict';
import {
  notaPergunta,
  faixaDaNota,
  computarSistema,
  computarGeral,
  atributosDeMarca,
  buildResultado,
} from '../score.js';
import {
  CATALOGO_MATURIDADE,
  SISTEMAS_MATURIDADE,
  perguntasQuePontuam,
  perguntasPorSistema,
  obrigatoriasFaltando,
  condicionalVisivel,
  perguntasCondicionais,
} from '../catalog.js';

// ── catálogo ─────────────────────────────────────────────────────────
test('catálogo: 40 perguntas pontuam, 10 por sistema', () => {
  assert.equal(perguntasQuePontuam().length, 40);
  for (const s of SISTEMAS_MATURIDADE) assert.equal(perguntasPorSistema(s).length, 10);
});

test('catálogo: exatamente 1 condicional (atributos de marca)', () => {
  const cond = perguntasCondicionais();
  assert.equal(cond.length, 1);
  assert.equal(cond[0].score_family, 'brand_attributes');
  assert.equal(cond[0].regra_condicional.depende, 'MM2-MAR-10');
  assert.deepEqual(cond[0].regra_condicional.valores, [2, 3]);
});

// ── notas ────────────────────────────────────────────────────────────
test('notaPergunta: 3→100, 0→0, N/A e ausente→null', () => {
  assert.equal(notaPergunta(3), 100);
  assert.equal(notaPergunta(0), 0);
  assert.equal(notaPergunta(-1), null);
  assert.equal(notaPergunta(undefined), null);
});

test('faixaDaNota respeita a régua oficial', () => {
  assert.equal(faixaDaNota(0).nivel, 1);
  assert.equal(faixaDaNota(29).nivel, 1);
  assert.equal(faixaDaNota(30).nivel, 2);
  assert.equal(faixaDaNota(56).nivel, 2);
  assert.equal(faixaDaNota(57).nivel, 3);
  assert.equal(faixaDaNota(83).nivel, 3);
  assert.equal(faixaDaNota(84).nivel, 4);
  assert.equal(faixaDaNota(100).nivel, 4);
  assert.equal(faixaDaNota(null), null);
});

// ── sistema ──────────────────────────────────────────────────────────
test('computarSistema: tudo 3 → nota 100, nível 4', () => {
  const answers = Object.fromEntries(perguntasPorSistema('Marca').map((q) => [q.id, 3]));
  const r = computarSistema(answers, 'Marca');
  assert.equal(r.nota, 100);
  assert.equal(r.nivel, 4);
  assert.equal(r.respostas_validas, 10);
});

test('computarSistema: N/A é excluído do denominador', () => {
  const perguntas = perguntasPorSistema('Negócios');
  const answers = {};
  perguntas.forEach((q, i) => (answers[q.id] = i === 0 ? -1 : 3)); // 1 N/A, resto 3
  const r = computarSistema(answers, 'Negócios');
  assert.equal(r.nota, 100); // média das 9 válidas
  assert.equal(r.respostas_validas, 9);
  assert.equal(r.na_count, 1);
});

test('computarSistema: coleta sinais de alerta em respostas baixas (0/1)', () => {
  const perguntas = perguntasPorSistema('Pessoas');
  const answers = Object.fromEntries(perguntas.map((q) => [q.id, 0]));
  const r = computarSistema(answers, 'Pessoas');
  assert.equal(r.nota, 0);
  assert.ok(r.alertas.length > 0);
  assert.ok(r.alertas.every((a) => typeof a.sinal === 'string'));
});

// ── geral ────────────────────────────────────────────────────────────
test('computarGeral: média dos sistemas com dados', () => {
  const sistemas = [{ nota: 100 }, { nota: 50 }, { nota: 0 }, { nota: null }];
  assert.equal(computarGeral(sistemas), 50);
  assert.equal(computarGeral([{ nota: null }]), null);
});

test('buildResultado: perfil tudo-3 → geral 100, nível Integrado, sem críticos', () => {
  const answers = Object.fromEntries(perguntasQuePontuam().map((q) => [q.id, 3]));
  const r = buildResultado(answers, { assessment_id: 'a1' });
  assert.equal(r.general_score, 100);
  assert.equal(r.general_nivel, 4);
  assert.equal(r.critical_systems.length, 0);
  assert.equal(r.strong_systems.length, 4);
  assert.equal(r.assessment_id, 'a1');
});

test('buildResultado: perfil tudo-0 → geral 0, 4 sistemas críticos', () => {
  const answers = Object.fromEntries(perguntasQuePontuam().map((q) => [q.id, 0]));
  const r = buildResultado(answers);
  assert.equal(r.general_score, 0);
  assert.equal(r.general_nivel, 1);
  assert.equal(r.critical_systems.length, 4);
});

// ── condicional / atributos de marca ─────────────────────────────────
test('condicionalVisivel: 10b só aparece com MM2-MAR-10 ∈ {2,3}', () => {
  const cond = perguntasCondicionais()[0];
  assert.equal(condicionalVisivel(cond, { 'MM2-MAR-10': 1 }), false);
  assert.equal(condicionalVisivel(cond, { 'MM2-MAR-10': 2 }), true);
  assert.equal(condicionalVisivel(cond, { 'MM2-MAR-10': 3 }), true);
});

test('atributosDeMarca: aceita array e string separada por |', () => {
  const cond = CATALOGO_MATURIDADE.find((q) => q.score_family === 'brand_attributes');
  assert.deepEqual(atributosDeMarca({ [cond.id]: ['Confiável', 'Ágil'] }), ['Confiável', 'Ágil']);
  assert.deepEqual(atributosDeMarca({ [cond.id]: 'Confiável | Ágil' }), ['Confiável', 'Ágil']);
  assert.deepEqual(atributosDeMarca({}), []);
});

// ── completude ───────────────────────────────────────────────────────
test('obrigatoriasFaltando: vazio quando tudo respondido; ignora condicional oculta', () => {
  const answers = Object.fromEntries(perguntasQuePontuam().map((q) => [q.id, 2]));
  // MM2-MAR-10 = 2 torna a condicional visível → passa a faltar
  const faltandoComCond = obrigatoriasFaltando(answers);
  const cond = perguntasCondicionais()[0];
  assert.ok(!faltandoComCond.includes(cond.id) || !cond.obrigatoria);
  // com MM2-MAR-10 = 0 a condicional fica oculta e não é exigida
  const answers2 = { ...answers, 'MM2-MAR-10': 0 };
  assert.ok(!obrigatoriasFaltando(answers2).includes(cond.id));
});

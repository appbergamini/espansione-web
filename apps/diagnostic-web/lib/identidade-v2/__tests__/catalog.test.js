import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATALOGO_IDENTIDADE,
  getPergunta,
  maturidadeCore,
  formularioMaturidadeFree,
  formularioSociosPago,
  formularioColaboradores,
  formularioClientes,
  blocoLider,
  priorizacao,
  idsFree,
  extrasPagoSocios,
  indicadoresComparaveis,
} from '../catalog.js';

test('catálogo tem 231 perguntas, IDs únicos', () => {
  assert.equal(CATALOGO_IDENTIDADE.length, 231);
  assert.equal(new Set(CATALOGO_IDENTIDADE.map((q) => q.id)).size, 231);
});

test('toda maturity tem indicador_canonico', () => {
  const semCanon = CATALOGO_IDENTIDADE.filter((q) => q.score_family === 'maturity' && !q.indicador_canonico);
  assert.deepEqual(semCanon.map((q) => q.id), []);
});

test('contagens do Core por público batem com o produto', () => {
  // Formulário único: Maturidade grátis = todas as 36 dos sócios (sem split)
  assert.equal(formularioMaturidadeFree().length, 36);
  assert.equal(formularioSociosPago().length, 36);
  assert.equal(formularioColaboradores({ lider: false }).length, 32);
  assert.equal(formularioColaboradores({ lider: true }).length, 37); // 32 + bloco líder
  assert.equal(formularioClientes().length, 24);
  assert.equal(blocoLider().length, 5);
});

test('distribuição de maturidade por sistema (Sócios 8/10/8/10)', () => {
  const conta = (sis) => maturidadeCore('socios').filter((q) => q.sistema === sis).length;
  assert.equal(conta('Marca'), 8);
  assert.equal(conta('Negócios'), 10);
  assert.equal(conta('Comunicação'), 8);
  assert.equal(conta('Pessoas'), 10);
});

test('formulário único: free = pago (36), sem perguntas adicionais', () => {
  const free = idsFree();
  const pago = new Set(formularioSociosPago().map((q) => q.id));
  assert.equal(free.size, 36);
  for (const id of free) assert.ok(pago.has(id), `free ${id} deveria estar no pago`);
  assert.equal(extrasPagoSocios().length, 0);
});

test('Core só tem perguntas fechadas (sem abertas)', () => {
  const abertas = CATALOGO_IDENTIDADE.filter(
    (q) => q.tier_mvp === 'Core' && (q.response_type === 'aberta' || q.response_type === 'ranking'),
  );
  assert.deepEqual(abertas.map((q) => q.id), []);
});

test('escala4 mapeia valores 0–3 com N/A = -1', () => {
  const q = getPergunta('SD-MAR-N2');
  assert.equal(q.response_type, 'escala4_frequencia');
  assert.deepEqual(q.opcoes.map((o) => o.value), [0, 1, 2, 3, -1]);
});

test('priorização é múltipla até 3, score_family none, não entra no cálculo', () => {
  const [p] = priorizacao('socios');
  assert.equal(p.response_type, 'multipla_ate3');
  assert.equal(p.max_escolhas, 3);
  assert.equal(p.score_family, 'none');
  assert.equal(p.usar_no_calculo_v1, false);
});

test('indicadores comparáveis incluem os anchors [3P]', () => {
  const comp = indicadoresComparaveis();
  const tres = comp.filter((c) => c.publicos.length === 3).map((c) => c.indicador_canonico);
  // 7 anchors [3P] após as perguntas novas (proposito_clareza promovido)
  assert.equal(tres.length, 7);
  assert.ok(tres.includes('marca.diferenciacao_clareza'));
  assert.ok(tres.includes('marca.proposito_clareza'));
});

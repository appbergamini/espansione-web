import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mediaValidas,
  notaNormalizada,
  agregarMaturidade,
  calcularNps,
  calcularSatisfacao,
  agregarDrivers,
  calcularTriangulacao,
  montarResultado,
} from '../scoring.js';
import {
  CATALOGO_IDENTIDADE,
  MATRIZ_INDICADORES,
  PUBLICOS_IDENTIDADE,
  SISTEMAS,
  maturidadeCore,
  npsCore,
  driversCore,
  obrigatoriasFaltando,
} from '../catalog.js';

// ── catálogo ─────────────────────────────────────────────────────────
test('catálogo: 24 núcleo por público, todos com código', () => {
  for (const p of PUBLICOS_IDENTIDADE) {
    const nuc = maturidadeCore(p);
    assert.equal(nuc.length, 24);
    assert.ok(nuc.every((q) => /^(MAR|NEG|COM|PES)-0[1-6]$/.test(q.indicador_codigo)));
  }
});
test('catálogo: 4 sistemas, 24 indicadores na matriz', () => {
  assert.equal(SISTEMAS.length, 4);
  assert.equal(MATRIZ_INDICADORES.length, 24);
});

// ── notas ────────────────────────────────────────────────────────────
test('mediaValidas / notaNormalizada', () => {
  assert.equal(mediaValidas([3, 1, -1, undefined, 2]), 2);
  assert.equal(mediaValidas([-1]), null);
  assert.equal(notaNormalizada(3), 100);
  assert.equal(notaNormalizada(1.5), 50);
  assert.equal(notaNormalizada(null), null);
});

// respondente que responde `valor` em todo o núcleo do público
function respTudo(publico, valor) {
  return Object.fromEntries(maturidadeCore(publico).map((q) => [q.id, valor]));
}

test('agregarMaturidade: 2 respondentes tudo-3 → geral 100 nos 4 sistemas', () => {
  const r = agregarMaturidade([respTudo('socios', 3), respTudo('socios', 3)], maturidadeCore('socios'));
  assert.equal(r.geral, 100);
  assert.equal(r.nRespondentes, 2);
  for (const s of SISTEMAS) assert.equal(r.sistemas[s].nota, 100);
  assert.equal(Object.keys(r.indicadores).length, 24);
});

test('agregarMaturidade: pool entre respondentes (3 e 1 → média 2 → 66.7)', () => {
  const r = agregarMaturidade([respTudo('socios', 3), respTudo('socios', 1)], maturidadeCore('socios'));
  assert.equal(r.geral, 66.7);
});

// ── índices à parte ──────────────────────────────────────────────────
test('calcularNps: promotores/detratores', () => {
  assert.equal(calcularNps([10, 9, 7, 5, 0]).score, Math.round(((2 - 2) / 5) * 100)); // 2 prom, 2 detr → 0
  assert.equal(calcularNps([]).score, null);
});
test('calcularSatisfacao: média 0–10', () => {
  assert.deepEqual(calcularSatisfacao([8, 10, 6]), { media: 8, total: 3 });
  assert.deepEqual(calcularSatisfacao([]), { media: null, total: 0 });
});
test('agregarDrivers: conta frequência de arrays e strings', () => {
  const r = agregarDrivers([['Preço', 'Agilidade'], ['Preço'], 'Agilidade']);
  assert.deepEqual(r[0], { opcao: 'Preço', count: 2 });
  assert.equal(r.length, 2);
});

// ── triangulação ─────────────────────────────────────────────────────
test('calcularTriangulacao: gap por indicador entre públicos', () => {
  const porPublico = {
    socios: agregarMaturidade([respTudo('socios', 3)], maturidadeCore('socios')), // 100
    colaboradores: agregarMaturidade([respTudo('colaboradores', 0)], maturidadeCore('colaboradores')), // 0
    clientes: agregarMaturidade([respTudo('clientes', 3)], maturidadeCore('clientes')), // 100
  };
  const tri = calcularTriangulacao(porPublico);
  assert.equal(tri.length, 24);
  // todos os indicadores têm sócios 100 e colab 0 → gap 100
  assert.ok(tri.every((t) => t.gap === 100));
  assert.equal(tri[0].porPublico.socios, 100);
  assert.equal(tri[0].porPublico.colaboradores, 0);
});

// ── resultado completo ───────────────────────────────────────────────
test('montarResultado: estrutura por público + triangulação + índices', () => {
  const r = montarResultado({
    respostasPorPublico: {
      socios: [respTudo('socios', 3)],
      colaboradores: [respTudo('colaboradores', 2)],
      clientes: [respTudo('clientes', 1)],
    },
  });
  assert.equal(r.schema_version, 'identidade-final-1');
  assert.equal(r.porPublico.socios.geral, 100);
  assert.equal(r.porPublico.colaboradores.geral, 66.7);
  assert.equal(r.porPublico.clientes.geral, 33.3);
  assert.equal(r.triangulacao.length, 24);
  assert.ok(r.triangulacao[0].gap >= 0);
  assert.ok('satisfacao' in r.indices);
});

test('driversCore existe para clientes (não para sócios)', () => {
  assert.ok(driversCore('clientes').length >= 3);
  assert.equal(driversCore('socios').length, 0);
});

// ── completude por respondente ───────────────────────────────────────
test('obrigatoriasFaltando: núcleo respondido não falta', () => {
  const answers = Object.fromEntries(maturidadeCore('clientes').map((q) => [q.id, 2]));
  const faltando = obrigatoriasFaltando('clientes', answers);
  // pode faltar específicas obrigatórias, mas nenhum núcleo respondido
  assert.ok(!maturidadeCore('clientes').some((q) => faltando.includes(q.id)));
});

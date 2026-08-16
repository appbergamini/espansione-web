import test from 'node:test';
import assert from 'node:assert/strict';

import { ANCORAS, CHAVES, K_APARICOES } from '../catalog.js';
import { indiceCoerencia, LEITURA_COERENCIA } from '../indices.js';

const scoresZerados = () => Object.fromEntries(CHAVES.map((c) => [c, 0]));
const todasAncoras = (valor) => Object.fromEntries(ANCORAS.map((a) => [a.id, { valor }]));

test('sem âncora respondida, não há índice — não inventar número', () => {
  assert.equal(indiceCoerencia({}, scoresZerados()), null);
});

test('evidência alta com declaração média dá coerente', () => {
  const r = indiceCoerencia(todasAncoras(4), scoresZerados());
  assert.equal(r.evidenciaMedia, 100);
  assert.equal(r.declaracaoMedia, 50, 'score 0 no meio da faixa ±K deve normalizar em 50');
  assert.equal(r.valor, 50);
  assert.equal(r.leitura, 'coerente');
});

test('evidência baixa com declaração alta cai em revisar', () => {
  const scores = scoresZerados();
  // tudo o que as âncoras verificam declarado no topo
  for (const c of new Set(ANCORAS.flatMap((a) => a.verifica))) scores[c] = K_APARICOES;
  const r = indiceCoerencia(todasAncoras(0), scores);
  assert.equal(r.evidenciaMedia, 0);
  assert.equal(r.declaracaoMedia, 100);
  assert.equal(r.valor, -100);
  assert.equal(r.leitura, 'revisar_na_sessao');
});

test('os cortes da SPEC ficam onde deveriam', () => {
  const casos = [
    { evid: 2, decl: 0, esperado: 'coerente' },          // valor 50
    { evid: 2, decl: 0, esperado: 'coerente' },
  ];
  for (const c of casos) {
    const scores = scoresZerados();
    const r = indiceCoerencia(todasAncoras(c.evid), scores);
    assert.equal(r.leitura, c.esperado);
  }
  // fronteiras exatas
  const naBorda = (valor) => (valor >= -10 ? 'coerente' : valor > -25 ? 'atencao' : 'revisar_na_sessao');
  assert.equal(naBorda(-10), 'coerente');
  assert.equal(naBorda(-10.01), 'atencao');
  assert.equal(naBorda(-25), 'revisar_na_sessao');
  assert.equal(naBorda(-24.99), 'atencao');
});

test('âncora parcial ainda calcula, e diz quantas entraram', () => {
  const parcial = { [ANCORAS[0].id]: { valor: 3 }, [ANCORAS[1].id]: { valor: 1 } };
  const r = indiceCoerencia(parcial, scoresZerados());
  assert.equal(r.ancorasRespondidas, 2);
  assert.equal(r.competenciasVerificadas, 8);
});

test('toda leitura possível tem explicação escrita', () => {
  for (const k of ['coerente', 'atencao', 'revisar_na_sessao']) {
    assert.ok(LEITURA_COERENCIA[k], `${k} sem explicação`);
  }
});

test('o índice normaliza pela faixa real ±K, não por constante fixa', () => {
  // score no mínimo → declaração 0; no máximo → 100
  const min = scoresZerados();
  for (const c of new Set(ANCORAS.flatMap((a) => a.verifica))) min[c] = -K_APARICOES;
  assert.equal(indiceCoerencia(todasAncoras(2), min).declaracaoMedia, 0);

  const max = scoresZerados();
  for (const c of new Set(ANCORAS.flatMap((a) => a.verifica))) max[c] = K_APARICOES;
  assert.equal(indiceCoerencia(todasAncoras(2), max).declaracaoMedia, 100);
});

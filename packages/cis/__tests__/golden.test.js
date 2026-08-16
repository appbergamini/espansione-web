// =====================================================================
// Teste de equivalência com a implementação em produção.
//
// Enquanto `apps/diagnostic-web/public/cis-app.js` mantiver a sua própria
// cópia do instrumento, este teste é o que garante que as duas não divirjam:
// ele carrega o arquivo REAL da produção, avalia o trecho puro (constantes +
// calcScores) e compara contra o pacote em entradas aleatórias.
//
// Se este teste falhar, um dos dois lados foi editado isoladamente. Não
// "consertar o teste" — reconciliar as duas implementações.
// =====================================================================
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { BLOCOS_RANKING, PARES_FORCADOS, PESOS_RANKING, PESO_PAR, TOTAL_BRUTO } from '../src/instrumento.js';
import { calcularScores, COEFICIENTES } from '../src/scoring.js';
import { derivarPilares, lerGap, PILARES, LEXICO_PILAR } from '../src/pilares.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CIS_APP = path.resolve(AQUI, '../../../apps/diagnostic-web/public/cis-app.js');

// ── carga do legado ──────────────────────────────────────────────────
function carregarLegado() {
  const src = readFileSync(CIS_APP, 'utf8');
  // O trecho puro vai do início até a primeira constante de UI.
  const corte = src.indexOf('const FORMATS=');
  assert.ok(corte > 0, 'marcador `const FORMATS=` não encontrado — o corte do trecho puro precisa ser revisto');
  const ctx = vm.createContext({});
  vm.runInContext(
    src.slice(0, corte) + '\n;globalThis.__legado = { calcScores, RG, FP, RW, PW, CC };',
    ctx,
    { filename: 'cis-app.js' }
  );
  return ctx.__legado;
}

const legadoDisponivel = existsSync(CIS_APP);
const legado = legadoDisponivel ? carregarLegado() : null;

// Os objetos do legado nascem dentro do vm, ou seja, em outro realm: o
// Object.prototype deles não é o nosso, e deepStrictEqual compara protótipo.
// Normalizar por JSON tira a identidade de realm e deixa só o dado.
const puro = (v) => JSON.parse(JSON.stringify(v));

// ── RNG determinístico ───────────────────────────────────────────────
let seed = 20260816;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function embaralhar(a) {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c;
}
function respostaAleatoria() {
  return {
    r1: BLOCOS_RANKING.map((b) => embaralhar(b)),
    r2: BLOCOS_RANKING.map((b) => embaralhar(b)),
    p1: PARES_FORCADOS.map((p) => (rnd() < 0.5 ? p.fa : p.fb)),
    p2: PARES_FORCADOS.map((p) => (rnd() < 0.5 ? p.fa : p.fb)),
  };
}

// ── itens e pesos idênticos ao legado ────────────────────────────────
test('instrumento: blocos, pares e pesos batem com a produção', { skip: !legadoDisponivel && 'cis-app.js não encontrado' }, () => {
  assert.deepEqual(BLOCOS_RANKING, puro(legado.RG), 'os 8 blocos de ranking divergiram');
  assert.deepEqual(PARES_FORCADOS, puro(legado.FP), 'os 6 pares forçados divergiram');
  assert.deepEqual(PESOS_RANKING, puro(legado.RW));
  assert.equal(PESO_PAR, legado.PW);
});

test('coeficientes das 16 características batem com a produção', { skip: !legadoDisponivel && 'cis-app.js não encontrado' }, () => {
  assert.deepEqual(Object.keys(COEFICIENTES), Object.keys(puro(legado.CC)), 'a ordem ou o conjunto de características mudou');
  for (const [nome, coefs] of Object.entries(COEFICIENTES)) {
    assert.equal(coefs.length, 9, `${nome}: esperados 9 coeficientes`);
    coefs.forEach((v, i) => {
      assert.ok(Math.abs(v - legado.CC[nome][i]) < 1e-12, `${nome}[${i}]: ${v} ≠ ${legado.CC[nome][i]}`);
    });
  }
});

// ── equivalência de cálculo ──────────────────────────────────────────
test('calcularScores é idêntico ao legado em 2000 respostas aleatórias', { skip: !legadoDisponivel && 'cis-app.js não encontrado' }, () => {
  for (let i = 0; i < 2000; i++) {
    const raw = respostaAleatoria();
    assert.deepEqual(calcularScores(raw), puro(legado.calcScores(raw)), `divergiu na resposta #${i}`);
  }
});

// ── invariantes do instrumento (valem com ou sem o legado) ───────────
test('os 4 fatores somam exatamente 200, natural e em contexto', () => {
  for (let i = 0; i < 1000; i++) {
    const s = calcularScores(respostaAleatoria());
    assert.equal(Object.values(s.disc).reduce((a, b) => a + b, 0), 200);
    assert.equal(Object.values(s.dA).reduce((a, b) => a + b, 0), 200);
  }
});

test('o total bruto do instrumento é 166', () => {
  const somaRank = PESOS_RANKING.reduce((a, b) => a + b, 0) * BLOCOS_RANKING.length;
  assert.equal(somaRank + PARES_FORCADOS.length * PESO_PAR, TOTAL_BRUTO);
});

test('as 16 características saem no intervalo 0–100', () => {
  for (let i = 0; i < 500; i++) {
    const s = calcularScores(respostaAleatoria());
    for (const [nome, v] of Object.entries(s.comp)) {
      assert.ok(v >= 0 && v <= 100, `${nome} fora de 0–100: ${v}`);
    }
  }
});

// ── camada de pilares ────────────────────────────────────────────────
test('derivarPilares entrega os 4 pilares somando 200 nos dois momentos', () => {
  const p = derivarPilares(calcularScores(respostaAleatoria()));
  assert.deepEqual(Object.keys(p).sort(), [...PILARES].sort());
  assert.equal(PILARES.reduce((a, k) => a + p[k].natural, 0), 200);
  assert.equal(PILARES.reduce((a, k) => a + p[k].emContexto, 0), 200);
});

test('o léxico cobre as 16 características, 4 por pilar, sem repetir', () => {
  const todas = PILARES.flatMap((p) => LEXICO_PILAR[p]);
  assert.equal(todas.length, 16);
  assert.equal(new Set(todas).size, 16, 'característica repetida entre pilares');
  for (const p of PILARES) assert.equal(LEXICO_PILAR[p].length, 4, `${p} não tem 4 características`);
  assert.deepEqual(new Set(todas), new Set(Object.keys(COEFICIENTES)), 'léxico e matriz discordam sobre as 16');
});

test('lerGap opera sobre pilares brutos e marca adaptação generalizada', () => {
  const pilares = {
    determinacao: { natural: 70, emContexto: 40 },
    conexao: { natural: 40, emContexto: 75 },
    constancia: { natural: 50, emContexto: 25 },
    precisao: { natural: 40, emContexto: 60 },
  };
  const g = lerGap(pilares, 20);
  assert.equal(g.porPilar.determinacao.direcao, 'abaixo');
  assert.equal(g.porPilar.conexao.direcao, 'acima');
  assert.equal(g.pilaresComGapGrande, 3);
  assert.equal(g.adaptacaoGeneralizada, true);
  assert.equal(g.coerente, false);

  const semGap = lerGap({
    determinacao: { natural: 50, emContexto: 52 },
    conexao: { natural: 50, emContexto: 48 },
    constancia: { natural: 50, emContexto: 51 },
    precisao: { natural: 50, emContexto: 49 },
  }, 20);
  assert.equal(semGap.coerente, true);
  assert.equal(semGap.adaptacaoGeneralizada, false);
});

test('nenhum rótulo de fator vaza pelos exports públicos', () => {
  const superficie = JSON.stringify({ PILARES, LEXICO_PILAR });
  for (const proibido of ['Dominância', 'Influência', 'Estabilidade', 'Conformidade', 'DISC']) {
    assert.ok(!superficie.includes(proibido), `"${proibido}" apareceu na superfície do pacote`);
  }
});

// =====================================================================
// Cálculo do instrumento comportamental.
//
// Transcrição fiel de `calcScores` em apps/diagnostic-web/public/cis-app.js.
// A equivalência é verificada por `__tests__/golden.test.js` sobre entradas
// aleatórias — inclusive o comportamento de desempate, que depende da ordem
// de inserção das chaves (D, I, S, C). Não "arrumar" a ordem sem rodar o teste.
// =====================================================================
import { PESOS_RANKING, PESO_PAR } from './instrumento.js';

// Matriz de coeficientes das 16 características.
// Vetor de entrada: [1, disc.D, disc.I, disc.S, disc.C, dA.D, dA.I, dA.S, dA.C]
export const COEFICIENTES = {
  'Ousadia':        [0.0027, 0.48532, 0.38013, -0.132, -0.193, 0.150, 0.126, 0.152, 0.112],
  'Comando':        [0.003, 0.976, -0.139, -0.151, -0.137, 0.151, 0.130, 0.130, 0.137],
  'Objetividade':   [0.003, 0.547, -0.154, -0.169, 0.360, 0.120, 0.182, 0.136, 0.145],
  'Assertividade':  [0.003, 0.418, -0.136, -0.179, 0.446, 0.138, 0.141, 0.148, 0.122],
  'Persuasão':      [0.003, -0.126, 0.947, -0.133, -0.142, 0.154, 0.144, 0.135, 0.114],
  'Extroversão':    [0.003, -0.138, 0.965, -0.150, -0.122, 0.120, 0.153, 0.138, 0.143],
  'Entusiasmo':     [0.003, -0.138, 0.984, -0.154, -0.148, 0.130, 0.131, 0.138, 0.145],
  'Sociabilidade':  [0.003, -0.162, 0.467, 0.357, -0.108, 0.120, 0.167, 0.136, 0.131],
  'Empatia':        [0.003, -0.172, 0.433, 0.404, -0.110, 0.132, 0.143, 0.141, 0.138],
  'Paciência':      [0.003, -0.153, -0.136, 0.981, -0.151, 0.096, 0.178, 0.093, 0.174],
  'Persistência':   [0.003, 0.401, -0.117, 0.440, -0.176, 0.177, 0.115, 0.171, 0.085],
  'Planejamento':   [0.003, -0.116, -0.144, 0.404, 0.430, 0.128, 0.138, 0.120, 0.186],
  'Organização':    [0.003, 0.176, -0.130, 0.222, 0.287, 0.112, 0.140, 0.109, 0.195],
  'Detalhismo':     [0.003, 0.345, -0.143, -0.135, 0.499, 0.171, 0.121, 0.151, 0.124],
  'Prudência':      [0.003, -0.171, -0.142, 0.399, 0.462, 0.137, 0.133, 0.150, 0.128],
  'Concentração':   [0.003, 0.383, -0.142, -0.142, 0.449, 0.135, 0.145, 0.142, 0.125],
};

// Fecha a soma em exatamente 200 jogando o resto no fator de maior valor.
// Empate resolvido pela ordem de inserção (D, I, S, C) — sort estável.
function fecharEm200(obj) {
  const soma = Object.values(obj).reduce((a, b) => a + b, 0);
  if (soma !== 200) {
    const maior = Object.keys(obj).sort((a, b) => obj[b] - obj[a])[0];
    obj[maior] += 200 - soma;
  }
}

/**
 * @param {{r1:Array<Array<{d:string}>>, r2:Array<Array<{d:string}>>, p1:string[], p2:string[]}} raw
 *   r1/r2 = 8 blocos ordenados (índice 0 = mais parecido). r1 é natural, r2 é em contexto.
 *   p1/p2 = 6 letras vencedoras dos pares forçados.
 * @returns {{disc:object, dA:object, lead:object, comp:object, profile:string}}
 */
export function calcularScores(raw) {
  const rankNatural = { D: 0, I: 0, S: 0, C: 0 };
  const rankContexto = { D: 0, I: 0, S: 0, C: 0 };
  raw.r1.forEach((bloco) => bloco.forEach((item, pos) => { rankNatural[item.d] += PESOS_RANKING[pos]; }));
  raw.r2.forEach((bloco) => bloco.forEach((item, pos) => { rankContexto[item.d] += PESOS_RANKING[pos]; }));

  const paresNatural = { D: 0, I: 0, S: 0, C: 0 };
  const paresContexto = { D: 0, I: 0, S: 0, C: 0 };
  raw.p1.forEach((f) => { paresNatural[f] += PESO_PAR; });
  raw.p2.forEach((f) => { paresContexto[f] += PESO_PAR; });

  // O denominador é o total do bloco NATURAL nos dois casos — é assim no
  // original. Não muda resultado (ambos somam 166), mas fica registrado.
  const somaRank = Object.values(rankNatural).reduce((a, b) => a + b, 0);
  const somaPares = Object.values(paresNatural).reduce((a, b) => a + b, 0);
  const total = somaRank + somaPares;

  const disc = {};
  const dA = {};
  for (const f of 'DISC') {
    disc[f] = Math.round((rankNatural[f] + paresNatural[f]) / total * 200);
    dA[f] = Math.round((rankContexto[f] + paresContexto[f]) / (somaRank + somaPares) * 200);
  }
  fecharEm200(disc);
  fecharEm200(dA);

  const lead = {
    Executivo: Math.round(disc.D / 2),
    Motivador: Math.round(disc.I / 2),
    'Metódico': Math.round(disc.S / 2),
    'Sistemático': Math.round(disc.C / 2),
  };

  const x = [1, disc.D, disc.I, disc.S, disc.C, dA.D, dA.I, dA.S, dA.C];
  const comp = {};
  for (const [nome, coefs] of Object.entries(COEFICIENTES)) {
    let v = 0;
    for (let i = 0; i < coefs.length; i++) v += coefs[i] * x[i];
    comp[nome] = Math.round(Math.min(100, Math.max(0, v)));
  }

  const ordenado = Object.entries(disc).sort((a, b) => b[1] - a[1]);
  const profile = ordenado.filter(([, v]) => v >= 50).map(([k]) => k).join('') || ordenado[0][0];

  return { disc, dA, lead, comp, profile };
}

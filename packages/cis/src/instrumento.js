// =====================================================================
// Instrumento comportamental — itens e pesos.
//
// Fonte de verdade: este arquivo. Enquanto `apps/diagnostic-web/public/
// cis-app.js` mantiver a sua própria cópia (ver README), a equivalência
// entre os dois é garantida pelo teste `__tests__/golden.test.js`, que
// falha se qualquer um dos dois lados for editado isoladamente.
//
// Cada bloco de ranking é respondido DUAS vezes: natural (r1/p1) e em
// contexto (r2/p2). É daí que sai a leitura de gap do relatório.
// =====================================================================

// 8 blocos de ranking — o respondente ordena as 4 palavras.
export const BLOCOS_RANKING = [
  [{ l: 'Direcionador(a)', d: 'D' }, { l: 'Cativante', d: 'I' }, { l: 'Criterioso(a)', d: 'C' }, { l: 'Constante', d: 'S' }],
  [{ l: 'Acolhedor(a)', d: 'S' }, { l: 'Articulado(a)', d: 'I' }, { l: 'Incisivo(a)', d: 'D' }, { l: 'Minucioso(a)', d: 'C' }],
  [{ l: 'Racional', d: 'C' }, { l: 'Animado(a)', d: 'I' }, { l: 'Tolerante', d: 'S' }, { l: 'Firme', d: 'D' }],
  [{ l: 'Motivador(a)', d: 'I' }, { l: 'Metódico(a)', d: 'C' }, { l: 'Realizador(a)', d: 'D' }, { l: 'Resiliente', d: 'S' }],
  [{ l: 'Objetivo(a)', d: 'D' }, { l: 'Adaptável', d: 'I' }, { l: 'Equilibrado(a)', d: 'S' }, { l: 'Rigoroso(a)', d: 'C' }],
  [{ l: 'Estruturado(a)', d: 'C' }, { l: 'Sereno(a)', d: 'S' }, { l: 'Proativo(a)', d: 'D' }, { l: 'Vibrante', d: 'I' }],
  [{ l: 'Comunicativo(a)', d: 'I' }, { l: 'Analítico(a)', d: 'C' }, { l: 'Colaborativo(a)', d: 'S' }, { l: 'Decidido(a)', d: 'D' }],
  [{ l: 'Destemido(a)', d: 'D' }, { l: 'Cauteloso(a)', d: 'C' }, { l: 'Envolvente', d: 'I' }, { l: 'Perseverante', d: 'S' }],
];

// 6 pares forçados — o respondente escolhe um dos dois lados.
export const PARES_FORCADOS = [
  { a: 'Prefiro agir rápido e resolver', fa: 'D', b: 'Prefiro envolver as pessoas antes de agir', fb: 'I' },
  { a: 'Gosto de mudar o que não funciona', fa: 'D', b: 'Prefiro manter o que já está funcionando', fb: 'S' },
  { a: 'Tomo decisões com o que tenho disponível', fa: 'D', b: 'Analiso todos os dados antes de decidir', fb: 'C' },
  { a: 'Gosto de conhecer pessoas novas', fa: 'I', b: 'Prefiro aprofundar relações que já tenho', fb: 'S' },
  { a: 'Improviso bem quando o plano muda', fa: 'I', b: 'Me sinto melhor com uma rotina definida', fb: 'C' },
  { a: 'Priorizo o bem-estar da equipe', fa: 'S', b: 'Priorizo a qualidade da entrega', fb: 'C' },
];

// Pesos por posição no ranking (1ª → 4ª) e peso de cada par forçado.
export const PESOS_RANKING = [10, 6, 3, 1];
export const PESO_PAR = 1;

// Constante do instrumento: 8 blocos × (10+6+3+1) + 6 pares × 1 = 166.
// É o divisor que normaliza os 4 fatores para somar 200.
export const TOTAL_BRUTO = 166;

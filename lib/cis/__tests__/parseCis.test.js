// lib/cis/__tests__/parseCis.test.js
// Roda com: node lib/cis/__tests__/parseCis.test.js
// (Sem framework — asserts mínimos para evitar dependência de jest.)

import assert from 'node:assert/strict';
import { getCisParsed, aggregateCisByProject, COMPETENCIAS_KEYS } from '../parseCis.js';

let passed = 0, failed = 0;
const test = (name, fn) => {
  try { fn(); console.log(`ok   — ${name}`); passed++; }
  catch (e) { console.error(`fail — ${name}\n     ${e.message}`); failed++; }
};

// Formato real do banco (auditoria 2026-04-22)
const realistic = {
  id: 'abc-123',
  perfil_label: 'DI',
  nome: 'Ana Teste',
  scores_json: {
    disc: { D: 70, I: 50, S: 20, C: 10 },
    dA:   { D: 65, I: 45, S: 30, C: 15 },
    comp: {
      Ousadia: 80, Comando: 75, Objetividade: 70, Assertividade: 65,
      Empatia: 40, 'Paciência': 35, 'Persistência': 85, Planejamento: 60,
      'Persuasão': 55, 'Extroversão': 70, Entusiasmo: 65, Sociabilidade: 60,
      'Organização': 75, Detalhismo: 50, 'Prudência': 45, 'Concentração': 70,
    },
    lead: { Executivo: 30, Motivador: 25, 'Metódico': 15, 'Sistemático': 12 },
    profile: 'DI',
  },
};

test('schema completo a partir do formato real do banco', () => {
  const r = getCisParsed(realistic);
  assert.equal(r.disc.D, 70);
  assert.equal(r.disc.dominante, 'D');
  assert.equal(r.disc_adaptado.D, 65);
  assert.equal(r.competencias.ousadia, 80);
  assert.equal(r.competencias.paciencia, 35);       // normalização de acento
  assert.equal(r.competencias.persuasao, 55);
  assert.equal(r.competencias.organizacao, 75);
  assert.equal(r.estilo_lideranca, 'Executivo');    // derivado do maior score de lead
  assert.equal(r.perfil_label, 'DI');
  assert.equal(r.meta.completo, true);
  assert.equal(r.meta.assessment_id, 'abc-123');
  assert.equal(r.meta.participante_nome, 'Ana Teste');
});

test('dados parciais: DISC sem S e C', () => {
  const r = getCisParsed({ id: 'x', scores_json: { disc: { D: 50, I: 50 } } });
  assert.equal(r.disc.S, null);
  assert.equal(r.disc.C, null);
  assert.equal(r.meta.completo, false);
  assert.equal(r.competencias.ousadia, null);
});

test('null/undefined retorna null', () => {
  assert.equal(getCisParsed(null), null);
  assert.equal(getCisParsed(undefined), null);
});

test('estilo de liderança aceita string direta com acento', () => {
  const r = getCisParsed({
    id: 'y',
    scores_json: { estilo_lideranca: 'Metódico', disc: { D: 1, I: 1, S: 1, C: 1 } },
  });
  assert.equal(r.estilo_lideranca, 'Metodico');
});

test('estilo "Executor" (spec antiga) é mapeado para "Executivo"', () => {
  const r = getCisParsed({ id: 'z', scores_json: { estilo_lideranca: 'Executor' } });
  assert.equal(r.estilo_lideranca, 'Executivo');
});

test('tipo Jung direto como string "ENTJ"', () => {
  const r = getCisParsed({ id: 'j', scores_json: { jung: { tipo: 'entj' } } });
  assert.equal(r.jung.tipo, 'ENTJ');
  assert.equal(r.jung.extroversao_introversao, 'E');
  assert.equal(r.jung.julgamento_percepcao, 'J');
});

test('aggregateCisByProject com 2 completos', () => {
  const makeAss = (d, base) => ({
    id: 'id' + d,
    scores_json: {
      disc: { D: d, I: 100 - d, S: 50, C: 50 },
      comp: Object.fromEntries(
        ['Ousadia','Comando','Objetividade','Assertividade','Empatia','Paciência',
         'Persistência','Planejamento','Persuasão','Extroversão','Entusiasmo',
         'Sociabilidade','Organização','Detalhismo','Prudência','Concentração']
          .map(k => [k, base])
      ),
      lead: { Executivo: 30, Motivador: 10, 'Metódico': 10, 'Sistemático': 10 },
    },
  });
  const agg = aggregateCisByProject([makeAss(80, 80), makeAss(20, 40)]);
  assert.equal(agg.total, 2);
  assert.equal(agg.completos, 2);
  assert.equal(agg.disc_coletivo.D, 50);              // (80+20)/2
  assert.equal(agg.competencias_coletivas.ousadia, 60); // (80+40)/2
  assert.equal(agg.estilos_distribuicao.Executivo, 2);
});

test('aggregateCisByProject com array vazio', () => {
  const agg = aggregateCisByProject([]);
  assert.equal(agg.total, 0);
  assert.equal(agg.completos, 0);
  assert.equal(agg.disc_coletivo, null);
  assert.equal(agg.competencias_coletivas, null);
});

test('16 chaves de competência no schema', () => {
  assert.equal(COMPETENCIAS_KEYS.length, 16);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

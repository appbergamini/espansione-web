import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCuratedEvidencePack,
  getLatestCuratedEvidencePack,
  getReadyCuratedEvidencePack,
  markCuratedEvidencePackReady,
  updateCuratedEvidencePack,
} from '../../curated-evidence/pack.js';
import { Agent_06_VisaoGeral } from '../Agent_06_VisaoGeral.js';

test('cria CuratedEvidencePack', async () => {
  const db = new FakeDb();
  const pack = await createCuratedEvidencePack(db, makePack());

  assert.equal(pack.project_id, 'project-1');
  assert.equal(pack.status, 'draft');
  assert.equal(pack.strong_evidence.length, 1);
});

test('edita CuratedEvidencePack', async () => {
  const db = new FakeDb();
  const pack = await createCuratedEvidencePack(db, makePack());
  const edited = await updateCuratedEvidencePack(db, pack.id, {
    ...pack,
    weak_evidence: [{
      title: 'Prova ainda fraca',
      description: 'Falta fonte externa.',
      source_lens: 'vm',
      evidence_strength: 'weak',
    }],
  });

  assert.equal(edited.weak_evidence.length, 1);
  assert.equal(edited.weak_evidence[0].source_lens, 'vm');
});

test('marca CuratedEvidencePack como ready_for_agent_6', async () => {
  const db = new FakeDb();
  const pack = await createCuratedEvidencePack(db, makePack());
  const ready = await markCuratedEvidencePackReady(db, pack.id);

  assert.equal(ready.status, 'ready_for_agent_6');
  assert.equal((await getReadyCuratedEvidencePack(db, 'project-1')).id, pack.id);
});

test('Agente 6 recebe pack no contexto', () => {
  const prompt = Agent_06_VisaoGeral.getUserPrompt({
    projeto: { cliente: 'Marca Teste' },
    previousOutputs: makePreviousOutputs(),
    curatedEvidencePack: {
      ...makePack(),
      status: 'ready_for_agent_6',
      contradictions: [{
        title: 'Divergencia de velocidade',
        vi_signal: 'Time pede ritmo cuidadoso',
        ve_signal: 'Cliente quer entregas rápidas',
        why_it_matters: 'A promessa precisa preservar a tensão.',
        should_preserve_for_strategy: true,
      }],
    },
  });

  assert.match(prompt, /CURADORIA VI\/VE\/VM/);
  assert.match(prompt, /Divergencia de velocidade/);
  assert.match(prompt, /Preserve contradições/);
});

test('Agente 6 mantém fallback quando pack não existe', () => {
  const prompt = Agent_06_VisaoGeral.getUserPrompt({
    projeto: { cliente: 'Marca Teste' },
    previousOutputs: makePreviousOutputs(),
  });

  assert.match(prompt, /CURADORIA VI\/VE\/VM — NÃO DISPONÍVEL/);
});

test('outputs antigos continuam funcionando ao buscar pack inexistente', async () => {
  const db = new FakeDb();
  const pack = await getLatestCuratedEvidencePack(db, 'project-old');

  assert.equal(pack, null);
});

function makePack() {
  return {
    project_id: 'project-1',
    source_outputs: {
      vi_output_id: 'output-2',
      ve_output_id: 'output-4',
      vm_output_id: 'output-5',
    },
    strong_evidence: [{
      title: 'Evidencia forte',
      description: 'Sinal convergente em VI.',
      source_lens: 'vi',
      evidence_strength: 'strong',
    }],
    weak_evidence: [],
    contradictions: [],
    evidence_gaps: ['Falta prova numerica.'],
    sensitive_points: [],
    unresolved_questions: [],
    assumptions_to_validate: [],
    curator_notes: 'Nota humana',
    status: 'draft',
  };
}

function makePreviousOutputs() {
  return {
    2: { conteudo: 'VI analitica', resumo_executivo: 'Resumo VI', conclusoes: 'Conclusao VI' },
    4: { conteudo: 'VE analitica', resumo_executivo: 'Resumo VE', conclusoes: 'Conclusao VE' },
    5: { conteudo: 'VM analitica', resumo_executivo: 'Resumo VM', conclusoes: 'Conclusao VM' },
  };
}

class FakeDb {
  constructor() {
    this.tables = { curated_evidence_packs: [] };
    this.seq = 1;
  }

  from(table) {
    if (!this.tables[table]) this.tables[table] = [];
    return new FakeQuery(this, table);
  }
}

class FakeQuery {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.action = 'select';
    this.payload = null;
    this.filters = [];
    this.notFilters = [];
    this.singleMode = false;
    this.limitCount = null;
    this.orderBy = null;
  }

  select() { return this; }
  insert(payload) { this.action = 'insert'; this.payload = payload; return this; }
  update(payload) { this.action = 'update'; this.payload = payload; return this; }
  eq(key, value) { this.filters.push({ key, value }); return this; }
  neq(key, value) { this.notFilters.push({ key, value }); return this; }
  order(key, options = {}) { this.orderBy = { key, ascending: options.ascending !== false }; return this; }
  limit(value) { this.limitCount = value; return this; }
  single() { this.singleMode = true; return this; }
  then(resolve, reject) { return Promise.resolve(this.execute()).then(resolve, reject); }

  execute() {
    if (this.action === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = rows.map((row) => ({
        id: row.id || `pack-${this.db.seq++}`,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
        ...row,
      }));
      this.db.tables[this.table].push(...inserted);
      return this.format(inserted);
    }

    if (this.action === 'update') {
      const rows = this.applyFilters(this.db.tables[this.table]);
      for (const row of rows) Object.assign(row, this.payload);
      return this.format(rows);
    }

    let rows = this.applyFilters(this.db.tables[this.table]);
    if (this.orderBy) {
      const { key, ascending } = this.orderBy;
      rows = [...rows].sort((a, b) => ((a[key] > b[key] ? 1 : -1) * (ascending ? 1 : -1)));
    }
    if (this.limitCount != null) rows = rows.slice(0, this.limitCount);
    return this.format(rows);
  }

  applyFilters(rows) {
    return rows.filter((row) => (
      this.filters.every((filter) => row[filter.key] === filter.value)
      && this.notFilters.every((filter) => row[filter.key] !== filter.value)
    ));
  }

  format(rows) {
    if (this.singleMode) return { data: rows[0] || null, error: rows[0] ? null : { message: 'No rows' } };
    return { data: rows, error: null };
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCKING_CHECKPOINT_STATUSES,
  checkpointDecisionToStatus,
  formatCheckpointNotesForPrompt,
  getRelevantCheckpointApprovalRecords,
  normalizeStructuredCheckpointNotes,
  recordFromCheckpoint,
} from '../../checkpoints/structuredNotes.js';

test('aprovar checkpoint com notas estruturadas normaliza arrays', () => {
  const notes = normalizeStructuredCheckpointNotes({
    approved_points: ['Direção geral aprovada', ''],
    risks_to_monitor: 'Risco de promessa ampla\nRisco operacional',
  });

  assert.deepEqual(notes.approved_points, ['Direção geral aprovada']);
  assert.deepEqual(notes.risks_to_monitor, ['Risco de promessa ampla', 'Risco operacional']);
});

test('approved_with_notes libera proximo agente', () => {
  assert.equal(checkpointDecisionToStatus('approved_with_notes'), 'aprovado_com_ressalvas');
  assert.equal(BLOCKING_CHECKPOINT_STATUSES.includes('aprovado_com_ressalvas'), false);
});

test('revision_requested bloqueia proximo agente', () => {
  assert.equal(checkpointDecisionToStatus('revision_requested'), 'revisao_solicitada');
  assert.equal(BLOCKING_CHECKPOINT_STATUSES.includes('revisao_solicitada'), true);
});

test('notas estruturadas aparecem no contexto do agente seguinte', () => {
  const prompt = formatCheckpointNotesForPrompt([
    {
      decision: 'approved_with_notes',
      checkpoints: { checkpoint_num: 1 },
      structured_notes: {
        approved_points: ['Direção geral aprovada'],
        points_with_reservations: ['Evitar prometer escala antes de resolver operação'],
        required_adjustments: [],
        pending_decisions: ['Validar rota premium vs escala'],
        context_for_next_agents: ['Agentes 7, 8 e 9 devem preservar a ressalva'],
        risks_to_monitor: ['Risco de desalinhamento entre promessa e entrega'],
      },
      freeform_notes: 'Nota livre',
    },
  ]);

  assert.match(prompt, /Checkpoint 1/);
  assert.match(prompt, /Direção geral aprovada/);
  assert.match(prompt, /Agentes 7, 8 e 9/);
  assert.match(prompt, /Nota livre/);
});

test('checkpoints antigos sem structured_notes continuam funcionando', () => {
  const prompt = formatCheckpointNotesForPrompt([
    {
      decision: 'approved',
      checkpoints: { checkpoint_num: 1 },
      structured_notes: null,
      freeform_notes: '',
    },
  ]);

  assert.equal(prompt, '');
});

test('fallback le notas estruturadas serializadas em checkpoints.notas', () => {
  const record = recordFromCheckpoint({
    id: 'checkpoint-1',
    projeto_id: 'project-1',
    checkpoint_num: 1,
    status: 'aprovado_com_ressalvas',
    notas: JSON.stringify({
      decision: 'approved_with_notes',
      structured_notes: { context_for_next_agents: ['Preservar ressalva'] },
      freeform_notes: 'Observação',
    }),
    created_at: '2026-05-18T00:00:00.000Z',
  });

  assert.equal(record.decision, 'approved_with_notes');
  assert.deepEqual(record.structured_notes.context_for_next_agents, ['Preservar ressalva']);
  assert.equal(record.freeform_notes, 'Observação');
});

test('busca somente checkpoints relevantes para agente posterior', async () => {
  const db = new FakeCheckpointDb();
  const records = await getRelevantCheckpointApprovalRecords(db, 'project-1', 7);

  assert.equal(records.length, 1);
  assert.equal(records[0].checkpoints.checkpoint_num, 1);
});

class FakeCheckpointDb {
  from(table) {
    assert.equal(table, 'checkpoint_approval_records');
    return new FakeQuery();
  }
}

class FakeQuery {
  constructor() {
    this.filters = {};
  }

  select() {
    return this;
  }

  eq(field, value) {
    this.filters[field] = value;
    return this;
  }

  in(field, value) {
    this.filters[field] = value;
    return this;
  }

  order() {
    const checkpointNums = this.filters['checkpoints.checkpoint_num'] || [];
    const all = [
      {
        project_id: 'project-1',
        decision: 'approved_with_notes',
        checkpoints: { checkpoint_num: 1 },
        structured_notes: { context_for_next_agents: ['Preservar ressalva'] },
      },
      {
        project_id: 'project-1',
        decision: 'approved_with_notes',
        checkpoints: { checkpoint_num: 2 },
        structured_notes: { context_for_next_agents: ['Ainda nao entra'] },
      },
    ];
    return Promise.resolve({
      data: all.filter((record) => checkpointNums.includes(record.checkpoints.checkpoint_num)),
      error: null,
    });
  }
}

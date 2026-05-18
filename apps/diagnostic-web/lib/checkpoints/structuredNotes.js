export const CHECKPOINT_DECISIONS = {
  approved: 'approved',
  approved_with_notes: 'approved_with_notes',
  revision_requested: 'revision_requested',
  rejected: 'rejected',
};

export const EMPTY_STRUCTURED_CHECKPOINT_NOTES = {
  approved_points: [],
  points_with_reservations: [],
  required_adjustments: [],
  pending_decisions: [],
  context_for_next_agents: [],
  risks_to_monitor: [],
};

export const BLOCKING_CHECKPOINT_STATUSES = ['pendente', 'revisao_solicitada', 'rejeitado'];

const CHECKPOINT_CONTEXT_BY_AGENT = {
  7: [1],
  8: [1],
  9: [1],
  10: [2],
  11: [2],
  12: [2, 3],
  13: [2, 3],
  16: [4],
};

const DECISION_TO_STATUS = {
  approved: 'aprovado',
  approved_with_notes: 'aprovado_com_ressalvas',
  revision_requested: 'revisao_solicitada',
  rejected: 'rejeitado',
};

const STATUS_TO_DECISION = {
  aprovado: 'approved',
  aprovado_com_ressalvas: 'approved_with_notes',
  revisao_solicitada: 'revision_requested',
  rejeitado: 'rejected',
};

export function normalizeCheckpointDecision(value) {
  if (value === 'aprovado') return 'approved';
  if (value === 'aprovado_com_ressalvas') return 'approved_with_notes';
  if (value === 'revisao_solicitada') return 'revision_requested';
  if (value === 'rejeitado') return 'rejected';
  if (Object.values(CHECKPOINT_DECISIONS).includes(value)) return value;
  return 'approved';
}

export function checkpointDecisionToStatus(decision) {
  return DECISION_TO_STATUS[normalizeCheckpointDecision(decision)] || 'aprovado';
}

export function checkpointStatusToDecision(status) {
  return STATUS_TO_DECISION[status] || 'approved';
}

export function normalizeStructuredCheckpointNotes(input = {}) {
  return Object.fromEntries(
    Object.keys(EMPTY_STRUCTURED_CHECKPOINT_NOTES).map((key) => [
      key,
      normalizeStringArray(input?.[key]),
    ])
  );
}

export function hasStructuredCheckpointNotes(notes) {
  const normalized = normalizeStructuredCheckpointNotes(notes);
  return Object.values(normalized).some((items) => items.length > 0);
}

export function parseStructuredNotesForm(form = {}) {
  return normalizeStructuredCheckpointNotes({
    approved_points: parseTextLines(form.approvedPoints),
    points_with_reservations: parseTextLines(form.pointsWithReservations),
    required_adjustments: parseTextLines(form.requiredAdjustments),
    pending_decisions: parseTextLines(form.pendingDecisions),
    context_for_next_agents: parseTextLines(form.contextForNextAgents),
    risks_to_monitor: parseTextLines(form.risksToMonitor),
  });
}

export function buildStructuredNotesForm(notes = EMPTY_STRUCTURED_CHECKPOINT_NOTES) {
  const normalized = normalizeStructuredCheckpointNotes(notes);
  return {
    approvedPoints: normalized.approved_points.join('\n'),
    pointsWithReservations: normalized.points_with_reservations.join('\n'),
    requiredAdjustments: normalized.required_adjustments.join('\n'),
    pendingDecisions: normalized.pending_decisions.join('\n'),
    contextForNextAgents: normalized.context_for_next_agents.join('\n'),
    risksToMonitor: normalized.risks_to_monitor.join('\n'),
  };
}

export async function getRelevantCheckpointApprovalRecords(db, projectId, agentNum) {
  const checkpointNums = CHECKPOINT_CONTEXT_BY_AGENT[Number(agentNum)] || [];
  if (!db || !projectId || checkpointNums.length === 0) return [];

  const { data, error } = await db
    .from('checkpoint_approval_records')
    .select('*, checkpoints!inner(checkpoint_num)')
    .eq('project_id', projectId)
    .in('checkpoints.checkpoint_num', checkpointNums)
    .in('decision', ['approved_with_notes', 'revision_requested', 'rejected'])
    .order('created_at', { ascending: true });

  if (error) {
    if (String(error.message || '').includes('checkpoint_approval_records')) {
      return getCheckpointRecordsFromLegacyCheckpoints(db, projectId, checkpointNums);
    }
    throw error;
  }

  return data || [];
}

export async function getAllCheckpointApprovalRecordsForProject(db, projectId) {
  if (!db || !projectId) return [];

  const { data, error } = await db
    .from('checkpoint_approval_records')
    .select('*, checkpoints!inner(checkpoint_num)')
    .eq('project_id', projectId)
    .in('decision', ['approved_with_notes', 'revision_requested', 'rejected'])
    .order('created_at', { ascending: true });

  if (error) {
    if (String(error.message || '').includes('checkpoint_approval_records')) {
      return getCheckpointRecordsFromLegacyCheckpoints(db, projectId, [1, 2, 3, 4]);
    }
    throw error;
  }

  return data || [];
}

export function formatCheckpointNotesForPrompt(records = []) {
  const relevant = records.filter((record) => {
    const notes = normalizeStructuredCheckpointNotes(record.structured_notes);
    return record.decision !== 'approved' || hasStructuredCheckpointNotes(notes) || record.freeform_notes;
  });

  if (relevant.length === 0) return '';

  const lines = [
    '## Ressalvas estruturadas de checkpoints humanos',
    'Use estas notas como contexto de revisão humana. Elas não substituem os outputs dos agentes, mas orientam decisões posteriores.',
  ];

  for (const record of relevant) {
    const checkpointNum = record.checkpoints?.checkpoint_num || record.checkpoint_num || '?';
    const notes = normalizeStructuredCheckpointNotes(record.structured_notes);
    lines.push('');
    lines.push(`### Checkpoint ${checkpointNum} — ${record.decision}`);
    appendNoteGroup(lines, 'Pontos aprovados', notes.approved_points);
    appendNoteGroup(lines, 'Pontos com ressalva', notes.points_with_reservations);
    appendNoteGroup(lines, 'Ajustes obrigatorios', notes.required_adjustments);
    appendNoteGroup(lines, 'Decisoes pendentes', notes.pending_decisions);
    appendNoteGroup(lines, 'Contexto para proximos agentes', notes.context_for_next_agents);
    appendNoteGroup(lines, 'Riscos a monitorar', notes.risks_to_monitor);
    if (record.freeform_notes) lines.push(`- Observacao livre: ${record.freeform_notes}`);
  }

  return lines.join('\n');
}

function appendNoteGroup(lines, label, items) {
  if (!items || items.length === 0) return;
  lines.push(`- ${label}:`);
  for (const item of items) lines.push(`  - ${item}`);
}

async function getCheckpointRecordsFromLegacyCheckpoints(db, projectId, checkpointNums) {
  const { data, error } = await db
    .from('checkpoints')
    .select('*')
    .eq('projeto_id', projectId)
    .in('checkpoint_num', checkpointNums)
    .in('status', ['aprovado_com_ressalvas', 'revisao_solicitada', 'rejeitado'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(recordFromCheckpoint).filter(Boolean);
}

export function recordFromCheckpoint(checkpoint) {
  const parsed = parseCheckpointNotesField(checkpoint?.notas);
  if (!parsed) return null;

  return {
    checkpoint_id: checkpoint.id,
    project_id: checkpoint.projeto_id,
    agent_id: String(checkpoint.checkpoint_num),
    decision: parsed.decision || checkpointStatusToDecision(checkpoint.status),
    structured_notes: normalizeStructuredCheckpointNotes(parsed.structured_notes),
    freeform_notes: parsed.freeform_notes || '',
    created_at: checkpoint.created_at,
    updated_at: checkpoint.updated_at || checkpoint.created_at,
    checkpoints: { checkpoint_num: checkpoint.checkpoint_num },
  };
}

export function parseCheckpointNotesField(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      decision: normalizeCheckpointDecision(parsed.decision),
      structured_notes: normalizeStructuredCheckpointNotes(parsed.structured_notes),
      freeform_notes: typeof parsed.freeform_notes === 'string' ? parsed.freeform_notes : '',
    };
  } catch {
    return {
      decision: null,
      structured_notes: normalizeStructuredCheckpointNotes(),
      freeform_notes: value,
    };
  }
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') return parseTextLines(value);
  return [];
}

function parseTextLines(value) {
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

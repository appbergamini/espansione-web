const LENSES = new Set(['vi', 've', 'vm']);
const STRENGTHS = new Set(['strong', 'medium', 'weak']);

export function normalizeCuratedEvidencePack(rowOrPack) {
  if (!rowOrPack) return null;
  const content = rowOrPack.content_json || rowOrPack;
  return {
    id: rowOrPack.id,
    project_id: rowOrPack.project_id || content.project_id || '',
    source_outputs: {
      vi_output_id: rowOrPack.vi_output_id || content.source_outputs?.vi_output_id || undefined,
      ve_output_id: rowOrPack.ve_output_id || content.source_outputs?.ve_output_id || undefined,
      vm_output_id: rowOrPack.vm_output_id || content.source_outputs?.vm_output_id || undefined,
    },
    strong_evidence: normalizeEvidenceItems(content.strong_evidence, 'strong'),
    weak_evidence: normalizeEvidenceItems(content.weak_evidence, 'weak'),
    contradictions: normalizeContradictions(content.contradictions),
    evidence_gaps: normalizeStringArray(content.evidence_gaps),
    sensitive_points: normalizeStringArray(content.sensitive_points),
    unresolved_questions: normalizeStringArray(content.unresolved_questions),
    assumptions_to_validate: normalizeStringArray(content.assumptions_to_validate),
    curator_notes: typeof content.curator_notes === 'string' ? content.curator_notes : '',
    status: normalizeStatus(rowOrPack.status || content.status),
    created_at: rowOrPack.created_at,
    updated_at: rowOrPack.updated_at,
  };
}

export function buildCuratedEvidenceContent(input) {
  const normalized = normalizeCuratedEvidencePack(input);
  return {
    project_id: normalized.project_id,
    source_outputs: normalized.source_outputs,
    strong_evidence: normalized.strong_evidence,
    weak_evidence: normalized.weak_evidence,
    contradictions: normalized.contradictions,
    evidence_gaps: normalized.evidence_gaps,
    sensitive_points: normalized.sensitive_points,
    unresolved_questions: normalized.unresolved_questions,
    assumptions_to_validate: normalized.assumptions_to_validate,
    curator_notes: normalized.curator_notes || '',
    status: normalized.status,
  };
}

export function isCuratedEvidencePackReady(pack) {
  return normalizeCuratedEvidencePack(pack)?.status === 'ready_for_agent_6';
}

export function buildAgent6CuratedEvidenceContext(pack) {
  const normalized = normalizeCuratedEvidencePack(pack);
  if (!normalized) return '';
  return [
    '=== CURADORIA VI/VE/VM — PACOTE HUMANO ANTES DO AGENTE 6 ===',
    `Status: ${normalized.status}`,
    '',
    'Evidencias fortes:',
    JSON.stringify(normalized.strong_evidence, null, 2),
    '',
    'Evidencias fracas ou a tratar como hipotese:',
    JSON.stringify(normalized.weak_evidence, null, 2),
    '',
    'Contradicoes que devem ser preservadas:',
    JSON.stringify(normalized.contradictions, null, 2),
    '',
    `Lacunas de evidencia: ${JSON.stringify(normalized.evidence_gaps)}`,
    `Pontos sensiveis: ${JSON.stringify(normalized.sensitive_points)}`,
    `Perguntas em aberto: ${JSON.stringify(normalized.unresolved_questions)}`,
    `Hipoteses a validar: ${JSON.stringify(normalized.assumptions_to_validate)}`,
    normalized.curator_notes ? `Notas da curadoria: ${normalized.curator_notes}` : '',
  ].filter(Boolean).join('\n');
}

export async function createCuratedEvidencePack(db, pack) {
  const content = buildCuratedEvidenceContent(pack);
  const { data, error } = await db
    .from('curated_evidence_packs')
    .insert([{
      project_id: content.project_id,
      vi_output_id: content.source_outputs.vi_output_id || null,
      ve_output_id: content.source_outputs.ve_output_id || null,
      vm_output_id: content.source_outputs.vm_output_id || null,
      content_json: content,
      status: content.status,
    }])
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return normalizeCuratedEvidencePack(data);
}

export async function updateCuratedEvidencePack(db, id, patch) {
  const content = buildCuratedEvidenceContent(patch);
  const { data, error } = await db
    .from('curated_evidence_packs')
    .update({
      vi_output_id: content.source_outputs.vi_output_id || null,
      ve_output_id: content.source_outputs.ve_output_id || null,
      vm_output_id: content.source_outputs.vm_output_id || null,
      content_json: content,
      status: content.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return normalizeCuratedEvidencePack(data);
}

export async function markCuratedEvidencePackReady(db, id) {
  const { data: current, error: loadError } = await db
    .from('curated_evidence_packs')
    .select('*')
    .eq('id', id)
    .single();
  if (loadError) throw new Error(loadError.message);

  const content = buildCuratedEvidenceContent({
    ...normalizeCuratedEvidencePack(current),
    status: 'ready_for_agent_6',
  });

  const { data, error } = await db
    .from('curated_evidence_packs')
    .update({
      content_json: content,
      status: 'ready_for_agent_6',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return normalizeCuratedEvidencePack(data);
}

export async function getLatestCuratedEvidencePack(db, projectId) {
  const { data, error } = await db
    .from('curated_evidence_packs')
    .select('*')
    .eq('project_id', projectId)
    .neq('status', 'archived')
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return normalizeCuratedEvidencePack(data?.[0] || null);
}

export async function getReadyCuratedEvidencePack(db, projectId) {
  const { data, error } = await db
    .from('curated_evidence_packs')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'ready_for_agent_6')
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return normalizeCuratedEvidencePack(data?.[0] || null);
}

function normalizeEvidenceItems(items, fallbackStrength) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      title: String(item?.title || '').trim(),
      description: String(item?.description || '').trim(),
      source_lens: LENSES.has(item?.source_lens) ? item.source_lens : 'vi',
      source_reference: item?.source_reference ? String(item.source_reference).trim() : undefined,
      evidence_strength: STRENGTHS.has(item?.evidence_strength) ? item.evidence_strength : fallbackStrength,
    }))
    .filter((item) => item.title || item.description);
}

function normalizeContradictions(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      title: String(item?.title || '').trim(),
      vi_signal: item?.vi_signal ? String(item.vi_signal).trim() : undefined,
      ve_signal: item?.ve_signal ? String(item.ve_signal).trim() : undefined,
      vm_signal: item?.vm_signal ? String(item.vm_signal).trim() : undefined,
      why_it_matters: String(item?.why_it_matters || '').trim(),
      should_preserve_for_strategy: item?.should_preserve_for_strategy !== false,
    }))
    .filter((item) => item.title || item.vi_signal || item.ve_signal || item.vm_signal || item.why_it_matters);
}

function normalizeStringArray(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

function normalizeStatus(status) {
  return ['draft', 'ready_for_agent_6', 'archived'].includes(status) ? status : 'draft';
}

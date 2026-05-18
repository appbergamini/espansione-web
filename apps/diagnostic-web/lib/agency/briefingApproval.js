export async function getApprovedBriefing(db, requestId) {
  const request = await getAgencyRequest(db, requestId);
  if (!isBriefingApprovedRequest(request)) {
    return null;
  }
  return request.approved_briefing_json;
}

export async function assertBriefingApproved(db, requestId) {
  const request = await getAgencyRequest(db, requestId);
  if (!isBriefingApprovedRequest(request)) {
    const err = new Error('Briefing operacional precisa ser aprovado antes da geração criativa.');
    err.statusCode = 409;
    err.requestStatus = request.status;
    throw err;
  }
  return {
    request,
    approvedBriefing: request.approved_briefing_json,
  };
}

export async function approveAgencyBriefing(db, requestId, { editedBriefing, approvedBy } = {}) {
  const request = await getAgencyRequest(db, requestId);
  const accountStep = await getLatestAccountDirectorStep(db, requestId);
  const originalBriefing = request.briefing_original_json || getStepPayload(accountStep);
  const hasEditedBriefing = isObjectWithKeys(editedBriefing);
  const approvedBriefing = hasEditedBriefing ? editedBriefing : originalBriefing;

  if (!isObjectWithKeys(approvedBriefing)) {
    const err = new Error('Não existe briefing gerado para aprovar.');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('agency_requests')
    .update({
      briefing_original_json: originalBriefing,
      approved_briefing_json: approvedBriefing,
      briefing_source: hasEditedBriefing ? 'admin_edited' : 'ai',
      briefing_approved_at: new Date().toISOString(),
      briefing_approved_by: approvedBy || null,
      briefing_revision_reason: null,
      status: 'briefing_approved',
    })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function requestAgencyBriefingRevision(db, requestId, reason) {
  const cleanReason = String(reason || '').trim();
  if (!cleanReason) {
    const err = new Error('Informe o motivo da revisão do briefing.');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('agency_requests')
    .update({
      status: 'briefing_revision_requested',
      briefing_revision_reason: cleanReason,
    })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export function isBriefingApprovedRequest(request) {
  return !!request?.approved_briefing_json
    && !['draft', 'briefing_pending', 'briefing_generated', 'briefing_revision_requested'].includes(request.status);
}

export async function saveGeneratedBriefing(db, requestId, briefing) {
  if (!isObjectWithKeys(briefing)) {
    const err = new Error('Account Director não retornou briefing estruturado.');
    err.statusCode = 500;
    throw err;
  }

  const { data, error } = await db
    .from('agency_requests')
    .update({
      briefing_original_json: briefing,
      approved_briefing_json: null,
      briefing_source: null,
      briefing_revision_reason: null,
      briefing_generated_at: new Date().toISOString(),
      briefing_approved_at: null,
      briefing_approved_by: null,
      status: 'briefing_generated',
    })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getAgencyRequest(db, requestId) {
  if (!requestId) {
    const err = new Error('requestId obrigatório');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await db
    .from('agency_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err = new Error('Pedido não encontrado');
    err.statusCode = 404;
    throw err;
  }
  return data;
}

export async function getLatestAccountDirectorStep(db, requestId) {
  const { data: runs, error } = await db
    .from('agency_runs')
    .select('*, agency_steps(*)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  const run = runs?.[0] || null;
  const step = run?.agency_steps?.find?.((item) => item.agent_id === 'account_director') || null;
  return step ? { ...step, run } : null;
}

export function getStepPayload(stepOrOutput) {
  const output = stepOrOutput?.output || stepOrOutput;
  return output?.data || output || null;
}

function isObjectWithKeys(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

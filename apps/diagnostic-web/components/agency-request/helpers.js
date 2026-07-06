// Helpers de apresentação/normalização da tela de solicitação da Agência
// (extraídos de pages/adm/[id]/agency/[requestId].js — item 2). Funções puras.
import { AGENCY_AGENT_ORDER, AI_MODELS, EMBEDDED_TEXT_REVIEW_WARNING } from './constants';

function getStepPayload(stepOrOutput) {
  const output = stepOrOutput?.output || stepOrOutput;
  return output?.data || output || {};
}

function decisionLabel(decision) {
  const normalized = normalizeDecision(decision);
  const labels = {
    approved: 'Aprovado',
    revision_requested: 'Revisão solicitada',
    rejected: 'Rejeitado',
  };
  return labels[normalized] || formatValue(normalized) || 'Sem decisão';
}

function decisionColor(decision) {
  const normalized = normalizeDecision(decision);
  if (normalized === 'approved') return 'var(--success)';
  if (normalized === 'rejected') return 'var(--brand-red)';
  return 'var(--warning)';
}

function decisionBorder(decision) {
  const normalized = normalizeDecision(decision);
  if (normalized === 'approved') return 'rgba(16,185,129,0.35)';
  if (normalized === 'rejected') return 'rgba(239,68,68,0.35)';
  return 'rgba(245,158,11,0.35)';
}

function checklistColor(status) {
  const normalized = normalizeChecklistStatus(status);
  if (normalized === 'pass') return 'var(--success)';
  if (normalized === 'fail') return 'var(--brand-red)';
  return 'var(--warning)';
}

function complianceDecisionLabel(decision) {
  const labels = { pass: 'Passou', warning: 'Com ressalvas', fail: 'Falhou' };
  return labels[decision] || 'Com ressalvas';
}

function complianceDecisionColor(decision) {
  if (decision === 'pass') return 'var(--success)';
  if (decision === 'fail') return 'var(--brand-red)';
  return 'var(--warning)';
}

function complianceDecisionBorder(decision) {
  if (decision === 'pass') return 'rgba(16,185,129,0.35)';
  if (decision === 'fail') return 'rgba(239,68,68,0.35)';
  return 'rgba(245,158,11,0.35)';
}

function complianceCriterionLabel(criterion) {
  const labels = {
    strategy: 'Estratégia',
    positioning: 'Posicionamento',
    audience: 'Público',
    voice: 'Tom de voz',
    forbidden_words: 'Palavras proibidas',
    visual_identity: 'Identidade visual',
    communication_plan: 'Plano de comunicação',
    claims: 'Claims',
    channel_fit: 'Aderência ao canal',
    strategic_tensions: 'Tensões estratégicas',
    executional_readiness: 'Prontidão de execução',
  };
  return labels[criterion] || formatValue(criterion || 'Critério');
}

function complianceStatusLabel(status) {
  if (status === 'pass') return 'pass';
  if (status === 'fail') return 'fail';
  return 'warning';
}

function complianceStatusColor(status) {
  if (status === 'pass') return 'var(--success)';
  if (status === 'fail') return 'var(--brand-red)';
  return 'var(--warning)';
}

function complianceStatusBorder(status) {
  if (status === 'pass') return 'rgba(16,185,129,0.24)';
  if (status === 'fail') return 'rgba(239,68,68,0.28)';
  return 'rgba(245,158,11,0.28)';
}

function complianceStatusBackground(status) {
  if (status === 'pass') return 'rgba(16,185,129,0.05)';
  if (status === 'fail') return 'rgba(239,68,68,0.06)';
  return 'rgba(245,158,11,0.06)';
}

function severityColor(severity) {
  if (severity === 'high') return 'var(--brand-red)';
  if (severity === 'low') return 'var(--accent-blue)';
  return 'var(--warning)';
}

function severityBorder(severity) {
  if (severity === 'high') return 'rgba(239,68,68,0.3)';
  if (severity === 'low') return 'rgba(56,189,248,0.24)';
  return 'rgba(245,158,11,0.28)';
}

function severityBackground(severity) {
  if (severity === 'high') return 'rgba(239,68,68,0.06)';
  if (severity === 'low') return 'rgba(56,189,248,0.05)';
  return 'rgba(245,158,11,0.06)';
}

function executionProfileLabel(profileId) {
  const labels = {
    simple_content: 'Conteúdo simples',
    channel_adapted_content: 'Conteúdo adaptado por canal',
    visual_content: 'Conteúdo visual',
    landing_page_copy: 'Copy de landing page',
    campaign_light: 'Campanha leve',
    custom: 'Customizado',
  };
  return labels[profileId] || formatValue(profileId || 'Perfil não registrado');
}

function formatGateLabel(gate) {
  const labels = {
    briefing_approval: 'Briefing aprovado',
    brand_compliance_before_approver: 'Compliance antes do aprovador',
    human_approval_before_publication: 'Aprovação humana',
  };
  return labels[gate] || formatValue(gate);
}

function hasRenderableValue(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return String(value).length > 0;
}

function sortAgencySteps(steps = []) {
  return [...steps].sort((a, b) => {
    const agentDelta = AGENCY_AGENT_ORDER.indexOf(a.agent_id) - AGENCY_AGENT_ORDER.indexOf(b.agent_id);
    if (agentDelta !== 0) return agentDelta;
    const versionDelta = Number(b.version_number || 1) - Number(a.version_number || 1);
    if (versionDelta !== 0) return versionDelta;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
}

function groupStepsByAgent(steps = []) {
  const grouped = new Map();
  for (const step of steps) {
    const current = grouped.get(step.agent_id) || [];
    current.push(step);
    grouped.set(step.agent_id, current);
  }
  return grouped;
}

function hasObsoleteDownstream(steps = [], agentId) {
  const index = AGENCY_AGENT_ORDER.indexOf(agentId);
  if (index < 0) return false;
  const downstream = new Set(AGENCY_AGENT_ORDER.slice(index + 1));
  return steps.some((step) => downstream.has(step.agent_id) && step.is_current === false && step.invalidated_by_step_id);
}

function calculateRunExecutionSummary(steps = []) {
  const relevant = (steps || []).filter((step) => step && getTechnicalStatus(step) !== 'skipped');
  return relevant.reduce((acc, step) => {
    const tokens = step.tokens || {};
    const inputTokens = Number(tokens.input || tokens.input_tokens || 0);
    const outputTokens = Number(tokens.output || tokens.output_tokens || 0);
    const technicalStatus = getTechnicalStatus(step);
    acc.total_steps += 1;
    if (technicalStatus === 'completed') acc.completed_steps += 1;
    if (technicalStatus === 'failed') acc.failed_steps += 1;
    acc.input_tokens_total += inputTokens;
    acc.output_tokens_total += outputTokens;
    acc.total_tokens += Number(tokens.total || tokens.total_tokens || inputTokens + outputTokens || 0);
    acc.estimated_cost_total += Number(step.cost_estimate || step.execution_metadata?.estimated_cost || 0);
    acc.duration_ms_total += Number(step.duration_ms || step.execution_metadata?.duration_ms || 0);
    return acc;
  }, {
    total_steps: 0,
    completed_steps: 0,
    failed_steps: 0,
    estimated_cost_total: 0,
    input_tokens_total: 0,
    output_tokens_total: 0,
    total_tokens: 0,
    duration_ms_total: 0,
  });
}

function getTechnicalStatus(step) {
  if (!step) return 'pending';
  if (step.technical_status) return step.technical_status;
  if (['pending', 'running', 'completed', 'failed', 'cancelled', 'skipped'].includes(step.status)) return step.status;
  if (step.status === 'regenerated') return 'skipped';
  return 'pending';
}

function getQualityAssessment(step) {
  if (!step) return { quality_status: 'not_reviewed', quality_issues: [] };
  const output = step.output || {};
  const data = getStepPayload(step);
  const explicit = step.quality_assessment || output.qualityAssessment || output.quality_assessment || data.quality_assessment;
  if (explicit?.quality_status) return normalizeQualityAssessment(explicit);
  return inferQualityAssessmentFromStep(step, data);
}

function normalizeQualityAssessment(value) {
  return {
    quality_status: normalizeQualityStatus(value.quality_status),
    quality_score: normalizeScore(value.quality_score),
    quality_issues: toArray(value.quality_issues).map(formatValue).filter(Boolean),
    strategic_alignment_score: normalizeScore(value.strategic_alignment_score),
    voice_alignment_score: normalizeScore(value.voice_alignment_score),
    visual_alignment_score: normalizeScore(value.visual_alignment_score),
    evidence_risk_score: normalizeScore(value.evidence_risk_score),
    review_reason: value.review_reason || '',
    assessed_by: value.assessed_by || 'system',
    assessed_at: value.assessed_at || '',
  };
}

function inferQualityAssessmentFromStep(step, data = {}) {
  const technicalStatus = getTechnicalStatus(step);
  if (technicalStatus === 'failed') {
    return { quality_status: 'not_reviewed', quality_issues: ['Execução técnica falhou antes de produzir output revisável.'], assessed_by: 'system' };
  }
  if (step.agent_id === 'editor' && data.score_aderencia !== undefined) {
    const issues = [...toArray(data.riscos_de_incoerencia), ...toArray(data.warnings)].map(formatValue).filter(Boolean);
    const score = normalizeScore(data.score_aderencia);
    const risky = issues.some((item) => /claim|prova|evid[eê]ncia|sustenta|n[uú]mero|garant/i.test(item));
    return {
      quality_status: risky ? 'risky' : score !== undefined && score < 70 ? 'needs_revision' : issues.length ? 'needs_revision' : 'acceptable',
      quality_score: score,
      quality_issues: issues,
      strategic_alignment_score: score,
      evidence_risk_score: risky ? 80 : 20,
      assessed_by: 'system',
    };
  }
  if (step.agent_id === 'approver' && (data.decisao || data.decision)) {
    const decision = normalizeDecision(data.decisao || data.decision);
    const issues = [...toArray(data.ajustes_obrigatorios), ...toArray(data.warnings)].map(formatValue).filter(Boolean);
    return {
      quality_status: decision === 'approved' ? 'acceptable' : decision === 'rejected' ? 'rejected' : 'needs_revision',
      quality_issues: issues,
      review_reason: data.justificativa || data.risco_principal || '',
      assessed_by: 'agent',
    };
  }
  if (step.agent_id === 'brand_compliance' && data.decision) {
    const violations = toArray(data.violations);
    const issues = [
      ...toArray(data.required_adjustments),
      ...toArray(data.warnings),
      ...violations.map((item) => item?.description || item?.suggested_fix),
    ].map(formatValue).filter(Boolean);
    const highSeverity = violations.some((item) => item?.severity === 'high');
    const claimRisk = issues.some((item) => /claim|prova|evid[eê]ncia|sustenta|garant/i.test(item));
    return {
      quality_status: data.decision === 'pass'
        ? 'acceptable'
        : data.decision === 'fail'
          ? (highSeverity ? 'rejected' : 'risky')
          : claimRisk ? 'risky' : 'needs_revision',
      quality_score: normalizeScore(data.overall_brand_alignment_score),
      quality_issues: issues,
      strategic_alignment_score: normalizeScore(data.overall_brand_alignment_score),
      evidence_risk_score: claimRisk ? 85 : 20,
      review_reason: data.decision === 'pass'
        ? 'Brand compliance não encontrou violações relevantes.'
        : 'Brand compliance encontrou warnings, violações ou ajustes obrigatórios.',
      assessed_by: 'agent',
    };
  }
  return { quality_status: 'not_reviewed', quality_issues: [], assessed_by: 'system' };
}

function normalizeQualityStatus(value) {
  return ['not_reviewed', 'acceptable', 'needs_revision', 'rejected', 'risky'].includes(value)
    ? value
    : 'not_reviewed';
}

function normalizeScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function technicalStatusLabel(status) {
  return ({
    pending: 'pendente',
    running: 'rodando',
    completed: 'concluída',
    failed: 'falhou',
    cancelled: 'cancelada',
    skipped: 'pulada',
  })[status] || formatValue(status);
}

function qualityStatusLabel(status) {
  return ({
    not_reviewed: 'não revisada',
    acceptable: 'aceitável',
    needs_revision: 'precisa revisão',
    rejected: 'rejeitada',
    risky: 'arriscada',
  })[status] || 'não revisada';
}

function technicalStatusColor(status) {
  if (status === 'completed') return 'var(--success)';
  if (status === 'failed') return 'var(--brand-red)';
  if (status === 'running') return 'var(--accent-blue)';
  return 'var(--text-secondary)';
}

function technicalStatusBorder(status) {
  if (status === 'completed') return 'rgba(16,185,129,0.35)';
  if (status === 'failed') return 'rgba(239,68,68,0.35)';
  if (status === 'running') return 'rgba(56,189,248,0.35)';
  return 'rgba(255,255,255,0.1)';
}

function qualityStatusColor(status) {
  if (status === 'acceptable') return 'var(--success)';
  if (status === 'rejected') return 'var(--brand-red)';
  if (status === 'risky' || status === 'needs_revision') return 'var(--warning)';
  return 'var(--text-secondary)';
}

function qualityStatusBorder(status) {
  if (status === 'acceptable') return 'rgba(16,185,129,0.35)';
  if (status === 'rejected') return 'rgba(239,68,68,0.35)';
  if (status === 'risky' || status === 'needs_revision') return 'rgba(245,158,11,0.35)';
  return 'rgba(255,255,255,0.1)';
}

function qualityStatusBackground(status) {
  if (status === 'acceptable') return 'rgba(16,185,129,0.05)';
  if (status === 'rejected') return 'rgba(239,68,68,0.05)';
  if (status === 'risky' || status === 'needs_revision') return 'rgba(245,158,11,0.055)';
  return 'rgba(255,255,255,0.02)';
}

function scoreLabel(value) {
  const score = normalizeScore(value);
  return score === undefined ? '' : `${score}/100`;
}

function normalizeDecision(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return formatValue(value.decisao || value.decision || value.status || value.resultado || value.result || value);
  }
  return String(value);
}

function normalizeChecklistStatus(value) {
  if (!value) return 'warning';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return formatValue(value.status || value.resultado || value.result || inferChecklistStatus(value));
  }
  return String(value);
}

function extractEditedCopy(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.copy_final || value.copy || value.texto || value.legenda || value.versao_final || '';
  }
  return String(value);
}

function extractChannelAdaptedText(value) {
  const adapted = value?.adapted_content || value;
  if (!adapted || typeof adapted !== 'object') return '';
  const parts = [
    adapted.subject_line ? `Assunto: ${adapted.subject_line}` : '',
    adapted.preview_text ? `Preview: ${adapted.preview_text}` : '',
    adapted.headline ? `Headline: ${adapted.headline}` : '',
    adapted.caption || '',
    adapted.body || '',
    adapted.script || '',
    ...toArray(adapted.slide_sequence).map(formatValue),
    ...toArray(adapted.sections).map(formatValue),
  ];
  return parts.map(formatValue).filter(Boolean).join('\n\n');
}

function extractEditedVisual(value) {
  if (!value || typeof value !== 'object') return '';
  return value.direcao_visual_final || value.direcao_visual || value.visual || '';
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    return Object.entries(value).map(([key, item]) => {
      if (item && typeof item === 'object') return { titulo: humanizeKey(key), ...item };
      return `${humanizeKey(key)}: ${item}`;
    });
  }
  return [value];
}

function normalizeChecklist(items) {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map((item) => normalizeChecklistItem(item)).filter(Boolean);
  }
  if (typeof items === 'object') {
    return Object.entries(items)
      .map(([key, value]) => normalizeChecklistItem({ criterio: humanizeKey(key), observacao: value, status: inferChecklistStatus(value) }))
      .filter(Boolean);
  }
  return [];
}

function normalizeChecklistItem(item) {
  if (!item) return null;
  if (typeof item === 'string') {
    return { criterio: item, status: 'pass', observacao: '' };
  }
  return {
    criterio: item.criterio || item.criterion || item.titulo || item.title || 'Critério',
    status: normalizeChecklistStatus(item.status || inferChecklistStatus(item.observacao || item.note || item)),
    observacao: item.observacao || item.note || item.descricao || item.description || '',
  };
}

function inferChecklistStatus(value) {
  const text = String(formatValue(value)).toLowerCase();
  if (text.includes('violação') || text.includes('falha') || text.includes('não ')) return 'warning';
  return 'pass';
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    if (value.texto && value.titulo) return `${value.titulo}: ${value.texto}`;
    if (value.titulo && value.descricao) return `${value.titulo}: ${value.descricao}`;
    if (value.name && value.description) return `${value.name}: ${value.description}`;
    return Object.entries(value)
      .map(([key, item]) => `${humanizeKey(key)}: ${formatValue(item)}`)
      .join('\n');
  }
  return String(value);
}

function defaultModelSelection() {
  const executionMode = process.env.NEXT_PUBLIC_DEFAULT_AI_EXECUTION_MODE
    || (process.env.NODE_ENV === 'production' ? 'use_agent_defaults' : 'mock');
  return {
    execution_mode: executionMode,
    selected_model_id: 'gemini-3.5-flash',
    agent_overrides: [],
    max_tokens_per_step: 12000,
    max_estimated_cost_per_run: '',
    require_confirmation_for_premium: true,
  };
}

function suggestHigherTokenLimit(errorMessage) {
  const match = String(errorMessage || '').match(/Step excedeu o limite de tokens \((\d+)\/(\d+)\)/i);
  const observedTokens = Number(match?.[1] || 0);
  if (observedTokens > 0) {
    return Math.ceil((observedTokens + 1200) / 1000) * 1000;
  }
  return 12000;
}

function cleanModelSelection(selection = {}, agentFlow = []) {
  const executionMode = selection.execution_mode || 'mock';
  const allowedAgentIds = new Set((agentFlow || []).map((agent) => agent.id));
  const overrides = (selection.agent_overrides || [])
    .filter((item) => item?.agent_id && item?.model_id && (!allowedAgentIds.size || allowedAgentIds.has(item.agent_id)))
    .map((item) => ({ agent_id: item.agent_id, model_id: item.model_id }));

  const cleaned = {
    execution_mode: executionMode,
    max_tokens_per_step: positiveNumberOrUndefined(selection.max_tokens_per_step),
    max_estimated_cost_per_run: nonNegativeNumberOrUndefined(selection.max_estimated_cost_per_run),
    require_confirmation_for_premium: selection.require_confirmation_for_premium !== false,
  };

  if (executionMode === 'use_single_model_for_run') {
    cleaned.selected_model_id = selection.selected_model_id || 'gemini-3.5-flash';
  }
  if (executionMode === 'override_single_agent') {
    cleaned.agent_overrides = overrides;
  }
  return cleaned;
}

function positiveNumberOrUndefined(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : undefined;
}

function nonNegativeNumberOrUndefined(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : undefined;
}

function getModel(modelId) {
  return AI_MODELS.find((model) => model.model_id === modelId) || null;
}

function modelDisplayName(modelId) {
  return getModel(modelId)?.display_name || modelId;
}

function isPremiumModel(modelId) {
  return modelId === 'gpt-5.4' || modelId === 'claude-sonnet-4-6';
}

function executionModeLabel(mode) {
  return ({
    mock: 'Simulado sem tokens',
    economical: 'Econômico',
    use_agent_defaults: 'Padrão por agente',
    use_single_model_for_run: 'Modelo único',
    override_single_agent: 'Personalizado por agente',
  })[mode] || 'Não registrado';
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cloneBriefing(value) {
  if (!value || typeof value !== 'object') return null;
  return JSON.parse(JSON.stringify(value));
}

function setNestedValue(target, path, value) {
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
}

function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function briefingEquivalent(left, right) {
  return JSON.stringify(left || null) === JSON.stringify(right || null);
}

function formatMoney(value) {
  const numeric = Number(value || 0);
  if (!numeric) return 'US$ 0.0000';
  return `US$ ${numeric.toFixed(4)}`;
}

function formatDuration(value) {
  const ms = Number(value || 0);
  if (!ms) return '0 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

async function readJsonOrThrow(response, fallbackMessage) {
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    const compactText = text.replace(/\s+/g, ' ').trim();
    throw new Error(compactText || fallbackMessage);
  }

  if (!response.ok) {
    throw new Error(json?.error || fallbackMessage);
  }

  return json || {};
}

function downloadComposedArtwork(image) {
  if (!image?.src || typeof window === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const img = new window.Image();

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0.04)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const text = image.overlayText || {};
    const left = 72;
    const maxWidth = canvas.width - 144;
    let y = canvas.height - 84;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    if (text.cta) {
      ctx.font = '800 34px Arial, sans-serif';
      const ctaLines = wrapCanvasText(ctx, text.cta, maxWidth);
      y = drawCanvasLines(ctx, ctaLines, left, y, 40);
      y -= 28;
    }

    if (text.body) {
      ctx.font = '400 34px Arial, sans-serif';
      const bodyLines = wrapCanvasText(ctx, text.body, maxWidth).slice(0, 5);
      y = drawCanvasLines(ctx, bodyLines, left, y, 42);
      y -= 34;
    }

    if (text.headline) {
      ctx.font = '700 64px Georgia, serif';
      const headlineLines = wrapCanvasText(ctx, text.headline, maxWidth).slice(0, 4);
      drawCanvasLines(ctx, headlineLines, left, y, 70);
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'arte-aprovada-espansione.png';
    link.click();
  };

  img.src = image.src;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCanvasLines(ctx, lines, x, bottomY, lineHeight) {
  let y = bottomY - (lines.length - 1) * lineHeight;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return bottomY - lines.length * lineHeight;
}

function getBriefingStatus(request, briefing) {
  if (!briefing) {
    return { label: 'aguardando geração', color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.12)' };
  }
  if (request?.status === 'briefing_approved') {
    return { label: 'aprovado', color: 'var(--success)', border: 'rgba(16,185,129,0.35)' };
  }
  if (request?.status === 'briefing_revision_requested') {
    return { label: 'revisão solicitada', color: 'var(--warning)', border: 'rgba(245,158,11,0.35)' };
  }
  return { label: 'aguardando aprovação', color: 'var(--accent-blue)', border: 'rgba(56,189,248,0.35)' };
}

function isBriefingApprovedRequest(request) {
  return !!request?.approved_briefing_json
    && !['draft', 'briefing_pending', 'briefing_generated', 'briefing_revision_requested'].includes(request.status);
}

function labelAgent(agentId) {
  const labels = {
    account_director: 'Atendimento Estratégico',
    copywriter: 'Copywriter',
    channel_adapter: 'Channel Adapter',
    visual_director: 'Direção Visual',
    editor: 'Editor de Coerência',
    brand_compliance: 'Brand Compliance',
    approver: 'Aprovador de Marca',
  };
  return labels[agentId] || agentId;
}

function shortAgentLabel(agentId) {
  const labels = {
    account_director: 'Atendimento',
    copywriter: 'Copywriter',
    channel_adapter: 'Canal',
    visual_director: 'Visual',
    editor: 'Editor',
    brand_compliance: 'Compliance',
    approver: 'Aprovador',
  };
  return labels[agentId] || agentId;
}

function agentDescription(agentId) {
  const descriptions = {
    account_director: 'Briefing operacional',
    copywriter: 'Texto e tom',
    channel_adapter: 'Adaptação por canal',
    visual_director: 'Direção de arte',
    editor: 'Qualidade editorial',
    brand_compliance: 'Aderência à marca',
    approver: 'Gate final',
  };
  return descriptions[agentId] || 'Etapa da Agência';
}

function miniActionStyle(loading) {
  return {
    background: loading ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${loading ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8,
    color: loading ? 'var(--accent-blue)' : 'var(--text-secondary)',
    padding: '0.4rem 0.58rem',
    cursor: loading ? 'wait' : 'pointer',
    fontWeight: 800,
    fontSize: '0.74rem',
  };
}

function libraryActionStyle(loading, polarity) {
  const positive = polarity === 'positive';
  return {
    background: loading
      ? 'rgba(56,189,248,0.18)'
      : positive
        ? 'rgba(16,185,129,0.08)'
        : 'rgba(245,158,11,0.08)',
    border: `1px solid ${positive ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}`,
    borderRadius: 8,
    color: loading ? 'var(--accent-blue)' : positive ? 'var(--success)' : 'var(--warning)',
    padding: '0.4rem 0.58rem',
    cursor: loading ? 'wait' : 'pointer',
    fontWeight: 800,
    fontSize: '0.74rem',
  };
}

function assetActionStyle(action, loading) {
  const variants = {
    approve: ['rgba(16,185,129,0.08)', 'rgba(16,185,129,0.28)', 'var(--success)'],
    reject: ['rgba(245,158,11,0.08)', 'rgba(245,158,11,0.28)', 'var(--warning)'],
    archive: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.12)', 'var(--text-secondary)'],
  };
  const [background, border, color] = variants[action] || variants.archive;
  return {
    background: loading ? 'rgba(56,189,248,0.18)' : background,
    border: `1px solid ${loading ? 'rgba(56,189,248,0.45)' : border}`,
    borderRadius: 8,
    color: loading ? 'var(--accent-blue)' : color,
    padding: '0.4rem 0.58rem',
    cursor: loading ? 'wait' : 'pointer',
    fontWeight: 800,
    fontSize: '0.74rem',
  };
}

function creativeAssetStatusColor(status) {
  if (status === 'approved') return 'var(--success)';
  if (status === 'rejected') return 'var(--brand-red)';
  if (status === 'generated') return 'var(--accent-blue)';
  if (status === 'archived') return 'var(--text-secondary)';
  return 'var(--warning)';
}

function creativeAssetStatusBorder(status) {
  if (status === 'approved') return 'rgba(16,185,129,0.35)';
  if (status === 'rejected') return 'rgba(239,68,68,0.35)';
  if (status === 'generated') return 'rgba(56,189,248,0.35)';
  if (status === 'archived') return 'rgba(255,255,255,0.12)';
  return 'rgba(245,158,11,0.35)';
}

function getCreativeAssetWarnings(asset = {}) {
  const warnings = [];
  if (asset.has_embedded_text) warnings.push(EMBEDDED_TEXT_REVIEW_WARNING);
  if (asset.asset_type === 'final_art' && asset.text_review_required) {
    warnings.push('Ativo final_art com texto embutido só deve avançar após revisão humana explícita.');
  }
  return warnings;
}

function libraryItemTypeForAgent(agentId, polarity) {
  const positive = polarity === 'positive';
  if (agentId === 'copywriter' || agentId === 'channel_adapter' || agentId === 'editor') {
    return positive ? 'approved_copy' : 'rejected_copy';
  }
  if (agentId === 'visual_director') {
    return positive ? 'approved_visual_direction' : 'rejected_visual_direction';
  }
  if (agentId === 'approver') {
    return positive ? 'campaign_example' : 'negative_example';
  }
  if (agentId === 'brand_compliance') {
    return positive ? 'campaign_example' : 'negative_example';
  }
  return positive ? 'creative_reference' : 'negative_example';
}

function defaultLearningTypeForAgent(agentId, step) {
  const payload = getStepPayload(step);
  const decision = normalizeDecision(payload.decisao || payload.decision);
  if (agentId === 'copywriter') return 'voice_preference';
  if (agentId === 'channel_adapter') return 'channel_rule';
  if (agentId === 'visual_director') return 'visual_preference';
  if (agentId === 'editor') return 'campaign_learning';
  if (agentId === 'brand_compliance') return 'claim_rule';
  if (agentId === 'approver' && decision === 'rejected') return 'claim_rule';
  if (agentId === 'approver' && decision === 'revision_requested') return 'claim_rule';
  return 'campaign_learning';
}

function defaultLearningContent(agentId, step) {
  const payload = getStepPayload(step);
  if (agentId === 'copywriter') return payload.racional_de_tom || payload.copy_principal || payload.cta || '';
  if (agentId === 'channel_adapter') return extractChannelAdaptedText(payload) || payload.cta || '';
  if (agentId === 'visual_director') return payload.direcao_de_arte || payload.composicao || payload.prompt_visual_opcional || '';
  if (agentId === 'editor') return payload.versao_editada || toArray(payload.riscos_de_incoerencia).join('\n') || '';
  if (agentId === 'brand_compliance') {
    return toArray(payload.required_adjustments).join('\n')
      || toArray(payload.violations).map((item) => item?.description || item?.suggested_fix).filter(Boolean).join('\n')
      || toArray(payload.warnings).join('\n')
      || '';
  }
  if (agentId === 'approver') {
    return payload.risco_principal
      || payload.justificativa
      || toArray(payload.ajustes_obrigatorios).join('\n')
      || '';
  }
  return JSON.stringify(payload);
}

export {
  getStepPayload,
  decisionLabel,
  decisionColor,
  decisionBorder,
  checklistColor,
  complianceDecisionLabel,
  complianceDecisionColor,
  complianceDecisionBorder,
  complianceCriterionLabel,
  complianceStatusLabel,
  complianceStatusColor,
  complianceStatusBorder,
  complianceStatusBackground,
  severityColor,
  severityBorder,
  severityBackground,
  executionProfileLabel,
  formatGateLabel,
  hasRenderableValue,
  sortAgencySteps,
  groupStepsByAgent,
  hasObsoleteDownstream,
  calculateRunExecutionSummary,
  getTechnicalStatus,
  getQualityAssessment,
  normalizeQualityAssessment,
  inferQualityAssessmentFromStep,
  normalizeQualityStatus,
  normalizeScore,
  technicalStatusLabel,
  qualityStatusLabel,
  technicalStatusColor,
  technicalStatusBorder,
  qualityStatusColor,
  qualityStatusBorder,
  qualityStatusBackground,
  scoreLabel,
  normalizeDecision,
  normalizeChecklistStatus,
  extractEditedCopy,
  extractChannelAdaptedText,
  extractEditedVisual,
  toArray,
  normalizeChecklist,
  normalizeChecklistItem,
  inferChecklistStatus,
  formatValue,
  defaultModelSelection,
  suggestHigherTokenLimit,
  cleanModelSelection,
  positiveNumberOrUndefined,
  nonNegativeNumberOrUndefined,
  getModel,
  modelDisplayName,
  isPremiumModel,
  executionModeLabel,
  humanizeKey,
  cloneBriefing,
  setNestedValue,
  splitLines,
  briefingEquivalent,
  formatMoney,
  formatDuration,
  downloadComposedArtwork,
  wrapCanvasText,
  drawCanvasLines,
  getBriefingStatus,
  isBriefingApprovedRequest,
  labelAgent,
  shortAgentLabel,
  agentDescription,
  miniActionStyle,
  libraryActionStyle,
  assetActionStyle,
  creativeAssetStatusColor,
  creativeAssetStatusBorder,
  getCreativeAssetWarnings,
  libraryItemTypeForAgent,
  defaultLearningTypeForAgent,
  defaultLearningContent,
};

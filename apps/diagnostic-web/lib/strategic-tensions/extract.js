const TAG_REGEX = /<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/i;

export function extractStrategicTensionsFromAgent6Output(output) {
  const source =
    normalizeJson(output?.brand_memory_export_json) ??
    parseBrandMemoryExport(output?.conteudo);

  if (!source || typeof source !== 'object') {
    return { tensions: [], summary: '', unresolved_count: 0, high_risk_count: 0 };
  }

  return normalizeStrategicTensionsSlice(
    source.strategic_tensions ??
      source.pontos_de_escolha_estrategica ??
      source.decodificacao?.strategic_tensions ??
      source.decodificacao?.pontos_de_escolha_estrategica ??
      deriveFromLegacyDecodificacao(source)
  );
}

export function normalizeStrategicTensionsSlice(input) {
  if (!input) return { tensions: [], summary: '', unresolved_count: 0, high_risk_count: 0 };

  const rawTensions = Array.isArray(input) ? input : input.tensions;
  const tensions = Array.isArray(rawTensions)
    ? rawTensions.map(normalizeTension).filter(Boolean)
    : [];

  const unresolved = tensions.filter((tension) => tension.status !== 'resolved').length;
  const highRisk = tensions.filter((tension) =>
    String(tension.risk_if_ignored || '').toLowerCase().includes('alto') ||
    Number(tension.confidence_score || 0) >= 80
  ).length;

  return {
    tensions,
    summary: typeof input.summary === 'string' ? input.summary : '',
    unresolved_count: Number.isFinite(Number(input.unresolved_count))
      ? Number(input.unresolved_count)
      : unresolved,
    high_risk_count: Number.isFinite(Number(input.high_risk_count))
      ? Number(input.high_risk_count)
      : highRisk,
  };
}

function normalizeTension(input, index = 0) {
  if (!input || typeof input !== 'object') return null;
  const title = firstString(input.title, input.titulo, input.topic, input.tema);
  const theme = firstString(input.theme, input.tema, input.type, input.camada);
  const tensionSummary = firstString(input.tension_summary, input.resumo, input.description, input.descricao);
  const strategicChoice = firstString(
    input.strategic_choice_needed,
    input.escolha_estrategica_necessaria,
    input.context,
    input.contexto
  );
  const risk = firstString(input.risk_if_ignored, input.risco_se_ignorada, input.implication, input.implicacao);

  if (!title || !theme || !tensionSummary || !strategicChoice || !risk) return null;

  return {
    id: firstString(input.id) || `strategic_tension_${index + 1}`,
    title,
    theme,
    vi_signal: firstString(input.vi_signal, input.sinal_vi),
    ve_signal: firstString(input.ve_signal, input.sinal_ve),
    vm_signal: firstString(input.vm_signal, input.sinal_vm),
    tension_summary: tensionSummary,
    strategic_choice_needed: strategicChoice,
    recommended_choice: firstString(input.recommended_choice, input.escolha_recomendada),
    risk_if_ignored: risk,
    impact_on_positioning: firstString(input.impact_on_positioning, input.impacto_posicionamento),
    impact_on_communication: firstString(input.impact_on_communication, input.impacto_comunicacao),
    impact_on_experience: firstString(input.impact_on_experience, input.impacto_experiencia),
    confidence_score: Number.isFinite(Number(input.confidence_score)) ? Number(input.confidence_score) : undefined,
    evidence_strength: firstString(input.evidence_strength, input.forca_evidencia) || 'unknown',
    status: ['open', 'resolved', 'monitor'].includes(input.status) ? input.status : 'open',
  };
}

function deriveFromLegacyDecodificacao(source) {
  const choices = Array.isArray(source.escolhas_pendentes) ? source.escolhas_pendentes : [];
  const divergences = Array.isArray(source.divergencias_criticas) ? source.divergencias_criticas : [];

  if (choices.length === 0 && divergences.length === 0) return null;

  return {
    summary: 'Pontos derivados de divergencias_criticas e escolhas_pendentes legadas do Agente 6.',
    tensions: [...choices, ...divergences].map((item, index) => ({
      id: `legacy_tension_${index + 1}`,
      title: firstString(item.topic, item.context) || `Ponto de escolha ${index + 1}`,
      theme: firstString(item.type, item.camada) || 'estrategia',
      tension_summary: firstString(item.description, item.context) || 'Tensão estratégica identificada no Agente 6.',
      strategic_choice_needed:
        firstString(item.context) || 'Definir a rota estratégica antes de usar em campanhas.',
      recommended_choice: firstString(item.rota_assumida_nas_diretrizes),
      risk_if_ignored: firstString(item.implication) || 'A campanha pode reforçar uma divergência não resolvida.',
      status: 'open',
    })),
  };
}

function parseBrandMemoryExport(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(TAG_REGEX);
  if (!match) return null;
  return normalizeJson(match[1]);
}

function normalizeJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

// =====================================================================
// Cockpit da empresa — lógica da jornada do Método Espansione (pura)
// =====================================================================
// Recebe o estado bruto (projeto, maturidade, identidade, pessoas, entregáveis)
// e devolve: passos da jornada com status + bloqueio, cards-resumo, pendências
// e próximas ações priorizadas. Centraliza as regras de produto/bloqueio.

export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  NOT_APPLICABLE: 'not_applicable',
  ATTENTION: 'attention',
};

// rótulos oficiais (item 15)
export const JOURNEY_DEFS = [
  { key: 'maturity', label: 'Mapa de Maturidade', short: 'Maturidade', icon: '🧭' },
  { key: 'identity', label: 'Mapa de Identidade', short: 'Identidade', icon: '🧬' },
  { key: 'report', label: 'Relatório PDF + Leitura Guiada', short: 'PDF + Leitura', icon: '📘' },
  { key: 'tracks', label: 'Trilhas de Aprofundamento', short: 'Aprofundamento', icon: '🧗' },
  { key: 'ai', label: 'IA Socrática', short: 'IA Socrática', icon: '🤖' },
  { key: 'curation', label: 'Curadoria / Masterclass', short: 'Curadoria', icon: '🎓' },
  { key: 'remeasure', label: 'Nova Medição', short: 'Nova Medição', icon: '🔁' },
];

const FONTES_OBRIGATORIAS = ['identity_brand_essence_v1', 'identity_value_territory_v1'];

function statusFromMaturidade(m) {
  if (!m) return STATUS.NOT_STARTED;
  if (m.status === 'concluido') return STATUS.COMPLETED;
  if (m.status === 'em_andamento') return STATUS.IN_PROGRESS;
  return STATUS.NOT_STARTED;
}

// formStatuses: { form_type: 'not_started'|'in_progress'|'completed' }
function statusFromIdentidade(idn, formStatuses) {
  if (!idn) return STATUS.NOT_STARTED;
  const obrigDone = FONTES_OBRIGATORIAS.every((t) => formStatuses[t] === 'completed');
  if (obrigDone) return STATUS.COMPLETED;
  const algum = Object.values(formStatuses).some((s) => s === 'in_progress' || s === 'completed');
  return algum ? STATUS.IN_PROGRESS : STATUS.NOT_STARTED;
}

export function computeCockpit(raw) {
  const { projeto = {}, maturidade, identidade, identidadeForms = {}, pessoas = {}, outputs = [] } = raw;

  const matStatus = statusFromMaturidade(maturidade);
  const matResult = maturidade?.result_json || {};

  const idnStatus = statusFromIdentidade(identidade, identidadeForms);
  const idnResult = identidade?.result_json || {};
  const obrigDone = FONTES_OBRIGATORIAS.every((t) => identidadeForms[t] === 'completed');

  // entregáveis / bloqueios (item 14)
  const pdfMaturidade = !!matResult.report; // PDF da Maturidade gerado (cache de narrativa)
  const pdfIdentidadeBlocked = !obrigDone; // PDF de Identidade exige fontes obrigatórias
  const leituraBlocked = pdfIdentidadeBlocked; // Leitura Guiada libera junto com o PDF
  const tracksBlocked = pdfIdentidadeBlocked; // trilhas dependem das recomendações do relatório (fontes obrigatórias)
  const aiBlocked = true; // IA Socrática: base mínima ainda não existe
  const curationBlocked = true;
  const remeasureBlocked = !(idnStatus === STATUS.COMPLETED);

  // jornada
  const journeyStatus = {
    maturity: matStatus,
    identity: idnStatus,
    report: obrigDone ? STATUS.NOT_STARTED : STATUS.BLOCKED,
    tracks: tracksBlocked ? STATUS.BLOCKED : STATUS.NOT_STARTED,
    ai: aiBlocked ? STATUS.BLOCKED : STATUS.NOT_STARTED,
    curation: curationBlocked ? STATUS.BLOCKED : STATUS.NOT_STARTED,
    remeasure: remeasureBlocked ? STATUS.BLOCKED : STATUS.NOT_STARTED,
  };
  const journey = JOURNEY_DEFS.map((d) => ({
    ...d,
    status: journeyStatus[d.key],
    completed_at: d.key === 'maturity' ? maturidade?.completed_at || null : d.key === 'identity' ? identidade?.completed_at || null : null,
  }));

  // etapa atual = primeiro não-concluído e não-bloqueado
  const atual = journey.find((s) => s.status === STATUS.IN_PROGRESS)
    || journey.find((s) => s.status === STATUS.NOT_STARTED)
    || journey[journey.length - 1];

  // pessoas
  const socios = pessoas.socios || { total: 0, concluidos: 0 };
  const equipe = pessoas.equipe || { total: 0, concluidos: 0 };

  // resumo
  const summary = {
    maturity: {
      status: matStatus,
      score: matResult.general_score ?? null,
      level: matResult.general_level || null,
      critical: matResult.critical_pillars || [],
      strong: matResult.strong_pillars || [],
    },
    identity: {
      status: idnStatus,
      forms: [
        { type: 'identity_brand_essence_v1', label: 'Essência e Direção da Marca', status: identidadeForms.identity_brand_essence_v1 || 'not_started', obrigatorio: true },
        { type: 'identity_value_territory_v1', label: 'Território Estratégico de Valor', status: identidadeForms.identity_value_territory_v1 || 'not_started', obrigatorio: true },
        { type: 'identity_internal_mirror_v1', label: 'Espelho Interno', status: identidadeForms.identity_internal_mirror_v1 || 'not_started', condicional: true },
        { type: 'identity_external_mirror_v1', label: 'Espelho Externo', status: identidadeForms.identity_external_mirror_v1 || 'not_started', condicional: true },
      ],
      dominant_territory: idnResult.value_territory?.dominant || null,
      internal_responses: idnResult.internal_mirror?.respondents_count || 0,
      external_responses: idnResult.external_mirror?.respondents_count || 0,
    },
    people: { socios, equipe },
    deliverables: {
      pdf_maturidade: pdfMaturidade,
      pdf_identidade_blocked: pdfIdentidadeBlocked,
      leitura_blocked: leituraBlocked,
      trilhas_blocked: tracksBlocked,
      ia_blocked: aiBlocked,
    },
  };

  // pendências (até 3) e ações (até 5), priorizadas
  const actions = buildActions({ matStatus, idnStatus, identidadeForms, obrigDone, socios, equipe, summary, projeto });
  summary.pending = actions.slice(0, 3).map((a) => a.title);
  summary.next_action = actions[0] || null;

  return {
    company: {
      id: projeto.id,
      name: projeto.cliente || 'Empresa',
      segment: projeto.segmento || projeto.porte || '—',
      size: projeto.momento || projeto.porte || '—',
      owner: projeto.responsavel_email || projeto.contato || '—',
      journey_status: atual ? atual.label + (atual.status === STATUS.IN_PROGRESS ? ' em andamento' : '') : '—',
      last_updated: projeto.updated_at || projeto.created_at || null,
    },
    journey,
    current_step: atual?.key || null,
    summary,
    actions: actions.slice(0, 5),
    outputs_done: outputs.filter((o) => o.status === 'ok' || o.status === 'concluido').length,
  };
}

function buildActions(ctx) {
  const { matStatus, idnStatus, identidadeForms, obrigDone, socios, equipe, summary } = ctx;
  const a = [];
  const P = STATUS;

  if (matStatus === P.NOT_STARTED) {
    a.push({ key: 'mat_start', title: 'Iniciar Mapa de Maturidade', reason: 'O cliente ainda não iniciou o diagnóstico de maturidade.', cta: 'Iniciar', priority: 'alta', module: 'maturity' });
  } else if (matStatus === P.IN_PROGRESS) {
    a.push({ key: 'mat_cont', title: 'Concluir Mapa de Maturidade', reason: 'Diagnóstico de maturidade em andamento — aguardando conclusão.', cta: 'Ver', priority: 'alta', module: 'maturity' });
  }

  if (identidadeForms.identity_brand_essence_v1 !== 'completed') {
    a.push({ key: 'idn_ess', title: 'Concluir Essência e Direção da Marca', reason: 'Fonte obrigatória do Mapa de Identidade ainda não concluída.', cta: 'Abrir', priority: 'alta', module: 'identity' });
  }
  if (identidadeForms.identity_value_territory_v1 !== 'completed') {
    a.push({ key: 'idn_ter', title: 'Concluir Território Estratégico de Valor', reason: 'Fonte obrigatória do Mapa de Identidade ainda não concluída.', cta: 'Abrir', priority: 'alta', module: 'identity' });
  }

  if (socios.total > 0 && socios.concluidos < socios.total) {
    a.push({ key: 'disc_soc', title: 'Concluir Mapeamento Comportamental dos sócios', reason: `${socios.concluidos}/${socios.total} sócios concluíram o DISC.`, cta: 'Gerenciar', priority: 'media', module: 'disc' });
  }

  if (obrigDone && (summary.identity.internal_responses === 0)) {
    a.push({ key: 'esp_int', title: 'Enviar link do Espelho Interno', reason: 'Aprofunda a percepção interna — nenhuma resposta recebida ainda.', cta: 'Enviar link', priority: 'media', module: 'identity' });
  }
  if (obrigDone && (summary.identity.external_responses === 0)) {
    a.push({ key: 'esp_ext', title: 'Enviar link do Espelho Externo', reason: 'Aprofunda a percepção externa — nenhuma resposta recebida ainda.', cta: 'Enviar link', priority: 'baixa', module: 'identity' });
  }

  if (obrigDone) {
    a.push({ key: 'pdf', title: 'Gerar Relatório PDF do Mapa de Identidade', reason: 'Fontes obrigatórias concluídas — o relatório pode ser gerado.', cta: 'Gerar PDF', priority: 'media', module: 'report' });
  }

  return a;
}

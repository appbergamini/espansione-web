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
  { key: 'maturity', label: 'Mapa do Crescimento Integrado', short: 'Crescimento', icon: '🧭' },
  { key: 'identity', label: 'Mapa do Crescimento Integrado v2', short: 'Crescimento v2', icon: '🧬' },
  { key: 'report', label: 'Relatório PDF + Leitura Guiada', short: 'PDF + Leitura', icon: '📘' },
  { key: 'tracks', label: 'Trilhas de Aprofundamento', short: 'Aprofundamento', icon: '🧗' },
  { key: 'ai', label: 'IA Socrática', short: 'IA Socrática', icon: '🤖' },
  { key: 'curation', label: 'Curadoria / Masterclass', short: 'Curadoria', icon: '🎓' },
  { key: 'remeasure', label: 'Nova Medição', short: 'Nova Medição', icon: '🔁' },
];

// Mapa do Crescimento Integrado v2 FINAL: as "fontes" são os 3 públicos (triangulação).
const FONTES_OBRIGATORIAS = ['socios', 'colaboradores', 'clientes'];
const PUBLICO_LABEL = {
  socios: 'Sócios e Diretores',
  colaboradores: 'Colaboradores e Líderes',
  clientes: 'Clientes e Fornecedores',
};

function statusFromMaturidade(m) {
  if (!m) return STATUS.NOT_STARTED;
  if (m.status === 'concluido') return STATUS.COMPLETED;
  if (m.status === 'em_andamento') return STATUS.IN_PROGRESS;
  return STATUS.NOT_STARTED;
}

// idn.status vem do id_v2_assessments (not_started|in_progress|completed);
// formStatuses = status por público (derivado dos respondentes).
function statusFromIdentidade(idn, formStatuses) {
  if (!idn) return STATUS.NOT_STARTED;
  if (idn.status === 'completed') return STATUS.COMPLETED;
  if (idn.status === 'in_progress') return STATUS.IN_PROGRESS;
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
      forms: FONTES_OBRIGATORIAS.map((p) => ({
        type: p,
        label: PUBLICO_LABEL[p],
        status: identidadeForms[p] || 'not_started',
        obrigatorio: true,
      })),
      publicos_concluidos: FONTES_OBRIGATORIAS.filter((p) => identidadeForms[p] === 'completed').length,
      publicos_total: FONTES_OBRIGATORIAS.length,
      top_gap: (idnResult.triangulacao || []).find((t) => t.gap != null) || null,
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
    a.push({ key: 'mat_start', title: 'Iniciar Mapa do Crescimento Integrado', reason: 'O cliente ainda não iniciou o diagnóstico de maturidade.', cta: 'Iniciar', priority: 'alta', module: 'maturity' });
  } else if (matStatus === P.IN_PROGRESS) {
    a.push({ key: 'mat_cont', title: 'Concluir Mapa do Crescimento Integrado', reason: 'Diagnóstico de maturidade em andamento — aguardando conclusão.', cta: 'Ver', priority: 'alta', module: 'maturity' });
  }

  // coleta por público (triangulação exige os 3)
  const PUB = { socios: 'Sócios/Diretores', colaboradores: 'Colaboradores/Líderes', clientes: 'Clientes/Fornecedores' };
  const prioPub = { socios: 'alta', colaboradores: 'media', clientes: 'baixa' };
  if (matStatus === P.COMPLETED || idnStatus !== P.NOT_STARTED) {
    for (const p of ['socios', 'colaboradores', 'clientes']) {
      if (identidadeForms[p] !== 'completed') {
        a.push({
          key: `idn_${p}`,
          title: `Coletar respostas de ${PUB[p]} (Identidade)`,
          reason: 'Fonte da triangulação do Mapa do Crescimento Integrado v2 ainda sem respostas concluídas.',
          cta: 'Copiar link',
          priority: prioPub[p],
          module: 'identity',
        });
      }
    }
  }

  if (socios.total > 0 && socios.concluidos < socios.total) {
    a.push({ key: 'disc_soc', title: 'Concluir Mapeamento Comportamental dos sócios', reason: `${socios.concluidos}/${socios.total} sócios concluíram o DISC.`, cta: 'Gerenciar', priority: 'media', module: 'disc' });
  }

  if (obrigDone) {
    a.push({ key: 'pdf', title: 'Gerar Relatório de Triangulação (Identidade)', reason: 'Os 3 públicos têm respostas — o relatório pode ser gerado.', cta: 'Gerar PDF', priority: 'media', module: 'report' });
  }

  return a;
}

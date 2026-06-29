import { db } from '../db';
import { AIRouter } from './router';
import { AGENTS_MAP } from '../agents';
import {
  CATALOGO_AGENTES,
  buildAgentConfigs,
  podeExecutar,
} from '../agents/catalog';
import { parseFindingsFromRaw, materializarFindings } from '../curadoria/extractFindings';
import { supabaseAdmin } from '../supabaseAdmin';
import {
  buildQualityMetadataPromptInstruction,
  parseQualityMetadataFromRaw,
} from '../output/qualityMetadata';
import {
  assertBrandMemoryExportsReadyForAgent16,
  extractBrandMemoryExportJson,
  getExpectedBrandMemorySlices,
  validateAgentBrandMemoryExport,
} from '../brand-memory/exportValidation';
import { getReadyCuratedEvidencePack } from '../curated-evidence/pack';
import {
  formatCheckpointNotesForPrompt,
  getRelevantCheckpointApprovalRecords,
} from '../checkpoints/structuredNotes';

export const AGENT_CONFIGS = buildAgentConfigs(AGENTS_MAP);

const STAGE_METADATA = {
  pre_diagnostico: { label: 'Pré-Diagnóstico' },
  diagnostico_interno: { label: 'Diagnóstico Interno' },
  diagnostico_externo: { label: 'Diagnóstico Externo' },
  sintese: { label: 'Síntese' },
  estrategia: { label: 'Estratégia' },
  visual_verbal: { label: 'Visual & Verbal' },
  cx: { label: 'CX' },
  comunicacao: { label: 'Comunicação' },
  marca_empregadora: { label: 'Marca Empregadora (EVP)', modular: true },
  encerramento: { label: 'Encerramento Editorial' },
};

export const STAGES = Object.fromEntries(
  Object.entries(STAGE_METADATA).map(([stage, metadata]) => [
    stage,
    {
      ...metadata,
      agents: CATALOGO_AGENTES
        .filter(agent => agent.stage === stage)
        .map(agent => agent.agent_num),
    },
  ]),
);

const AGENT_FORM_TYPES = {
  1: ['intake_socios', 'intake_colaboradores', 'posicionamento_estrategico'],
  2: ['intake_socios', 'intake_colaboradores', 'entrevista_socios', 'entrevista_colaboradores', 'posicionamento_estrategico'],
  3: ['intake_clientes'],
  4: ['intake_clientes', 'entrevista_cliente'],
  5: ['intake_socios'],
  6: ['posicionamento_estrategico'],
  // FIX.29 — Agente 13 lê intake_socios pra puxar canais ativos hoje,
  // faixa de orçamento, equipe atual e objetivos de comunicação 12m
  // (campos p5_canais_ativos_hoje, p5_canais_papel_principal,
  // p5_equipe_comunicacao, p5_orcamento_comunicacao_faixa, etc).
  13: ['intake_socios'],
  14: ['intake_colaboradores', 'entrevista_colaboradores'],
  // Agente 15 consome intake_socios apenas para extrair, via enrichContext,
  // o nome do sócio-fundador principal (destinatário da carta) e o
  // período aproximado da escuta (timestamps dos formulários).
  15: ['intake_socios'],
};

const AGENTS_WITH_CIS = new Set([1, 2, 6]);
const AGENTS_WITH_QUALITY_METADATA = new Set([6, 9, 11, 12, 13]);

async function loadAgentContext(projetoId, agentNum, {
  includeCheckpointRecords = false,
  includePipelineExtras = false,
} = {}) {
  const agent = AGENTS_MAP[agentNum];
  if (!agent) throw new Error(`Agente ${agentNum} não implementado no AGENTS_MAP`);

  const config = AGENT_CONFIGS[agentNum];
  const inputs = config.inputs || [];
  const optionalInputs = config.optionalInputs || [];
  const contextInputs = [...new Set([...inputs, ...optionalInputs])];

  const context = {
    projeto: await db.getProject(projetoId),
    intake: await db.getIntake(projetoId),
    previousOutputs: {},
    formularios: [],
    cisAssessments: [],
    checkpointApprovalRecords: [],
    _agentInputs: inputs,
    _agentOptionalInputs: optionalInputs,
  };

  if (contextInputs.length > 0) {
    context.previousOutputs = await db.getOutputs(projetoId, contextInputs);
  }

  const formTypes = AGENT_FORM_TYPES[agentNum] || [];
  if (formTypes.length > 0) {
    const results = await Promise.all(formTypes.map(t => db.getFormularios(projetoId, t)));
    context.formularios = results.flat();
  }

  if (AGENTS_WITH_CIS.has(agentNum)) {
    context.cisAssessments = await db.getCisAssessmentsByProjeto?.(projetoId) || [];
  }

  if (includeCheckpointRecords && supabaseAdmin) {
    try {
      context.checkpointApprovalRecords = await getRelevantCheckpointApprovalRecords(
        supabaseAdmin,
        projetoId,
        agentNum
      );
    } catch (e) {
      console.error('[pipeline] falha ao carregar ressalvas de checkpoints:', e.message);
      context.checkpointApprovalRecords = [];
    }
  }

  // FIX.29 (Fase C) — Agente 13 (Comunicação) consome clusters
  // formais definidos no painel admin. Lente AC pra comunicação
  // (Persona ≠ Cluster).
  // FIX.33 — apenas clusters com ativo=true entram no input. O
  // consultor seleciona quais usar via checkbox no painel.
  if (includePipelineExtras && agentNum === 13 && supabaseAdmin) {
    try {
      const { data: clusters } = await supabaseAdmin
        .from('clusters_comunicacao')
        .select('*')
        .eq('projeto_id', projetoId)
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });
      context.clustersComunicacao = clusters || [];
    } catch (e) {
      console.error('[pipeline] falha ao carregar clusters:', e.message);
      context.clustersComunicacao = [];
    }
  }

  if (includePipelineExtras && agentNum === 6 && supabaseAdmin) {
    try {
      context.curatedEvidencePack = await getReadyCuratedEvidencePack(supabaseAdmin, projetoId);
    } catch (e) {
      console.error('[pipeline] falha ao carregar curatedEvidencePack:', e.message);
      context.curatedEvidencePack = null;
    }
  }

  // FIX.24 — Agente 15 (editorial) consome blocos APROVADOS pela
  // curadoria como insumo prioritário. Filtra apenas o que entra no
  // relatório final (incluir_no_relatorio = true E status entre os
  // aprovados/editados/validados).
  if (includePipelineExtras && agentNum === 15 && supabaseAdmin) {
    try {
      const { data: blocks } = await supabaseAdmin
        .from('analysis_blocks')
        .select('*')
        .eq('projeto_id', projetoId)
        .eq('incluir_no_relatorio', true)
        .in('status', ['aprovado', 'editado', 'validado_cliente'])
        .order('agent_num', { ascending: true })
        .order('categoria', { ascending: true });
      context.curatedBlocks = blocks || [];
    } catch (e) {
      console.error('[pipeline] falha ao carregar curatedBlocks:', e.message);
      context.curatedBlocks = [];
    }
  }

  return { agent, config, context, inputs, optionalInputs };
}

async function buildForAgent(projetoId, agentNum, { precomputedEnrichment } = {}) {
  const { agent, context, inputs } = await loadAgentContext(projetoId, agentNum, {
    includeCheckpointRecords: true,
    includePipelineExtras: true,
  });

  let finalContext = context;
  // Se o frontend passou enrichment pré-computado (caso do split em 2
  // etapas para Agentes caros como o 5), mesclamos direto e pulamos o
  // enrichContext do agent — evita rodar deep research duas vezes.
  if (precomputedEnrichment && typeof precomputedEnrichment === 'object') {
    finalContext = { ...context, ...precomputedEnrichment };
  } else if (typeof agent.enrichContext === 'function') {
    finalContext = await agent.enrichContext(context);
  }

  const systemParts = [agent.getSystemPrompt()];
  if (AGENTS_WITH_QUALITY_METADATA.has(agentNum)) {
    systemParts.push(buildQualityMetadataPromptInstruction());
  }

  const checkpointNotesPrompt = formatCheckpointNotesForPrompt(
    finalContext.checkpointApprovalRecords || context.checkpointApprovalRecords || []
  );
  if (checkpointNotesPrompt) {
    systemParts.push('\n\n' + checkpointNotesPrompt);
  }

  // FIX.12 — evita duplicação de contexto quando o agente já consome
  // previousOutputs no próprio getUserPrompt (flag consumesContextInUserPrompt).
  // Antes, o mesmo conteúdo era empurrado no system prompt aqui E no user prompt,
  // inflando input em 40-60k tokens e contribuindo pra timeouts no Agente 6
  // (e em qualquer agente que consuma múltiplos outputs anteriores).
  const consumesInUser = agent.consumesContextInUserPrompt === true;

  if (inputs.length > 0 && !consumesInUser) {
    systemParts.push('\n\n## Contexto Acumulado (Outputs Anteriores)\n');
    for (const n of inputs) {
      const prev = finalContext.previousOutputs[n];
      if (prev) {
        const agentName = AGENT_CONFIGS[n].name;
        systemParts.push(`### Output ${n} — ${agentName}`);
        systemParts.push(`**Resumo:** ${prev.resumo_executivo || '(sem resumo)'}`);
        systemParts.push(prev.conteudo || '');
        systemParts.push(`**Conclusões:** ${prev.conclusoes || ''}\n`);
      }
    }
  }

  return {
    systemPrompt: systemParts.join('\n'),
    userPrompt: agent.getUserPrompt(finalContext),
    agent,
  };
}

export const Pipeline = {
  // Executa APENAS o enrichContext do agent (deep research + Tavily,
  // no caso do 5). Retorna o payload pro frontend injetar na chamada
  // de síntese. Usado pra split de agentes caros em 2 etapas.
  async enrichOnly(projetoId, agentNum) {
    const { agent, context } = await loadAgentContext(projetoId, agentNum);
    if (typeof agent.enrichContext !== 'function') {
      return {}; // nada a enriquecer — agent não precisa de etapa prévia
    }

    const enriched = await agent.enrichContext(context);
    // Retorna SÓ os campos novos que o enrichContext acrescentou — não
    // o context inteiro (projeto, formularios etc. o /run refetcha por
    // conta própria). Calcula via diff das keys.
    const novos = {};
    for (const [k, v] of Object.entries(enriched)) {
      if (!(k in context)) novos[k] = v;
    }
    return novos;
  },

  async runAgent(projetoId, agentNum, modelKey, precomputedEnrichment) {
    const config = AGENT_CONFIGS[agentNum];
    if (!config) throw new Error(`Agente ${agentNum} não existe na configuração`);

    // FIX.4 — validação dura de dependências ANTES de preparar o
    // contexto. Sem isto, o pipeline aceitava context parcial e gerava
    // saídas silenciosamente ruins (ex.: Agente 6 rodando sem output
    // 2/4/5 porque o admin apagou um deles).
    const existentes = await db.getOutputs(projetoId, null);
    const agentNumsPresentes = Object.keys(existentes || {}).map(n => Number(n));
    const deps = podeExecutar(agentNum, agentNumsPresentes);
    if (!deps.ok) {
      throw new Error(
        `${deps.motivo} Execute o${deps.faltando.length > 1 ? 's' : ''} agente${deps.faltando.length > 1 ? 's' : ''} ${deps.faltando.join(', ')} antes.`,
      );
    }

    const pending = await db.getPendingCheckpoints(projetoId);
    if (pending && pending.length > 0) {
      for (const cp of pending) {
        for (const [num, cfg] of Object.entries(AGENT_CONFIGS)) {
          if (cfg.checkpoint === cp.checkpoint_num && agentNum > Number(num)) {
            throw new Error(`Checkpoint ${cp.checkpoint_num} pendente. Aprove antes de executar Agente ${agentNum}`);
          }
        }
      }
    }

    if (agentNum === 16) {
      const projeto = await db.getProject(projetoId);
      assertBrandMemoryExportsReadyForAgent16(existentes, { includeEvp: !!projeto?.tem_evp });
    }

    console.log(`Pipeline: executando Agente ${agentNum} (${config.name}) para ${projetoId}`);

    const prompts = await buildForAgent(projetoId, agentNum, { precomputedEnrichment });

    // Fallback para o preferredModel do agente quando o usuário não escolheu um
    const effectiveModelKey = modelKey || prompts.agent?.preferredModel || undefined;

    // FIX.12 — agente pode declarar teto próprio de max_tokens via
    // preferredMaxTokens (ex.: Agente 6 usa 12k em vez do default 16k).
    // Opcional — sem isso, AIRouter aplica MAX_OUTPUT_TOKENS=16000.
    const callOptions = { modelKey: effectiveModelKey };
    if (typeof prompts.agent?.preferredMaxTokens === 'number') {
      callOptions.maxTokens = prompts.agent.preferredMaxTokens;
    }

    let response;
    try {
      response = await AIRouter.callModel(
        prompts.systemPrompt,
        [{ role: 'user', content: prompts.userPrompt }],
        callOptions
      );
    } catch (error) {
      await db.logExecution(projetoId, agentNum, { status: 'erro', error: error.message });
      throw error;
    }

    // FIX.32 — Guard de completude. O Agente 6 (e outros densos) já saiu
    // truncado salvando como "ok" silenciosamente (PARTE B cortada no meio).
    // Detectamos saída incompleta por dois sinais e abortamos ANTES de salvar:
    //   (a) finish_reason de limite de tokens (Gemini MAX_TOKENS / OpenAI
    //       length / Claude max_tokens);
    //   (b) envelope <conteudo> aberto e nunca fechado (geração interrompida).
    {
      const rawOut = response.text || '';
      const finish = String(response.finishReason || '').toUpperCase();
      const truncadoPorLimite = ['MAX_TOKENS', 'LENGTH'].includes(finish);
      const envelopeAberto = rawOut.includes('<conteudo>') && !rawOut.includes('</conteudo>');
      if (truncadoPorLimite || envelopeAberto) {
        const motivo = truncadoPorLimite
          ? `o modelo atingiu o limite de tokens de saída (finish_reason=${finish})`
          : 'o texto terminou sem fechar a seção <conteudo> (geração interrompida)';
        const msg = `Agente ${agentNum}: saída truncada/incompleta — ${motivo}. Rode novamente, de preferência com um modelo maior ou com mais tokens.`;
        await db.logExecution(projetoId, agentNum, {
          status: 'truncado',
          error: msg,
          tokensIn: response.tokensIn,
          tokensOut: response.tokensOut,
          model: response.model,
        });
        throw new Error(msg);
      }
    }

    const parsed = prompts.agent.parseOutput(response.text);
    if (AGENTS_WITH_QUALITY_METADATA.has(agentNum)) {
      parsed.quality_metadata = parseQualityMetadataFromRaw(response.text);
    }

    // FIX.24 — extrai findings_json estruturado do raw text antes de salvar.
    // Se o modelo não emitiu (ou JSON inválido), fica null e o
    // materializador cai no parser heurístico do conteudo markdown.
    parsed.findings_json = parseFindingsFromRaw(response.text);

    const expectedBrandMemorySlices = getExpectedBrandMemorySlices(agentNum);
    const brandMemoryExportValidation = validateAgentBrandMemoryExport({
      agentId: String(agentNum),
      outputContent: response.text,
      expectedSlices: expectedBrandMemorySlices,
    });
    parsed.brand_memory_export_status = brandMemoryExportValidation.status;
    parsed.brand_memory_export_validation_result = brandMemoryExportValidation;
    parsed.brand_memory_export_validated_at = new Date().toISOString();
    if (['valid', 'warning'].includes(brandMemoryExportValidation.status)) {
      try {
        parsed.brand_memory_export_json = extractBrandMemoryExportJson(response.text);
      } catch {
        parsed.brand_memory_export_json = null;
      }
    } else {
      parsed.brand_memory_export_json = null;
    }

    const savedOutput = await db.saveOutput(projetoId, agentNum, parsed);

    // FIX.24 — materializa analysis_blocks a partir do output salvo.
    // Não bloqueia o fluxo se falhar — log + continuar.
    if (savedOutput && supabaseAdmin) {
      try {
        await materializarFindings(supabaseAdmin, savedOutput);
      } catch (e) {
        console.error('[pipeline] materializarFindings falhou:', e.message);
      }
    }

    await db.logExecution(projetoId, agentNum, {
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      model: response.model,
      status: 'ok',
    });
    await db.updateProjectStatus(projetoId, `agente_${agentNum}_concluido`, agentNum);

    if (config.checkpoint) {
      await db.createCheckpoint(projetoId, config.checkpoint);
      await db.updateProjectStatus(projetoId, `checkpoint_${config.checkpoint}_pendente`, agentNum);
    }

    return parsed;
  },
};

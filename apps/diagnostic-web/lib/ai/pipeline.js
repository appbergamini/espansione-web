import { db } from '../db';
import { AIRouter } from './router';
import { AGENTS_MAP } from '../agents';
import { podeExecutar } from '../agents/catalog';
import { parseFindingsFromRaw, materializarFindings } from '../curadoria/extractFindings';
import { supabaseAdmin } from '../supabaseAdmin';

export const AGENT_CONFIGS = {
  1:  { name: 'Roteiros VI — Entrevistas Internas',      stage: 'pre_diagnostico',      inputs: [],            checkpoint: null },
  2:  { name: 'Consolidado da Visão Interna (VI)',        stage: 'diagnostico_interno',  inputs: [1],           checkpoint: null },
  3:  { name: 'Roteiros VE — Entrevistas Cliente',        stage: 'diagnostico_externo',  inputs: [2],           checkpoint: null },
  4:  { name: 'Consolidado da Visão Externa (VE)',        stage: 'diagnostico_externo',  inputs: [3],           checkpoint: null },
  5:  { name: 'Visão de Mercado (VM)',                    stage: 'diagnostico_externo',  inputs: [],            checkpoint: null },
  6:  { name: 'Decodificação e Direcionamento Estratégico', stage: 'sintese',            inputs: [2, 4, 5],     checkpoint: 1    },
  7:  { name: 'Valores e Atributos',                      stage: 'estrategia',           inputs: [6],           checkpoint: null },
  8:  { name: 'Diretrizes Estratégicas',                  stage: 'estrategia',           inputs: [6, 7],        checkpoint: null },
  9:  { name: 'Plataforma de Branding',                   stage: 'estrategia',           inputs: [6, 7, 8],     checkpoint: 2    },
  10: { name: 'Identidade Verbal (UVV)',                  stage: 'visual_verbal',        inputs: [6, 9],        checkpoint: null },
  11: { name: 'One Page de Personalidade (Visual)',       stage: 'visual_verbal',        inputs: [6, 9, 10],    checkpoint: 3    },
  12: { name: 'One Page de Experiência',                  stage: 'cx',                   inputs: [6, 9],        checkpoint: null },
  13: { name: 'Plano de Comunicação — A Marca Fala',      stage: 'comunicacao',          inputs: [6, 7, 8, 9, 10, 11, 12], checkpoint: 4 },
  // Modular — só roda se o projeto contratou escopo de Marca Empregadora.
  // Sem checkpoint próprio; aprovação acompanha o CKPT 4 (Agente 13).
  // Flag `modular` consumida pela UI (decide se exibe botão) e pela
  // TASK 4.4 (decide se inclui Parte 5.2 do entregável final).
  14: { name: 'Plataforma de Marca Empregadora (EVP)',    stage: 'marca_empregadora',    inputs: [2, 6, 7, 9], checkpoint: null, modular: true },
  // Último agente do pipeline editorial. Roda APÓS CKPT 4 aprovado —
  // a lógica de bloqueio em Pipeline.runAgent já garante isso:
  // agentNum=15 > 13 (que criou CKPT 4), então pending CKPT 4 bloqueia.
  // Consome apenas resumo_executivo + conclusoes dos demais (context
  // window tratável). Gera Carta de Abertura + Sumário Executivo para
  // a Parte 0 do entregável final (TASK 4.4).
  15: { name: 'Consolidador Editorial do Entregável Final', stage: 'encerramento',       inputs: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], checkpoint: null },
};

export const STAGES = {
  pre_diagnostico:     { agents: [1],               label: 'Pré-Diagnóstico' },
  diagnostico_interno: { agents: [2],               label: 'Diagnóstico Interno' },
  diagnostico_externo: { agents: [3, 4, 5],         label: 'Diagnóstico Externo' },
  sintese:             { agents: [6],               label: 'Síntese' },
  estrategia:          { agents: [7, 8, 9],         label: 'Estratégia' },
  visual_verbal:       { agents: [10, 11],          label: 'Visual & Verbal' },
  cx:                  { agents: [12],              label: 'CX' },
  comunicacao:         { agents: [13],              label: 'Comunicação' },
  marca_empregadora:   { agents: [14],              label: 'Marca Empregadora (EVP)', modular: true },
  encerramento:        { agents: [15],              label: 'Encerramento Editorial' },
};

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

async function buildForAgent(projetoId, agentNum, { precomputedEnrichment } = {}) {
  const agent = AGENTS_MAP[agentNum];
  if (!agent) throw new Error(`Agente ${agentNum} não implementado no AGENTS_MAP`);

  const config = AGENT_CONFIGS[agentNum];

  const inputs = config.inputs || [];
  const context = {
    projeto: await db.getProject(projetoId),
    intake: await db.getIntake(projetoId),
    previousOutputs: {},
    formularios: [],
    cisAssessments: [],
    _agentInputs: inputs,
  };

  if (inputs.length > 0) {
    context.previousOutputs = await db.getOutputs(projetoId, inputs);
  }

  const formTypes = AGENT_FORM_TYPES[agentNum] || [];
  if (formTypes.length > 0) {
    const results = await Promise.all(formTypes.map(t => db.getFormularios(projetoId, t)));
    context.formularios = results.flat();
  }

  if (AGENTS_WITH_CIS.has(agentNum)) {
    context.cisAssessments = await db.getCisAssessmentsByProjeto?.(projetoId) || [];
  }

  // FIX.29 (Fase C) — Agente 13 (Comunicação) consome clusters
  // formais definidos no painel admin. Lente AC pra comunicação
  // (Persona ≠ Cluster).
  // FIX.33 — apenas clusters com ativo=true entram no input. O
  // consultor seleciona quais usar via checkbox no painel.
  if (agentNum === 13 && supabaseAdmin) {
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

  // FIX.24 — Agente 15 (editorial) consome blocos APROVADOS pela
  // curadoria como insumo prioritário. Filtra apenas o que entra no
  // relatório final (incluir_no_relatorio = true E status entre os
  // aprovados/editados/validados).
  if (agentNum === 15 && supabaseAdmin) {
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
    const agent = AGENTS_MAP[agentNum];
    if (!agent) throw new Error(`Agente ${agentNum} não implementado no AGENTS_MAP`);
    if (typeof agent.enrichContext !== 'function') {
      return {}; // nada a enriquecer — agent não precisa de etapa prévia
    }

    const config = AGENT_CONFIGS[agentNum];
    const inputs = config.inputs || [];
    const context = {
      projeto: await db.getProject(projetoId),
      intake: await db.getIntake(projetoId),
      previousOutputs: inputs.length > 0 ? await db.getOutputs(projetoId, inputs) : {},
      formularios: [],
      cisAssessments: [],
      _agentInputs: inputs,
    };

    const formTypes = AGENT_FORM_TYPES[agentNum] || [];
    if (formTypes.length > 0) {
      const results = await Promise.all(formTypes.map(t => db.getFormularios(projetoId, t)));
      context.formularios = results.flat();
    }

    if (AGENTS_WITH_CIS.has(agentNum)) {
      context.cisAssessments = await db.getCisAssessmentsByProjeto?.(projetoId) || [];
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

    const parsed = prompts.agent.parseOutput(response.text);

    // FIX.24 — extrai findings_json estruturado do raw text antes de salvar.
    // Se o modelo não emitiu (ou JSON inválido), fica null e o
    // materializador cai no parser heurístico do conteudo markdown.
    parsed.findings_json = parseFindingsFromRaw(response.text);

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

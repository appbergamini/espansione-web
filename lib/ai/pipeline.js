import { db } from '../db';
import { AIRouter } from './router';
import { AGENTS_MAP } from '../agents';

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
};

const AGENT_FORM_TYPES = {
  1: ['intake_socios', 'intake_colaboradores', 'posicionamento_estrategico'],
  2: ['intake_socios', 'intake_colaboradores', 'entrevista_socios', 'entrevista_colaboradores', 'posicionamento_estrategico'],
  3: ['intake_clientes'],
  4: ['intake_clientes', 'entrevista_cliente'],
  5: ['intake_socios'],
  6: ['posicionamento_estrategico'],
  14: ['intake_colaboradores', 'entrevista_colaboradores'],
};

const AGENTS_WITH_CIS = new Set([1, 2, 6]);

async function buildForAgent(projetoId, agentNum) {
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

  let finalContext = context;
  if (typeof agent.enrichContext === 'function') {
    finalContext = await agent.enrichContext(context);
  }

  const systemParts = [agent.getSystemPrompt()];

  if (inputs.length > 0) {
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
  async runAgent(projetoId, agentNum, modelKey) {
    const config = AGENT_CONFIGS[agentNum];
    if (!config) throw new Error(`Agente ${agentNum} não existe na configuração`);

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

    const prompts = await buildForAgent(projetoId, agentNum);

    // Fallback para o preferredModel do agente quando o usuário não escolheu um
    const effectiveModelKey = modelKey || prompts.agent?.preferredModel || undefined;

    let response;
    try {
      response = await AIRouter.callModel(
        prompts.systemPrompt,
        [{ role: 'user', content: prompts.userPrompt }],
        { modelKey: effectiveModelKey }
      );
    } catch (error) {
      await db.logExecution(projetoId, agentNum, { status: 'erro', error: error.message });
      throw error;
    }

    const parsed = prompts.agent.parseOutput(response.text);

    await db.saveOutput(projetoId, agentNum, parsed);
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

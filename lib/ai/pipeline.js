import { db } from '../db';
import { AIRouter } from './router';
import { AGENTS_MAP } from '../agents';

export const AGENT_CONFIGS = {
  1:  { name: 'Roteiros de Entrevista Internos',  stage: 'pre_diagnostico',      inputs: [],            checkpoint: null },
  2:  { name: 'Documento de Contexto Interno',    stage: 'diagnostico_interno',  inputs: [1],           checkpoint: null },
  3:  { name: 'Roteiro de Entrevista com Cliente', stage: 'diagnostico_externo', inputs: [2],           checkpoint: null },
  4:  { name: 'Documento de Contexto Externo',    stage: 'diagnostico_externo', inputs: [3],           checkpoint: null },
  5:  { name: 'Pesquisa Web',                     stage: 'diagnostico_externo', inputs: [],            checkpoint: null },
  6:  { name: 'Documento de Visão Geral',         stage: 'sintese',             inputs: [2, 4, 5],     checkpoint: 1    },
  7:  { name: 'Decodificação de Valores',         stage: 'estrategia',          inputs: [6],           checkpoint: null },
  8:  { name: 'Diretrizes Estratégicas',          stage: 'estrategia',          inputs: [6, 7],        checkpoint: null },
  9:  { name: 'Plataforma de Branding',           stage: 'estrategia',          inputs: [6, 7, 8],     checkpoint: 2    },
  10: { name: 'Identidade Verbal',                stage: 'visual_verbal',       inputs: [6, 9],        checkpoint: null },
  11: { name: 'Identidade Visual (Briefing)',     stage: 'visual_verbal',       inputs: [6, 9, 10],    checkpoint: 3    },
  12: { name: 'CX — Personas, Jornada & Moments', stage: 'cx',                  inputs: [6, 9],        checkpoint: null },
  13: { name: 'Comunicação Tática',               stage: 'comunicacao',         inputs: [6, 7, 8, 9, 10, 11, 12], checkpoint: 4 },
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
};

const AGENT_FORM_TYPES = {
  1: ['intake_socios', 'intake_colaboradores'],
  2: ['intake_socios', 'intake_colaboradores', 'entrevista_socios', 'entrevista_colaboradores'],
  3: ['intake_clientes'],
  4: ['intake_clientes', 'entrevista_cliente'],
};

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

  if (agentNum === 6) {
    context.cisAssessments = await db.getCisAssessmentsByProjeto?.(projetoId) || [];
  }

  const systemParts = [agent.getSystemPrompt()];

  if (inputs.length > 0) {
    systemParts.push('\n\n## Contexto Acumulado (Outputs Anteriores)\n');
    for (const n of inputs) {
      const prev = context.previousOutputs[n];
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
    userPrompt: agent.getUserPrompt(context),
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

    let response;
    try {
      response = await AIRouter.callModel(
        prompts.systemPrompt,
        [{ role: 'user', content: prompts.userPrompt }],
        { modelKey, useGrounding: prompts.agent.useGrounding === true }
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

import { db } from '../db';
import { AIRouter } from './router';
import { AGENTS_MAP } from '../agents';

// =============== Configurações baseadas no Config.js antigo ===============
export const AGENT_CONFIGS = {
  0:  { name: "Intake & Briefing Inicial",     stage: "pre_diagnostico", inputs: [],                   checkpoint: null },
  1:  { name: "Visao Interna",                  stage: "diagnostico",     inputs: [0],                  checkpoint: null },
  2:  { name: "Visao Externa",                  stage: "diagnostico",     inputs: [0],                  checkpoint: null },
  3:  { name: "Visao de Mercado",               stage: "diagnostico",     inputs: [0],                  checkpoint: 1    },
  4:  { name: "Decodificacao de Valores",        stage: "diagnostico",     inputs: [0, 1, 2, 3],         checkpoint: null },
  5:  { name: "Diretrizes Estrategicas",         stage: "diagnostico",     inputs: [0, 1, 2, 3, 4],      checkpoint: null },
  6:  { name: "Plataforma de Branding",          stage: "diagnostico",     inputs: [0, 1, 2, 3, 4, 5],   checkpoint: 2    },
  7:  { name: "Identidade Verbal",               stage: "visual_verbal",   inputs: [1, 6],               checkpoint: null },
  8:  { name: "Identidade Visual (Briefing)",    stage: "visual_verbal",   inputs: [6, 7],               checkpoint: 3    },
  9:  { name: "CX - Persona, Jornada & Moments", stage: "cx",             inputs: [1, 2, 3, 5, 6],      checkpoint: null },
  10: { name: "Comunicacao",                     stage: "comunicacao",     inputs: [0,1,2,3,4,5,6,7,8,9], checkpoint: 4   }
};

const STAGES = {
  pre_diagnostico: { agents: [0],              label: "Pre-Diagnostico" },
  diagnostico:     { agents: [1,2,3,4,5,6],    label: "Diagnostico" },
  visual_verbal:   { agents: [7,8],            label: "Visual & Verbal" },
  cx:              { agents: [9],              label: "CX" },
  comunicacao:     { agents: [10],             label: "Comunicacao" }
};

// =============== PromptBuilder interno ===============
async function buildForAgent(projetoId, agentNum) {
  const agent = AGENTS_MAP[agentNum];
  if (!agent) throw new Error(`Agente ${agentNum} não implementado ainda no AGENTS_MAP`);
  
  const config = AGENT_CONFIGS[agentNum];

  // Carregar contexto
  const context = {
    projeto: await db.getProject(projetoId),
    intake: await db.getIntake(projetoId),
    previousOutputs: {},
    formularios: []
  };

  // Carregar outputs anteriores
  const inputs = config.inputs || [];
  if (inputs.length > 0) {
    context.previousOutputs = await db.getOutputs(projetoId, inputs);
  }

  // Lógica de formulários (simplificado do GAS original)
  if (agentNum === 1) {
    const entrevista = await db.getFormularios(projetoId, "entrevista");
    const proposito = await db.getFormularios(projetoId, "proposito");
    const colaboradores = await db.getFormularios(projetoId, "pesquisa_colaboradores");
    context.formularios = [...entrevista, ...proposito, ...colaboradores];
  } else if (agentNum === 2) {
    context.formularios = await db.getFormularios(projetoId, "questionario_externo");
  }

  // Montar System Prompt
  const systemParts = [agent.getSystemPrompt()];

  if (inputs.length > 0) {
    systemParts.push("\n\n## Contexto Acumulado (Outputs Anteriores)\n");
    for (let n of inputs) {
      const prev = context.previousOutputs[n];
      if (prev) {
        const agentName = AGENT_CONFIGS[n].name;
        if (agentNum === 10) {
          systemParts.push(`### Output ${n} - ${agentName}`);
          systemParts.push(prev.resumo_executivo || "(sem resumo)");
          systemParts.push("");
        } else {
          systemParts.push(`### Output ${n} - ${agentName}`);
          systemParts.push(`**Resumo:** ${prev.resumo_executivo || "(sem resumo)"}`);
          systemParts.push(prev.conteudo || "");
          systemParts.push(`**Conclusoes:** ${prev.conclusoes || ""}\n`);
        }
      }
    }
  }

  return {
    systemPrompt: systemParts.join("\n"),
    userPrompt: agent.getUserPrompt(context),
    agent
  };
}

// =============== Pipeline de Execução ===============
export const Pipeline = {

  async runAgent(projetoId, agentNum, modelKey) {
    const config = AGENT_CONFIGS[agentNum];
    if (!config) throw new Error(`Agente ${agentNum} não existe na configuração`);

    // Validação de Checkpoints pendentes
    const pending = await db.getPendingCheckpoints(projetoId);
    if (pending && pending.length > 0) {
      for (let cp = 1; cp <= 4; cp++) {
        const isPending = pending.some(p => p.checkpoint_num === cp);
        if (isPending) {
          for (let a = 0; a <= 10; a++) {
            if (AGENT_CONFIGS[a].checkpoint === cp && agentNum > a) {
              throw new Error(`Checkpoint ${cp} pendente. Aprove antes de executar Agente ${agentNum}`);
            }
          }
        }
      }
    }

    console.log(`Pipeline: executando Agente ${agentNum} (${config.name}) para ${projetoId}`);

    // Montar prompts
    const prompts = await buildForAgent(projetoId, agentNum);

    let response;
    try {
      response = await AIRouter.callModel(
        prompts.systemPrompt, 
        [{ role: "user", content: prompts.userPrompt }], 
        { modelKey }
      );
    } catch (error) {
      await db.logExecution(projetoId, agentNum, { status: "erro", error: error.message });
      throw error;
    }

    // Parse output via módulo do agente
    const parsed = prompts.agent.parseOutput(response.text);

    // Salvar no BD
    await db.saveOutput(projetoId, agentNum, parsed);

    // Log execucao
    await db.logExecution(projetoId, agentNum, {
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      model: response.model,
      status: "ok"
    });

    // Atualiza status do projeto
    await db.updateProjectStatus(projetoId, `agente_${agentNum}_concluido`, agentNum);

    // Criar checkpoint se o agente terminar
    if (config.checkpoint) {
      await db.createCheckpoint(projetoId, config.checkpoint);
      await db.updateProjectStatus(projetoId, `checkpoint_${config.checkpoint}_pendente`, agentNum);
    }

    return parsed;
  }
};

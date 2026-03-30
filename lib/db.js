import { supabase } from './supabaseClient';

// =====================================================================
// db.js
// Abstração de banco de dados para substituir o StateManager.js do GAS
// =====================================================================

export const db = {
  // ── Projetos ─────────────────────────────────────────────────────

  async createProject(dados) {
    const { data, error } = await supabase
      .from('projetos')
      .insert([
        {
          cliente: dados.cliente || '',
          segmento: dados.segmento || '',
          porte: dados.tempo_mercado || dados.porte || '',
          momento: dados.colaboradores || dados.momento || '',
          objetivo: dados.motivacao || dados.objetivo || '',
          contato: dados.contato || '',
          status: 'intake',
          etapa_atual: 0,
        }
      ])
      .select('id')
      .single();

    if (error) throw new Error(`Erro createProject: ${error.message}`);
    return data.id;
  },

  async getProject(projetoId) {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('id', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Erro getProject: ${error.message}`);
    return data || null;
  },

  async updateProjectStatus(projetoId, status, agentNum) {
    const updatePayload = {
      status
    };
    if (agentNum !== undefined) {
      updatePayload.etapa_atual = agentNum;
    }

    const { error } = await supabase
      .from('projetos')
      .update(updatePayload)
      .eq('id', projetoId);

    if (error) throw new Error(`Erro updateProjectStatus: ${error.message}`);
  },

  async getAllProjects() {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro getAllProjects: ${error.message}`);
    return data || [];
  },

  // ── Outputs ──────────────────────────────────────────────────────

  async saveOutput(projetoId, agentNum, output) {
    const { error } = await supabase
      .from('outputs')
      .insert([
        {
          projeto_id: projetoId,
          agent_num: agentNum,
          conteudo: output.conteudo || '',
          resumo_executivo: output.resumo_executivo || '',
          conclusoes: output.conclusoes || '',
          confianca: output.confianca || 'Media',
          fontes: output.fontes || '',
          gaps: output.gaps || ''
        }
      ]);

    if (error) throw new Error(`Erro saveOutput: ${error.message}`);
  },

  async getOutput(projetoId, agentNum) {
    const { data, error } = await supabase
      .from('outputs')
      .select('*')
      .eq('projeto_id', projetoId)
      .eq('agent_num', agentNum)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Erro getOutput: ${error.message}`);
    return data && data.length > 0 ? data[0] : null;
  },

  async getOutputs(projetoId, agentNums) {
    const { data, error } = await supabase
      .from('outputs')
      .select('*')
      .eq('projeto_id', projetoId)
      .in('agent_num', agentNums)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro getOutputs: ${error.message}`);
    
    // Agrupa para retornar o mais recente por agente
    const result = {};
    if (data) {
      data.forEach((out) => {
        if (!result[out.agent_num]) {
          result[out.agent_num] = out;
        }
      });
    }
    return result;
  },

  // ── Intake ───────────────────────────────────────────────────────

  async saveIntake(projetoId, campos) {
    const inserts = Object.keys(campos).map(k => ({
      projeto_id: projetoId,
      campo: k,
      valor: typeof campos[k] === 'string' ? campos[k] : JSON.stringify(campos[k])
    }));

    if (inserts.length === 0) return;

    const { error } = await supabase
      .from('intake_data')
      .insert(inserts);

    if (error) throw new Error(`Erro saveIntake: ${error.message}`);
  },

  async getIntake(projetoId) {
    const { data, error } = await supabase
      .from('intake_data')
      .select('campo, valor')
      .eq('projeto_id', projetoId);

    if (error) throw new Error(`Erro getIntake: ${error.message}`);
    
    const result = {};
    if (data) Object.entries(data).forEach(([i, row]) => { result[row.campo] = row.valor });
    return result;
  },

  // ── Formulários ──────────────────────────────────────────────────

  async saveFormulario(projetoId, tipo, respondente, respostas) {
    const { error } = await supabase
      .from('formularios')
      .insert([
        {
          projeto_id: projetoId,
          tipo,
          respondente,
          respostas_json: respostas || {}
        }
      ]);

    if (error) throw new Error(`Erro saveFormulario: ${error.message}`);
  },

  async getFormularios(projetoId, tipo) {
    let query = supabase
      .from('formularios')
      .select('*')
      .eq('projeto_id', projetoId);
      
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw new Error(`Erro getFormularios: ${error.message}`);
    return data || [];
  },

  // ── Checkpoints ──────────────────────────────────────────────────

  async createCheckpoint(projetoId, checkpointNum) {
    const { error } = await supabase
      .from('checkpoints')
      .insert([
        {
          projeto_id: projetoId,
          checkpoint_num: checkpointNum,
          status: 'pendente',
          notas: ''
        }
      ]);

    if (error) throw new Error(`Erro createCheckpoint: ${error.message}`);
  },

  async getCheckpoint(projetoId, checkpointNum) {
    const { data, error } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('projeto_id', projetoId)
      .eq('checkpoint_num', checkpointNum)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Erro getCheckpoint: ${error.message}`);
    return data && data.length > 0 ? data[0] : null;
  },

  async updateCheckpoint(projetoId, checkpointNum, status, notas) {
    // Para simplificar, atualizamos o mais recente pendente
    const ckpt = await this.getCheckpoint(projetoId, checkpointNum);
    if (!ckpt) return;

    const { error } = await supabase
      .from('checkpoints')
      .update({ status, notas })
      .eq('id', ckpt.id);

    if (error) throw new Error(`Erro updateCheckpoint: ${error.message}`);
  },

  async getPendingCheckpoints(projetoId) {
    const { data, error } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('projeto_id', projetoId)
      .eq('status', 'pendente');

    if (error) throw new Error(`Erro getPendingCheckpoints: ${error.message}`);
    return data || [];
  },

  // ── Log ──────────────────────────────────────────────────────────

  async logExecution(projetoId, agentNum, stats) {
    const { error } = await supabase
      .from('logs_execucao')
      .insert([
        {
          projeto_id: projetoId || null,
          agente: String(agentNum),
          tokens_in: stats.tokensIn || 0,
          tokens_out: stats.tokensOut || 0,
          modelo: stats.model || '',
          status: stats.status || 'ok',
          error_msg: stats.error || ''
        }
      ]);

    if (error) console.error("Falha ao salvar log: ", error.message);
  }
};

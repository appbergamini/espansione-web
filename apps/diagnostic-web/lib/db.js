import { supabaseAdmin } from './supabaseAdmin';
import { BLOCKING_CHECKPOINT_STATUSES } from './checkpoints/structuredNotes';
import { projectsRepo } from './repos/projectsRepo';
import { outputsRepo } from './repos/outputsRepo';

// Este módulo é usado só pelo pipeline (server-side, via /api/engine/*).
// Usa service role para bypassar RLS — as escritas em outputs,
// logs_execucao, checkpoints etc não têm user authenticado correspondente.
const supabase = supabaseAdmin;

// =====================================================================
// db.js
// Abstração de banco de dados para substituir o StateManager.js do GAS
// =====================================================================

export const db = {
  // Projetos e Outputs vivem em lib/repos/* (item 4) — spread mantém a API do db.
  ...projectsRepo,
  ...outputsRepo,

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
      .in('status', BLOCKING_CHECKPOINT_STATUSES);

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
          error_msg: stats.error || '',
          execution_metadata: stats.execution_metadata || stats.executionMetadata || {
            provider: stats.provider || undefined,
            model: stats.model || undefined,
            input_tokens: stats.tokensIn || 0,
            output_tokens: stats.tokensOut || 0,
            total_tokens: (stats.tokensIn || 0) + (stats.tokensOut || 0),
            duration_ms: stats.durationMs || stats.duration_ms || undefined,
            error_message: stats.error || undefined,
          },
        }
      ]);

    if (error) console.error("Falha ao salvar log: ", error.message);
  },

  // ── CIS Assessments & Participantes ──────────────────────────────────────

  async addCisParticipante(projetoId, nome, email, cargo) {
    const { data, error } = await supabase
      .from('cis_participantes')
      .insert([
        {
          projeto_id: projetoId,
          nome,
          email,
          cargo
        }
      ])
      .select('*')
      .single();

    if (error) throw new Error(`Erro addCisParticipante: ${error.message}`);
    return data;
  },

  async addCisParticipantesBatch(projetoId, participantes) {
    // participantes deve ser um array de { nome, email, cargo }
    const rows = participantes.map(p => ({
      projeto_id: projetoId,
      nome: p.nome,
      email: p.email,
      cargo: p.cargo || ''
    }));

    const { data, error } = await supabase
      .from('cis_participantes')
      .insert(rows)
      .select('*');

    if (error) {
      if (error.code === '23505') throw new Error('Um ou mais e-mails já estão cadastrados neste projeto.');
      throw new Error(`Erro addCisParticipantesBatch: ${error.message}`);
    }
    return data;
  },

  async updateCisParticipante(id, { nome, email, cargo, liberado }) {
    const { data, error } = await supabase
      .from('cis_participantes')
      .update({ nome, email, cargo, liberado })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Erro updateCisParticipante: ${error.message}`);
    return data;
  },

  async deleteCisParticipante(id) {
    const { error } = await supabase
      .from('cis_participantes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro deleteCisParticipante: ${error.message}`);
    return true;
  },

  async getCisParticipantes(projetoId) {
    const { data, error } = await supabase
      .from('cis_participantes')
      .select('*')
      .eq('projeto_id', projetoId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro getCisParticipantes: ${error.message}`);
    return data || [];
  },

  async verifyCisAcesso(projetoId, email) {
    const { data, error } = await supabase
      .from('cis_participantes')
      .select('*')
      .eq('projeto_id', projetoId)
      .eq('email', email)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Erro verifyCisAcesso: ${error.message}`);
    return data || null;
  },

  async saveCIS(projetoId, email, nome, genero, perfil_label, scores, rawRankings, learnPrefs) {
    const { error: errorSis } = await supabase
      .from('cis_assessments')
      .insert([
        {
          projeto_id: projetoId,
          email,
          nome,
          genero,
          perfil_label,
          scores_json: scores || {},
          raw_rankings_json: rawRankings || {},
          learn_prefs_json: learnPrefs || {}
        }
      ]);

    if (errorSis) throw new Error(`Erro saveCIS: ${errorSis.message}`);

    // Update participante as responded
    if (projetoId && email) {
      await supabase
        .from('cis_participantes')
        .update({ respondido: true })
        .eq('projeto_id', projetoId)
        .eq('email', email);
    }
  },

  async getCIS(email) {
    const { data, error } = await supabase
      .from('cis_assessments')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Erro getCIS: ${error.message}`);
    return data || null;
  },

  async getCisAssessmentsByProjeto(projetoId) {
    const { data, error } = await supabase
      .from('cis_assessments')
      .select('*')
      .eq('projeto_id', projetoId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Erro getCisAssessmentsByProjeto: ${error.message}`);
    const assessments = data || [];
    if (assessments.length === 0) return assessments;

    // Enriquece com `papel` vindo de respondentes (cis_assessments não tem
    // coluna própria). Sem isto, downstream filters como
    // `cis.filter(c => c.papel === 'colaboradores')` do Agente 2 retornam
    // vazio e o agente declara falsa ausência de CIS coletivo.
    const { data: resps } = await supabase
      .from('respondentes')
      .select('email, papel')
      .eq('projeto_id', projetoId);
    const papelPorEmail = new Map();
    for (const r of (resps || [])) {
      if (r.email && r.papel) papelPorEmail.set(r.email.toLowerCase(), r.papel);
    }
    return assessments.map(a => ({
      ...a,
      papel: a.email ? papelPorEmail.get(a.email.toLowerCase()) || null : null,
    }));
  }
};

import { supabaseAdmin as supabase } from '../supabaseAdmin';

// Repositório de projetos (extraído de db.js — item 4). Service role (bypassa RLS).
export const projectsRepo = {
  async createProject(dados) {
    const { data, error } = await supabase
      .from('projetos')
      .insert([
        {
          empresa_id: dados.empresa_id,
          cliente: dados.cliente || '',
          porte: dados.tempo_mercado || dados.porte || '',
          momento: dados.colaboradores || dados.momento || '',
          objetivo: dados.motivacao || dados.objetivo || '',
          contato: dados.contato || '',
          status: 'planejamento',
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
};

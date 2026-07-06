import { supabaseAdmin as supabase } from '../supabaseAdmin';

// Repositório de outputs dos agentes (extraído de db.js — item 4). Service role.
export const outputsRepo = {
  async saveOutput(projetoId, agentNum, output) {
    // FIX.24 — retorna o registro inserido pra que o pipeline possa
    // materializar analysis_blocks a partir do output.id. findings_json
    // é opcional (parser heurístico do conteudo serve de fallback).
    const { data, error } = await supabase
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
          gaps: output.gaps || '',
          quality_metadata: output.quality_metadata || null,
          execution_metadata: output.execution_metadata || null,
          findings_json: Array.isArray(output.findings_json) ? output.findings_json : null,
          brand_memory_export_status: output.brand_memory_export_status || 'not_applicable',
          brand_memory_export_validation_result: output.brand_memory_export_validation_result || null,
          brand_memory_export_json: output.brand_memory_export_json || null,
          brand_memory_export_validated_at: output.brand_memory_export_validated_at || null,
        }
      ])
      .select('*')
      .single();

    if (error) throw new Error(`Erro saveOutput: ${error.message}`);
    return data;
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
    let query = supabase
      .from('outputs')
      .select('*')
      .eq('projeto_id', projetoId)
      .order('created_at', { ascending: false });

    // Filtro opcional: quando null/undefined, retorna TODOS os outputs
    // do projeto (usado por Pipeline.runAgent em FIX.4 pra validar deps).
    if (Array.isArray(agentNums) && agentNums.length > 0) {
      query = query.in('agent_num', agentNums);
    }

    const { data, error } = await query;
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
};

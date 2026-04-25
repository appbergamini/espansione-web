// FIX.30 (Fase C) — POST /api/clusters/gerar-lean
// Body: { projeto_id, modelKey }
//
// Pega intake_socios + outputs 4/5/12 + diagnóstico já feito,
// chama o agente Lean Clusters via AIRouter, persiste cada cluster
// gerado em clusters_comunicacao com meta_json populado.

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { AIRouter } from '../../../lib/ai/router';
import { buildSystemPrompt, buildUserPrompt, tryParseJson } from '../../../lib/agents/leanClusters';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db
    .from('profiles')
    .select('role,empresa_id')
    .eq('id', user.id)
    .single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  const { projeto_id, modelKey } = req.body || {};
  if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });
  if (!modelKey || !AIRouter.MODELS[modelKey]) {
    return res.status(400).json({ success: false, error: 'modelKey inválido ou ausente' });
  }

  // Restringe admin à própria empresa
  if (profile.role === 'admin') {
    const { data: proj } = await db.from('projetos').select('empresa_id').eq('id', projeto_id).single();
    if (!proj || proj.empresa_id !== profile.empresa_id) {
      return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
    }
  }

  try {
    // Carrega contexto
    const [{ data: projeto }, { data: formularios }] = await Promise.all([
      db.from('projetos').select('*').eq('id', projeto_id).single(),
      db.from('formularios').select('*').eq('projeto_id', projeto_id).eq('tipo', 'intake_socios'),
    ]);

    if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

    // Outputs 4, 5, 12 (resumos / conclusões)
    const { data: outputsRows } = await db
      .from('outputs')
      .select('agent_num, resumo_executivo, conclusoes')
      .eq('projeto_id', projeto_id)
      .in('agent_num', [4, 5, 12]);
    const previousOutputs = {};
    for (const o of (outputsRows || [])) previousOutputs[o.agent_num] = o;

    const context = { projeto, formularios: formularios || [], previousOutputs };

    if (!context.formularios.some(f => f.respostas_json && Object.keys(f.respostas_json).length > 0)) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum intake de sócio encontrado neste projeto. O agente precisa de pelo menos um intake_socios respondido.',
      });
    }

    // Chama o modelo
    const result = await AIRouter.callModel(
      buildSystemPrompt(),
      [{ role: 'user', content: buildUserPrompt(context) }],
      { modelKey, maxTokens: 8192, temperature: 0.5 },
    );

    const json = tryParseJson(result?.text);
    if (!json || !Array.isArray(json.clusters)) {
      console.error('[gerar-lean] resposta sem clusters[]:', String(result?.text || '').slice(0, 600));
      return res.status(502).json({
        success: false,
        error: 'Modelo retornou resposta sem JSON válido com clusters[]. Tente outro modelo.',
      });
    }

    // Maior `ordem` atual pra começar daí
    const { data: existentes } = await db
      .from('clusters_comunicacao')
      .select('ordem')
      .eq('projeto_id', projeto_id)
      .order('ordem', { ascending: false })
      .limit(1);
    const baseOrdem = (existentes && existentes[0]?.ordem != null) ? existentes[0].ordem + 1 : 0;

    // Insere clusters principais
    const rowsParaInserir = json.clusters.slice(0, 5).map((c, i) => ({
      projeto_id,
      nome: String(c.nome || `Cluster ${i + 1}`).slice(0, 200),
      descricao: c.descricao || null,
      afinidades: c.afinidades || null,
      motivacoes: c.motivacoes || null,
      objetivo_negocio: c.objetivo_negocio || null,
      mensagem_ancora: c.mensagem_chave || null,
      ordem: baseOrdem + i,
      meta_json: {
        tipo_publico: c.tipo_publico || null,
        momento_jornada: c.momento_jornada || null,
        necessidade_principal: c.necessidade_principal || null,
        dor_barreira: c.dor_barreira || null,
        gatilho_decisao: c.gatilho_decisao || null,
        objecao_tipica: c.objecao_tipica || null,
        mensagem_chave: c.mensagem_chave || null,
        provas_necessarias: Array.isArray(c.provas_necessarias) ? c.provas_necessarias : [],
        canais_prioritarios: Array.isArray(c.canais_prioritarios) ? c.canais_prioritarios : [],
        oferta_aderente: c.oferta_aderente || null,
        risco_comunicacao: c.risco_comunicacao || null,
        proxima_acao: c.proxima_acao || null,
        nivel_confianca: c.nivel_confianca || null,
        base_analise: c.base_analise || null,
        evidencias: Array.isArray(c.evidencias) ? c.evidencias : [],
        pergunta_validacao: c.pergunta_validacao || null,
        secundario: false,
        gerado_por: 'lean_clusters_agent',
        gerado_modelo: AIRouter.MODELS[modelKey].id,
        gerado_em: new Date().toISOString(),
      },
    }));

    // Clusters secundários (até 3) — flag secundario=true
    const secundariosArr = Array.isArray(json.secundarios) ? json.secundarios.slice(0, 3) : [];
    secundariosArr.forEach((s, i) => {
      rowsParaInserir.push({
        projeto_id,
        nome: String(s.nome || `Cluster secundário ${i + 1}`).slice(0, 200),
        descricao: s.necessidade_principal || s.descricao || null,
        afinidades: null,
        motivacoes: null,
        objetivo_negocio: null,
        mensagem_ancora: null,
        ordem: baseOrdem + 5 + i,
        meta_json: {
          tipo_publico: s.tipo_publico || null,
          necessidade_principal: s.necessidade_principal || null,
          motivo_priorizacao_baixa: s.motivo_priorizacao_baixa || null,
          secundario: true,
          gerado_por: 'lean_clusters_agent',
          gerado_modelo: AIRouter.MODELS[modelKey].id,
          gerado_em: new Date().toISOString(),
        },
      });
    });

    const { data: inseridos, error } = await db
      .from('clusters_comunicacao')
      .insert(rowsParaInserir)
      .select('id');

    if (error) {
      console.error('[gerar-lean] erro insert:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      criados: inseridos?.length || 0,
      principais: rowsParaInserir.length - secundariosArr.length,
      secundarios: secundariosArr.length,
      nivel_confianca_geral: json.nivel_confianca_geral || null,
      limitacoes_dos_dados: json.limitacoes_dos_dados || null,
      proximas_validacoes_recomendadas: Array.isArray(json.proximas_validacoes_recomendadas)
        ? json.proximas_validacoes_recomendadas
        : [],
      modelo: AIRouter.MODELS[modelKey].id,
    });
  } catch (err) {
    console.error('[gerar-lean] erro inesperado:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

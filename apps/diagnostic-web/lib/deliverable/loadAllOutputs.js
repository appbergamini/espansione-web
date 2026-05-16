// lib/deliverable/loadAllOutputs.js
//
// Bloco D · TASK 4.4 — loader server-side do entregável final.
// Carrega tudo que o componente Deliverable precisa para compor as
// 7 partes editoriais: projeto + outputs de todos os agentes +
// CIS/Maturidade para visualizações + metadados da escuta.
//
// Achados da investigação que moldaram este loader:
//   - outputs NÃO tem status/aprovado — todos os outputs persistidos
//     são considerados válidos (não existe gate de aprovação hoje).
//   - stage é `agent_num integer` (1..15) — não string nomeada.
//   - Nome do sócio-fundador não é coluna direta — derivamos do
//     primeiro intake_socios respondido (mesma lógica do Agente 15).
//   - Período da escuta derivado de min/max created_at dos formulários
//     + cis_assessments.
//   - maturidade_360 agregada vive em intake_data.campo='maturidade_360'
//     (valor é JSON string).
//
// Executa em getServerSideProps da rota /adm/[id]/deliverable. Acessa
// tabelas via supabaseAdmin (bypass RLS, idêntico ao padrão da TASK 4.2).

import { supabaseAdmin } from '../supabaseAdmin';
import { resolveVizData } from '../output/resolveVizData';

const AGENT_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

/**
 * @typedef {Object} DeliverableData
 * @property {Object} projeto
 * @property {Record<number, Object>} outputsByAgent
 * @property {Array} cisAssessments
 * @property {Object|null} maturidade360
 * @property {Object} metadadosEscuta
 * @property {Record<number, Object>} vizDataPorAgent
 * @property {boolean} temEvp
 * @property {boolean} temEncerramento
 * @property {string|null} socioFundadorNome
 */

/**
 * @param {string} projetoId
 * @returns {Promise<DeliverableData>}
 */
export async function loadAllDeliverableData(projetoId) {
  // 1. Projeto
  const { data: projeto } = await supabaseAdmin
    .from('projetos')
    .select('id, cliente, responsavel_nome, responsavel_email, segmento, porte, momento, objetivo, created_at')
    .eq('id', projetoId)
    .maybeSingle();
  if (!projeto) throw new Error('Projeto não encontrado');

  // 2. Outputs — mais recente por agent_num
  const outputsByAgent = await fetchOutputsMaisRecentes(projetoId);

  // 3. Intake_socios — derivar nome do sócio-fundador
  const socioFundadorNome = await fetchSocioFundador(projetoId);

  // 4. CIS — para a Parte 1.1 (radares DISC, barras Jung, heatmap,
  //    badge estilo de liderança) via OutputRenderer/vizData.
  const { data: cisAssessments } = await supabaseAdmin
    .from('cis_assessments')
    .select('id, nome, email, genero, perfil_label, scores_json, created_at')
    .eq('projeto_id', projetoId);

  // 5. Maturidade 360° agregada
  const maturidade360 = await fetchMaturidade360(projetoId);

  // 6. Metadados da escuta (período + contagens por fonte)
  const metadadosEscuta = await calcularMetadadosEscuta(projetoId, cisAssessments || []);

  // 7. Resolver viz data por output — cada output que tem markers
  //    precisa do vizData correspondente pra OutputRenderer montar
  //    as visualizações.
  const vizDataPorAgent = {};
  for (const [agentNum, output] of Object.entries(outputsByAgent)) {
    if (!output?.conteudo) continue;
    const vd = await resolveVizData(projetoId, output.conteudo);
    if (vd && Object.keys(vd).length > 0) {
      vizDataPorAgent[agentNum] = vd;
    }
  }

  return {
    projeto,
    outputsByAgent,
    cisAssessments: cisAssessments || [],
    maturidade360,
    metadadosEscuta,
    vizDataPorAgent,
    temEvp: Boolean(outputsByAgent[14]),
    temEncerramento: Boolean(outputsByAgent[15]),
    socioFundadorNome,
  };
}

// ─── Fetchers auxiliares ───────────────────────────────────────────

async function fetchOutputsMaisRecentes(projetoId) {
  const { data } = await supabaseAdmin
    .from('outputs')
    .select('id, agent_num, conteudo, resumo_executivo, conclusoes, confianca, fontes, gaps, created_at')
    .eq('projeto_id', projetoId)
    .order('created_at', { ascending: false });

  const byAgent = {};
  for (const row of (data || [])) {
    if (!byAgent[row.agent_num]) byAgent[row.agent_num] = row;
  }
  // Garante chave presente (null) pros agentes que não rodaram ainda,
  // simplificando os checks defensivos dos componentes Parte.
  const shape = {};
  for (const num of AGENT_NUMS) {
    shape[num] = byAgent[num] || null;
  }
  return shape;
}

async function fetchSocioFundador(projetoId) {
  const { data } = await supabaseAdmin
    .from('formularios')
    .select('respostas_json, created_at')
    .eq('projeto_id', projetoId)
    .eq('tipo', 'intake_socios')
    .order('created_at', { ascending: true })
    .limit(1);

  if (!data || data.length === 0) return null;
  const r = data[0].respostas_json || {};
  const nome =
    r._respondente_nome ||
    r.nome ||
    r.nome_completo ||
    r.a1_nome ||
    null;
  return typeof nome === 'string' && nome.trim() ? nome.trim() : null;
}

async function fetchMaturidade360(projetoId) {
  const { data } = await supabaseAdmin
    .from('intake_data')
    .select('valor')
    .eq('projeto_id', projetoId)
    .eq('campo', 'maturidade_360')
    .maybeSingle();

  if (!data?.valor) return null;
  try {
    return typeof data.valor === 'string' ? JSON.parse(data.valor) : data.valor;
  } catch {
    return null;
  }
}

/**
 * Calcula contagens de escuta e período aproximado. Usado em
 * "Como lemos sua empresa" da Parte 0.
 */
async function calcularMetadadosEscuta(projetoId, cisAssessments) {
  // Contagens por tipo de formulário + timestamps
  const { data: forms } = await supabaseAdmin
    .from('formularios')
    .select('tipo, created_at, respondente')
    .eq('projeto_id', projetoId);

  const countPorTipo = {};
  let minTs = null;
  let maxTs = null;

  const absorbTs = (iso) => {
    if (!iso) return;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return;
    if (minTs === null || t < minTs) minTs = t;
    if (maxTs === null || t > maxTs) maxTs = t;
  };

  for (const f of (forms || [])) {
    countPorTipo[f.tipo] = (countPorTipo[f.tipo] || 0) + 1;
    absorbTs(f.created_at);
  }
  for (const c of (cisAssessments || [])) {
    absorbTs(c.created_at);
  }

  const total_socios =
    (countPorTipo.intake_socios || 0);
  const total_colaboradores =
    (countPorTipo.intake_colaboradores || 0);
  const total_clientes =
    (countPorTipo.intake_clientes || 0);
  const total_entrevistas =
    (countPorTipo.entrevista_socios || 0) +
    (countPorTipo.entrevista_colaboradores || 0) +
    (countPorTipo.entrevista_cliente || 0);

  // Cobertura do CIS: respostas úteis / total_colaboradores (quando
  // denominador > 0). Não é rigoroso, mas dá ordem de grandeza para
  // o aviso de "amostra parcial" em ComoLemosSuaEmpresa.
  let cis_cobertura_pct = null;
  if (total_colaboradores > 0) {
    cis_cobertura_pct = Math.round(
      (Math.min(cisAssessments.length, total_colaboradores) /
        total_colaboradores) *
        100,
    );
  } else if (cisAssessments.length > 0) {
    cis_cobertura_pct = 100;
  }

  return {
    periodo_inicio: minTs ? new Date(minTs).toISOString().slice(0, 10) : null,
    periodo_fim:    maxTs ? new Date(maxTs).toISOString().slice(0, 10) : null,
    total_socios,
    total_colaboradores,
    total_clientes,
    total_entrevistas,
    total_cis_assessments: cisAssessments.length,
    cis_cobertura_pct,
  };
}

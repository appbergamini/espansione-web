// POST /api/identidade-final/finalize — PÚBLICO, por token (+ rid multi-respondente)
// Valida obrigatórias, conclui o respondente e recomputa o result_json do
// assessment (maturidade por público, triangulação, eNPS/NPS, satisfação, drivers).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { montarFormulario, obrigatoriasFaltando } from '../../../lib/identidade-final/forms';
import { montarResultado } from '../../../lib/identidade-final/scoring';

const TOKEN_RE = /^[a-f0-9]{32,64}$/;

function fromRow(r) {
  if (r.value_json !== null && r.value_json !== undefined) return r.value_json;
  if (r.value_num !== null && r.value_num !== undefined) return r.value_num;
  return r.value_text;
}

async function resolver(db, token) {
  const { data } = await db
    .from('id_v2_assessments')
    .select('id, produto, status, projeto_id, socios_token, colaboradores_token, clientes_token, result_json')
    .or(`socios_token.eq.${token},colaboradores_token.eq.${token},clientes_token.eq.${token}`)
    .maybeSingle();
  if (!data) return null;
  const publico = data.socios_token === token ? 'socios'
    : data.colaboradores_token === token ? 'colaboradores'
    : data.clientes_token === token ? 'clientes' : null;
  return publico ? { assessment: data, publico } : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;

  const token = (req.body?.token || '').toString().trim();
  const rid = (req.body?.rid || '').toString().trim();
  if (!TOKEN_RE.test(token)) return res.status(400).json({ success: false, error: 'token inválido' });

  const r = await resolver(db, token);
  if (!r) return res.status(404).json({ success: false, error: 'Link inválido' });
  const { assessment, publico } = r;

  let respondenteId = rid || null;
  if (publico === 'socios') {
    const { data } = await db.from('id_v2_respondents').select('id, status').eq('assessment_id', assessment.id).eq('publico', 'socios').limit(1).maybeSingle();
    if (!data) return res.status(422).json({ success: false, error: 'Nenhuma resposta encontrada' });
    respondenteId = data.id;
  }
  if (!respondenteId) return res.status(400).json({ success: false, error: 'rid obrigatório' });

  try {
    const { data: ansAtual } = await db.from('id_v2_answers').select('question_id, value_num, value_text, value_json').eq('respondent_id', respondenteId);
    const mapAtual = {};
    for (const a of ansAtual || []) mapAtual[a.question_id] = fromRow(a);
    const perguntas = montarFormulario(publico, { lider: false });
    const faltando = obrigatoriasFaltando(perguntas, mapAtual);
    if (faltando.length) return res.status(422).json({ success: false, error: 'Respostas obrigatórias incompletas', faltando });

    await db.from('id_v2_respondents').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', respondenteId);

    const { data: completos } = await db.from('id_v2_respondents').select('id, publico').eq('assessment_id', assessment.id).eq('status', 'completed');
    const ids = (completos || []).map((c) => c.id);
    const respostasPorPublico = {};
    if (ids.length) {
      const { data: todas } = await db.from('id_v2_answers').select('respondent_id, question_id, value_num, value_text, value_json').in('respondent_id', ids);
      const porResp = {};
      for (const a of todas || []) (porResp[a.respondent_id] = porResp[a.respondent_id] || {})[a.question_id] = fromRow(a);
      for (const c of completos) {
        (respostasPorPublico[c.publico] = respostasPorPublico[c.publico] || []).push(porResp[c.id] || {});
      }
    }

    const result = montarResultado({ respostasPorPublico, geradoEm: new Date().toISOString() });

    const publicosFeitos = new Set(Object.keys(respostasPorPublico));
    const completed = ['socios', 'colaboradores', 'clientes'].every((p) => publicosFeitos.has(p));
    const patch = { result_json: result, status: completed ? 'completed' : 'in_progress' };
    if (completed) patch.completed_at = new Date().toISOString();
    await db.from('id_v2_assessments').update(patch).eq('id', assessment.id);

    return res.status(200).json({
      success: true,
      assessment_status: patch.status,
      resumo: { geral: result.porPublico[publico]?.geral ?? null, publico },
    });
  } catch (e) {
    console.error('[identidade-final/finalize]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao concluir' });
  }
}

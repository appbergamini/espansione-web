// POST /api/identidade/finalize — PÚBLICO, por token (Forms 1 e 2)
// Body: { token, form }
// Valida obrigatórios, marca a submissão como concluída, computa o Território
// (Form 2) e atualiza o status + agregados (result_json) do assessment.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { FORM_BY_SLUG, FORM_TYPES, FORM_ESSENCIA, FORM_TERRITORIO, validarBlocoEssencia } from '../../../lib/mapa-identidade/forms';
import { buildTerritoryResult } from '../../../lib/mapa-identidade/territory';

function validarCompletude(formType, answers) {
  if (formType === FORM_TYPES.ESSENCIA) {
    return FORM_ESSENCIA.blocos.flatMap((b) => validarBlocoEssencia(b, answers));
  }
  if (formType === FORM_TYPES.TERRITORIO) {
    return FORM_TERRITORIO.afirmacoes.filter((a) => typeof answers[a.code] !== 'number').map((a) => a.code);
  }
  return [];
}

async function snapshotMaturidade(db, projetoId) {
  const { data } = await db
    .from('mapa_assessments')
    .select('id, status, result_json, completed_at, created_at')
    .eq('projeto_id', projetoId)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  const mat = (data || []).find((a) => a.status === 'concluido');
  if (!mat || !mat.result_json) return null;
  const r = mat.result_json;
  return {
    maturity_assessment_id: mat.id,
    general_score: r.general_score,
    general_level: r.general_level,
    critical_pillars: r.critical_pillars || [],
    strong_pillars: r.strong_pillars || [],
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;

  const token = (req.body?.token || '').toString().trim();
  const formSlug = (req.body?.form || '').toString().trim();
  const formDef = FORM_BY_SLUG[formSlug];
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });
  if (!formDef) return res.status(400).json({ success: false, error: 'formulário inválido' });

  const { data: assessment } = await db
    .from('identity_assessments')
    .select('id, projeto_id, status, result_json')
    .eq('token', token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });

  const { data: sub } = await db
    .from('identity_submissions')
    .select('id, answers, status')
    .eq('identity_assessment_id', assessment.id)
    .eq('form_type', formDef.type)
    .eq('is_anonymous', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sub) return res.status(422).json({ success: false, error: 'Nenhuma resposta encontrada' });

  const answers = sub.answers || {};
  const faltando = validarCompletude(formDef.type, answers);
  if (faltando.length) {
    return res.status(422).json({ success: false, error: 'Respostas obrigatórias incompletas', faltando });
  }

  try {
    // computa Território (Form 2)
    let computed = null;
    if (formDef.type === FORM_TYPES.TERRITORIO) {
      computed = buildTerritoryResult(answers);
    }
    await db
      .from('identity_submissions')
      .update({ status: 'completed', completed_at: new Date().toISOString(), computed })
      .eq('id', sub.id);

    // recarrega status das submissões obrigatórias
    const { data: subs } = await db
      .from('identity_submissions')
      .select('form_type, status, computed')
      .eq('identity_assessment_id', assessment.id)
      .eq('is_anonymous', false);
    const completos = new Set((subs || []).filter((s) => s.status === 'completed').map((s) => s.form_type));

    const essenciaOk = completos.has(FORM_TYPES.ESSENCIA);
    const territorioOk = completos.has(FORM_TYPES.TERRITORIO);

    // monta result_json (agregados + snapshot de maturidade)
    const territorioSub = (subs || []).find((s) => s.form_type === FORM_TYPES.TERRITORIO && s.status === 'completed');
    const result = {
      ...(assessment.result_json || {}),
      completed_forms: [...completos],
      value_territory: territorioSub?.computed || assessment.result_json?.value_territory || null,
      maturity_context: (await snapshotMaturidade(db, assessment.projeto_id)) || assessment.result_json?.maturity_context || null,
    };

    // status do assessment: os 2 obrigatórios concluídos → completed (relatório básico pronto)
    const novoStatus = essenciaOk && territorioOk ? 'completed' : 'in_progress';
    const patch = { status: novoStatus, result_json: result };
    if (novoStatus === 'completed') patch.completed_at = new Date().toISOString();
    await db.from('identity_assessments').update(patch).eq('id', assessment.id);

    return res.status(200).json({ success: true, assessment_status: novoStatus, computed, value_territory: result.value_territory });
  } catch (e) {
    console.error('[identidade/finalize]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao concluir' });
  }
}

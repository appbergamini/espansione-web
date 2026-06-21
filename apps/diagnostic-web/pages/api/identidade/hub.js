// POST /api/identidade/hub — admin (master/admin)
// Body: { projeto_id }
// Cria (ou recupera) a avaliação do Mapa de Identidade de um projeto, vincula
// automaticamente o Mapa de Maturidade existente, e devolve o status das 4
// etapas + o contexto de maturidade para a página principal do módulo.

import crypto from 'crypto';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { FORMS_IDENTIDADE, FORM_TYPES } from '../../../lib/mapa-identidade/forms';

function gerarToken() {
  return crypto.randomBytes(24).toString('hex');
}

// resolve o Mapa de Maturidade do projeto (prioriza concluído mais recente)
async function resolverMaturidade(db, projetoId) {
  const { data } = await db
    .from('mapa_assessments')
    .select('id, status, general_score, general_level, result_json')
    .eq('projeto_id', projetoId)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (!data || !data.length) return null;
  return data.find((a) => a.status === 'concluido') || data[0];
}

function contextoMaturidade(mat) {
  if (!mat || mat.status !== 'concluido' || !mat.result_json) return null;
  const r = mat.result_json;
  return {
    maturity_assessment_id: mat.id,
    general_score: r.general_score,
    general_level: r.general_level,
    critical_pillars: r.critical_pillars || [],
    strong_pillars: r.strong_pillars || [],
    pillars: (r.pillars || []).map((p) => ({ code: p.code, name: p.name, level: p.level, percentage_score: p.percentage_score })),
    recommendations: (r.recommendations || []).map((x) => ({ pillar: x.pillar, trail: x.trail, priority: x.priority })),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db.from('profiles').select('role,empresa_id').eq('id', user.id).single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  const { projeto_id } = req.body || {};
  if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });

  const { data: proj } = await db.from('projetos').select('id, empresa_id, cliente').eq('id', projeto_id).single();
  if (!proj) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
  if (profile.role === 'admin' && proj.empresa_id !== profile.empresa_id) {
    return res.status(403).json({ success: false, error: 'Projeto de outra empresa' });
  }

  try {
    const mat = await resolverMaturidade(db, projeto_id);
    const matContext = contextoMaturidade(mat);

    // get-or-create assessment
    const COLS = 'id, token, internal_token, external_token, status, maturity_assessment_id, result_json';
    let { data: assessment } = await db
      .from('identity_assessments')
      .select(COLS)
      .eq('projeto_id', projeto_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      const { data: nova, error } = await db
        .from('identity_assessments')
        .insert([{ projeto_id, token: gerarToken(), internal_token: gerarToken(), external_token: gerarToken(), status: 'not_started', maturity_assessment_id: mat?.id || null }])
        .select(COLS)
        .single();
      if (error) throw error;
      assessment = nova;
    } else {
      const patch = {};
      if (mat?.id && assessment.maturity_assessment_id !== mat.id) patch.maturity_assessment_id = mat.id;
      if (!assessment.internal_token) patch.internal_token = gerarToken();
      if (!assessment.external_token) patch.external_token = gerarToken();
      if (Object.keys(patch).length) {
        await db.from('identity_assessments').update(patch).eq('id', assessment.id);
        Object.assign(assessment, patch);
      }
    }

    // status por formulário
    const { data: subs } = await db
      .from('identity_submissions')
      .select('form_type, status')
      .eq('identity_assessment_id', assessment.id);
    const statusByType = {};
    for (const s of subs || []) {
      // para forms 1/2 há uma submissão; concluída vence
      if (s.status === 'completed' || !statusByType[s.form_type]) statusByType[s.form_type] = s.status;
    }

    const result = assessment.result_json || {};
    const tokenDoForm = (type) =>
      type === FORM_TYPES.ESPELHO_INTERNO ? assessment.internal_token
      : type === FORM_TYPES.ESPELHO_EXTERNO ? assessment.external_token
      : assessment.token;

    const forms = FORMS_IDENTIDADE.map((f) => {
      const link = `/form/identidade/${f.slug}?token=${tokenDoForm(f.type)}`;
      if (!f.shared) {
        return { ...f, link, status: statusByType[f.type] || 'not_started' };
      }
      const ag = f.type === FORM_TYPES.ESPELHO_INTERNO ? result.internal_mirror : result.external_mirror;
      return {
        ...f,
        link,
        status: ag?.respondents_count ? 'in_progress' : 'not_started',
        responses_count: ag?.respondents_count || 0,
        indicator_label: f.type === FORM_TYPES.ESPELHO_INTERNO ? 'eNPS' : 'NPS',
        indicator: f.type === FORM_TYPES.ESPELHO_INTERNO ? ag?.enps : ag?.nps,
      };
    });

    return res.status(200).json({
      success: true,
      assessment,
      cliente: proj.cliente || '',
      maturity_context: matContext,
      forms,
    });
  } catch (e) {
    console.error('[identidade/hub]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro' });
  }
}

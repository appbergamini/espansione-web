// POST /api/identidade/submit — PÚBLICO (Espelhos Interno/Externo)
// Body: { token, form, answers }
// Cada respondente cria UMA submissão. Internal é anônimo. Recalcula o agregado
// (eNPS/NPS, médias, palavras) e grava em result_json do assessment.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { FORM_BY_SLUG, FORM_TYPES, validateSurvey } from '../../../lib/mapa-identidade/forms';
import { aggregateInternalMirror, aggregateExternalMirror } from '../../../lib/mapa-identidade/aggregates';

const TOKEN_COL = {
  'espelho-interno': 'internal_token',
  'espelho-externo': 'external_token',
};

export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;

  const token = (req.method === 'GET' ? req.query.token : req.body?.token || '').toString().trim();
  const formSlug = (req.method === 'GET' ? req.query.form : req.body?.form || '').toString().trim();
  const formDef = FORM_BY_SLUG[formSlug];
  const tokenCol = TOKEN_COL[formSlug];
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });
  if (!formDef || !tokenCol) return res.status(400).json({ success: false, error: 'formulário inválido' });

  // resolve assessment pelo token próprio do espelho
  const { data: assessment } = await db
    .from('identity_assessments')
    .select('id, projeto_id, result_json')
    .eq(tokenCol, token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });

  // GET → valida o link e devolve o nome da marca (para a tela do respondente)
  if (req.method === 'GET') {
    const { data: proj } = await db.from('projetos').select('cliente').eq('id', assessment.projeto_id).maybeSingle();
    return res.status(200).json({ success: true, cliente: proj?.cliente || '' });
  }
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { answers } = req.body || {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ success: false, error: 'answers obrigatório' });
  }
  const faltando = validateSurvey(formDef, answers);
  if (faltando.length) {
    return res.status(422).json({ success: false, error: 'Respostas obrigatórias incompletas', faltando });
  }

  const isInternal = formDef.type === FORM_TYPES.ESPELHO_INTERNO;

  try {
    const { error: insErr } = await db.from('identity_submissions').insert([{
      identity_assessment_id: assessment.id,
      form_type: formDef.type,
      respondent_type: isInternal ? 'colaborador' : 'cliente',
      is_anonymous: isInternal,
      status: 'completed',
      answers,
      completed_at: new Date().toISOString(),
    }]);
    if (insErr) throw insErr;

    // recalcula agregado a partir de todas as submissões concluídas deste form
    const { data: subs } = await db
      .from('identity_submissions')
      .select('answers')
      .eq('identity_assessment_id', assessment.id)
      .eq('form_type', formDef.type)
      .eq('status', 'completed');

    const agregado = isInternal ? aggregateInternalMirror(subs || []) : aggregateExternalMirror(subs || []);
    const chave = isInternal ? 'internal_mirror' : 'external_mirror';
    const result = { ...(assessment.result_json || {}), [chave]: agregado };
    await db.from('identity_assessments').update({ result_json: result }).eq('id', assessment.id);

    return res.status(200).json({ success: true, respondents_count: agregado.respondents_count });
  } catch (e) {
    console.error('[identidade/submit]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao enviar' });
  }
}

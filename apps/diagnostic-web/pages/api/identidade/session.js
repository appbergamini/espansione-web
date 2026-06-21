// /api/identidade/session — PÚBLICO, por token do assessment (Forms 1 e 2)
// GET  ?token=&form=essencia|territorio → submissão atual (respostas + status)
// POST { token, form, answers, status? }  → upsert da submissão (salva progressivo)
//
// Forms 1/2 são do fundador: uma submissão por form_type (não anônima). O
// resultado de território é (re)computado no finalize, nunca aqui.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { FORM_BY_SLUG } from '../../../lib/mapa-identidade/forms';

async function resolver(db, token) {
  const { data } = await db
    .from('identity_assessments')
    .select('id, projeto_id, status')
    .eq('token', token)
    .maybeSingle();
  return data || null;
}

// pega (ou cria) a submissão não-anônima daquele form_type
async function getOrCreateSubmission(db, assessmentId, formType) {
  const { data: existente } = await db
    .from('identity_submissions')
    .select('id, answers, status')
    .eq('identity_assessment_id', assessmentId)
    .eq('form_type', formType)
    .eq('is_anonymous', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existente) return existente;
  const { data: nova, error } = await db
    .from('identity_submissions')
    .insert([{ identity_assessment_id: assessmentId, form_type: formType, is_anonymous: false, respondent_type: 'direcao', status: 'in_progress', answers: {} }])
    .select('id, answers, status')
    .single();
  if (error) throw error;
  return nova;
}

export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;
  const token = (req.method === 'GET' ? req.query.token : req.body?.token || '').toString().trim();
  const formSlug = (req.method === 'GET' ? req.query.form : req.body?.form || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const formDef = FORM_BY_SLUG[formSlug];
  if (!formDef) return res.status(400).json({ success: false, error: 'formulário inválido' });

  const assessment = await resolver(db, token);
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });

  if (req.method === 'GET') {
    const { data: sub } = await db
      .from('identity_submissions')
      .select('answers, status')
      .eq('identity_assessment_id', assessment.id)
      .eq('form_type', formDef.type)
      .eq('is_anonymous', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: proj } = await db.from('projetos').select('cliente').eq('id', assessment.projeto_id).maybeSingle();
    return res.status(200).json({
      success: true,
      cliente: proj?.cliente || '',
      answers: sub?.answers || {},
      submission_status: sub?.status || 'not_started',
    });
  }

  if (req.method === 'POST') {
    const { answers } = req.body || {};
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, error: 'answers obrigatório' });
    }
    try {
      const sub = await getOrCreateSubmission(db, assessment.id, formDef.type);
      if (sub.status === 'completed') {
        return res.status(409).json({ success: false, error: 'Formulário já concluído' });
      }
      const merged = { ...(sub.answers || {}), ...answers };
      await db.from('identity_submissions').update({ answers: merged }).eq('id', sub.id);

      // primeira escrita move o assessment para em andamento
      if (assessment.status === 'not_started') {
        await db.from('identity_assessments').update({ status: 'in_progress' }).eq('id', assessment.id);
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('[identidade/session]', e);
      return res.status(500).json({ success: false, error: 'Erro ao salvar' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

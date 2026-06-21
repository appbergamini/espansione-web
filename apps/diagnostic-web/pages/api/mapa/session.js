// /api/mapa/session — PÚBLICO, por token
// GET  ?token=         → estado da avaliação (status, respostas, resultado, projeto)
// POST { token, answers:{code:value}, status? }
//                      → salva (upsert) um lote de respostas progressivamente.
//
// As respostas de aprofundamento (códigos *_AP_*) são salvas com
// is_deepening=true e NÃO entram no score (seção 5 do spec) — só enriquecem
// a interpretação futura. O score é sempre recomputado em /api/mapa/finalize
// a partir das obrigatórias persistidas (nunca confiamos no cliente).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { PERGUNTA_PILAR, labelDaResposta } from '../../../lib/mapa-maturidade/pilares';
import { validarContexto, buildContextSnapshot } from '../../../lib/mapa-maturidade/contexto';

function isDeepeningCode(code) {
  return /_AP_/.test(code);
}

async function resolveAssessment(db, token) {
  const { data } = await db
    .from('mapa_assessments')
    .select('id, projeto_id, status, result_json, context_json, started_at')
    .eq('token', token)
    .maybeSingle();
  return data || null;
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  }
  const db = supabaseAdmin;
  const token = (req.method === 'GET' ? req.query.token : req.body?.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const assessment = await resolveAssessment(db, token);
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });

  // ── GET: estado atual ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data: proj } = await db
      .from('projetos')
      .select('cliente')
      .eq('id', assessment.projeto_id)
      .maybeSingle();

    const { data: rows } = await db
      .from('mapa_answers')
      .select('question_code, value, is_deepening')
      .eq('assessment_id', assessment.id);

    const answers = {};
    const deepeningAnswers = {};
    for (const r of rows || []) {
      (r.is_deepening ? deepeningAnswers : answers)[r.question_code] = r.value;
    }

    return res.status(200).json({
      success: true,
      status: assessment.status,
      cliente: proj?.cliente || '',
      answers,
      deepening_answers: deepeningAnswers,
      result: assessment.result_json || null,
      context: assessment.context_json || null,
    });
  }

  // ── POST: salvar respostas ────────────────────────────────────────
  if (req.method === 'POST') {
    if (assessment.status === 'concluido') {
      return res.status(409).json({ success: false, error: 'Avaliação já concluída' });
    }
    const { answers, status, context } = req.body || {};

    // Contexto da Empresa (perfil, fora do score) — snapshot por medição
    if (context && typeof context === 'object') {
      const faltando = validarContexto(context);
      if (faltando.length) {
        return res.status(422).json({ success: false, error: 'Contexto da Empresa incompleto', faltando });
      }
      const { error } = await db
        .from('mapa_assessments')
        .update({ context_json: buildContextSnapshot(context) })
        .eq('id', assessment.id);
      if (error) {
        console.error('[mapa/session] context', error);
        return res.status(500).json({ success: false, error: 'Erro ao salvar contexto' });
      }
    }

    if (answers && typeof answers === 'object') {
      const rows = [];
      for (const [code, raw] of Object.entries(answers)) {
        const value = Number(raw);
        const pillar = PERGUNTA_PILAR[code];
        if (!pillar) {
          return res.status(400).json({ success: false, error: `Pergunta desconhecida: ${code}` });
        }
        if (![-1, 0, 1, 2, 3].includes(value)) {
          return res.status(400).json({ success: false, error: `Valor inválido para ${code}` });
        }
        rows.push({
          assessment_id: assessment.id,
          question_code: code,
          pillar_code: pillar,
          value,
          label: labelDaResposta(value),
          is_deepening: isDeepeningCode(code),
        });
      }
      if (rows.length) {
        const { error } = await db
          .from('mapa_answers')
          .upsert(rows, { onConflict: 'assessment_id,question_code' });
        if (error) {
          console.error('[mapa/session] upsert', error);
          return res.status(500).json({ success: false, error: 'Erro ao salvar respostas' });
        }
      }
    }

    // primeira escrita marca início; status avança para em_andamento
    const patch = {};
    if (!assessment.started_at) patch.started_at = new Date().toISOString();
    const novoStatus = status === 'em_andamento' ? 'em_andamento' : null;
    if (assessment.status === 'pendente') patch.status = novoStatus || 'em_andamento';
    if (Object.keys(patch).length) {
      await db.from('mapa_assessments').update(patch).eq('id', assessment.id);
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// POST /api/mapa/finalize — PÚBLICO, por token
// Body: { token }
// Recomputa o resultado AUTORITATIVO a partir das respostas obrigatórias
// persistidas (nunca confia no cliente), valida completude, salva o
// resultado consolidado e marca a avaliação como concluída.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { PERGUNTAS_TODAS } from '../../../lib/mapa-maturidade/pilares';
import { buildResult } from '../../../lib/mapa-maturidade/scoring';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  }
  const db = supabaseAdmin;
  const token = (req.body?.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const { data: assessment } = await db
    .from('mapa_assessments')
    .select('id, projeto_id, status, context_json')
    .eq('token', token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });

  // carrega TODAS as respostas (obrigatórias + aprofundamento)
  const { data: rows, error } = await db
    .from('mapa_answers')
    .select('question_code, value')
    .eq('assessment_id', assessment.id);
  if (error) {
    console.error('[mapa/finalize] load', error);
    return res.status(500).json({ success: false, error: 'Erro ao carregar respostas' });
  }

  const answers = {};
  for (const r of rows || []) answers[r.question_code] = r.value;

  // valida completude (todas obrigatórias; "Não se aplica" = -1 também conta)
  const faltando = PERGUNTAS_TODAS.filter((q) => typeof answers[q.code] !== 'number').map(
    (q) => q.code
  );
  if (faltando.length) {
    return res
      .status(422)
      .json({ success: false, error: 'Respostas obrigatórias incompletas', faltando });
  }

  const result = buildResult(answers, {
    assessment_id: assessment.id,
    projeto_id: assessment.projeto_id,
  });
  // referência ao snapshot de Contexto da Empresa daquela medição (fora do score)
  result.context = assessment.context_json || null;

  // bloqueia conclusão se algum pilar tiver dados insuficientes (2+ "Não se aplica")
  if (result.has_insufficient_data) {
    return res.status(422).json({
      success: false,
      error: 'Pilares com dados insuficientes — revise as respostas "Não se aplica".',
      pillars_to_review: result.pillars_to_review,
    });
  }

  const { error: upErr } = await db
    .from('mapa_assessments')
    .update({
      status: 'concluido',
      completed_at: new Date().toISOString(),
      general_score: result.general_score,
      general_level: result.general_level,
      result_json: result,
    })
    .eq('id', assessment.id);
  if (upErr) {
    console.error('[mapa/finalize] save', upErr);
    return res.status(500).json({ success: false, error: 'Erro ao salvar resultado' });
  }

  return res.status(200).json({ success: true, result });
}

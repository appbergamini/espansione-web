// POST /api/mapa/finalize — PÚBLICO, por token
// Body: { token }
// Recomputa o resultado AUTORITATIVO a partir das respostas persistidas
// (nunca confia no cliente), valida completude e marca como concluído.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { obrigatoriasFaltando } from '../../../lib/mapa-maturidade/catalog';
import { buildResultado } from '../../../lib/mapa-maturidade/score';

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
    .select('id, projeto_id, status, cadastro_json, extras_json')
    .eq('token', token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });

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
  // atributos de marca (MM2-MAR-10b, não pontua) vêm de extras_json
  const atributos = assessment.extras_json?.atributos_marca;
  if (Array.isArray(atributos)) answers['MM2-MAR-10b'] = atributos;

  const faltando = obrigatoriasFaltando(answers);
  if (faltando.length) {
    return res.status(422).json({ success: false, error: 'Respostas obrigatórias incompletas', faltando });
  }

  const result = buildResultado(answers, {
    assessment_id: assessment.id,
    projeto_id: assessment.projeto_id,
  });
  result.cadastro = assessment.cadastro_json || null;

  const { error: upErr } = await db
    .from('mapa_assessments')
    .update({
      status: 'concluido',
      completed_at: new Date().toISOString(),
      general_score: result.general_score == null ? null : Math.round(result.general_score),
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

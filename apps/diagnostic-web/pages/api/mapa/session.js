// /api/mapa/session — PÚBLICO, por token
// GET  ?token=  → estado (status, cadastro, respostas, extras, resultado)
// POST { token, answers:{code:value}, cadastro?, extras?, status? }
//       → salva (upsert) respostas + cadastro/lead + extras progressivamente.
// O score é sempre recomputado em /api/mapa/finalize a partir das respostas
// persistidas (nunca confiamos no cliente).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { perguntaById, labelFrequencia } from '../../../lib/mapa-maturidade/catalog';

const VALORES_VALIDOS = [-1, 0, 1, 2, 3];

async function resolveAssessment(db, token) {
  const { data } = await db
    .from('mapa_assessments')
    .select('id, projeto_id, status, result_json, cadastro_json, extras_json, started_at')
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
    let cliente = assessment.cadastro_json?.empresa || '';
    if (assessment.projeto_id) {
      const { data: proj } = await db
        .from('projetos')
        .select('cliente')
        .eq('id', assessment.projeto_id)
        .maybeSingle();
      cliente = proj?.cliente || cliente;
    }

    const { data: rows } = await db
      .from('mapa_answers')
      .select('question_code, value')
      .eq('assessment_id', assessment.id);
    const answers = {};
    for (const r of rows || []) answers[r.question_code] = r.value;

    return res.status(200).json({
      success: true,
      status: assessment.status,
      cliente,
      cadastro: assessment.cadastro_json || null,
      answers,
      extras: assessment.extras_json || null,
      result: assessment.result_json || null,
    });
  }

  // ── POST: salvar respostas / cadastro / extras ────────────────────
  if (req.method === 'POST') {
    if (assessment.status === 'concluido') {
      return res.status(409).json({ success: false, error: 'Avaliação já concluída' });
    }
    const { answers, cadastro, extras } = req.body || {};

    // cadastro/lead (jsonb) e extras não-pontuados (atributos de marca)
    const patch = {};
    if (cadastro && typeof cadastro === 'object') {
      patch.cadastro_json = { ...(assessment.cadastro_json || {}), ...cadastro };
    }
    if (extras && typeof extras === 'object') {
      patch.extras_json = { ...(assessment.extras_json || {}), ...extras };
    }

    if (answers && typeof answers === 'object') {
      const linhas = [];
      for (const [code, raw] of Object.entries(answers)) {
        const pergunta = perguntaById(code);
        if (!pergunta || !pergunta.pontua) {
          return res.status(400).json({ success: false, error: `Pergunta desconhecida: ${code}` });
        }
        const value = Number(raw);
        if (!VALORES_VALIDOS.includes(value)) {
          return res.status(400).json({ success: false, error: `Valor inválido para ${code}` });
        }
        linhas.push({
          assessment_id: assessment.id,
          question_code: code,
          pillar_code: pergunta.sistema,
          value,
          label: labelFrequencia(value),
          is_deepening: false,
        });
      }
      if (linhas.length) {
        const { error } = await db
          .from('mapa_answers')
          .upsert(linhas, { onConflict: 'assessment_id,question_code' });
        if (error) {
          console.error('[mapa/session] upsert', error);
          return res.status(500).json({ success: false, error: 'Erro ao salvar respostas' });
        }
      }
    }

    // primeira escrita marca início; avança status para em_andamento
    if (!assessment.started_at) patch.started_at = new Date().toISOString();
    if (assessment.status === 'pendente') patch.status = 'em_andamento';
    if (Object.keys(patch).length) {
      const { error } = await db.from('mapa_assessments').update(patch).eq('id', assessment.id);
      if (error) {
        console.error('[mapa/session] patch', error);
        return res.status(500).json({ success: false, error: 'Erro ao salvar' });
      }
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// POST /api/mapa/finalize — PÚBLICO, por token
// Body: { token }
// Recomputa o resultado AUTORITATIVO a partir das respostas persistidas
// (nunca confia no cliente), valida completude e marca como concluído.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { obrigatoriasFaltando } from '../../../lib/mapa-maturidade/catalog';
import { buildResultado } from '../../../lib/mapa-maturidade/score';
import { extrairEmail, sendRelatorioEssencial } from '../../../lib/emails/sendRelatorioEssencial';

// base URL do host da requisição (aprendizado do checkout: nunca confiar em
// NEXT_PUBLIC_SITE_URL — o funil roda em mais de um domínio)
function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return host ? `${proto}://${host}` : null;
}

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

  // envia o link do relatório por e-mail (best-effort, nunca falha o finalize).
  // O contato do cadastro é campo livre "e-mail ou WhatsApp" — só envia se for
  // e-mail. Guarda o resultado em extras_json p/ não reenviar em re-finalize.
  const jaEnviado = assessment.extras_json?.relatorio_email?.sent_at;
  const email = extrairEmail(assessment.cadastro_json?.['CAD-MM-006']);
  const base = baseUrl(req);
  if (email && base && !jaEnviado) {
    try {
      await sendRelatorioEssencial({
        to: email,
        nome: assessment.cadastro_json?.['CAD-MM-001'],
        empresa: assessment.cadastro_json?.['CAD-MM-002'],
        reportUrl: `${base}/api/mapa/report?token=${encodeURIComponent(token)}`,
      });
      await db
        .from('mapa_assessments')
        .update({ extras_json: { ...(assessment.extras_json || {}), relatorio_email: { to: email, sent_at: new Date().toISOString() } } })
        .eq('id', assessment.id);
    } catch (e) {
      console.error('[mapa/finalize] email do relatório falhou (segue sem enviar):', e?.message || e);
    }
  }

  return res.status(200).json({ success: true, result });
}

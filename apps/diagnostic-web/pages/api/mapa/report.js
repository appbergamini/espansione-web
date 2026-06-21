// GET /api/mapa/report?token=...  → PDF detalhado do Mapa de Maturidade
// Gerado por IA (Sonnet 4.6) e renderizado em PDF. Acesso por token (mesma
// capacidade do link do Mapa — serve cliente e admin). A narrativa da IA é
// cacheada em result_json.report para não re-chamar o modelo a cada download.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { PERGUNTA_TEXTO } from '../../../lib/mapa-maturidade/pilares';
import { gerarNarrativaRelatorio } from '../../../lib/mapa-maturidade/report';
import { gerarPdfMaturidade } from '../../../lib/mapa-maturidade/reportPdf';

export const maxDuration = 120;
export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  }
  const db = supabaseAdmin;
  const token = (req.query.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const { data: assessment } = await db
    .from('mapa_assessments')
    .select('id, projeto_id, status, result_json')
    .eq('token', token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });
  if (assessment.status !== 'concluido' || !assessment.result_json) {
    return res.status(409).json({ success: false, error: 'Diagnóstico ainda não concluído' });
  }

  const result = assessment.result_json;

  try {
    // cliente
    const { data: proj } = await db
      .from('projetos')
      .select('cliente')
      .eq('id', assessment.projeto_id)
      .maybeSingle();
    const cliente = proj?.cliente || '';

    // narrativa (cache em result_json.report)
    let narrativa = result.report;
    const forcar = req.query.regenerar === '1';
    if (!narrativa || forcar) {
      // respostas reais por pilar, com texto da afirmação
      const { data: rows } = await db
        .from('mapa_answers')
        .select('question_code, pillar_code, value, label, is_deepening')
        .eq('assessment_id', assessment.id);
      const respostasPorPilar = {};
      for (const r of rows || []) {
        (respostasPorPilar[r.pillar_code] ||= []).push({
          text: PERGUNTA_TEXTO[r.question_code] || r.question_code,
          label: r.label,
          value: r.value,
          is_deepening: r.is_deepening,
        });
      }

      narrativa = await gerarNarrativaRelatorio({ cliente, result, respostasPorPilar });

      // persiste no result_json (não re-chama IA no próximo download)
      const novoResult = { ...result, report: narrativa };
      await db.from('mapa_assessments').update({ result_json: novoResult }).eq('id', assessment.id);
    }

    const pdf = await gerarPdfMaturidade({ cliente, result, narrativa });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="mapa-de-maturidade${cliente ? '-' + slug(cliente) : ''}.pdf"`
    );
    res.setHeader('Content-Length', pdf.length);
    return res.status(200).send(pdf);
  } catch (e) {
    console.error('[mapa/report]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao gerar relatório' });
  }
}

function slug(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// GET /api/mapa/report?token=...  → PDF vendedor do Mapa da Maturidade.
// Gerado por IA (Sonnet 4.6) e renderizado em PDF. Acesso por token (serve
// cliente e admin). A narrativa é cacheada em result_json.report para não
// re-chamar o modelo a cada download (regenerar com ?regenerar=1).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { gerarRelatorioVendedor } from '../../../lib/mapa-maturidade/reportVendedor';
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
    .select('id, projeto_id, status, result_json, cadastro_json')
    .eq('token', token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });
  if (assessment.status !== 'concluido' || !assessment.result_json) {
    return res.status(409).json({ success: false, error: 'Check-up ainda não concluído' });
  }

  const result = assessment.result_json;

  try {
    let cliente = assessment.cadastro_json?.empresa || '';
    if (assessment.projeto_id) {
      const { data: proj } = await db
        .from('projetos')
        .select('cliente')
        .eq('id', assessment.projeto_id)
        .maybeSingle();
      cliente = proj?.cliente || cliente;
    }

    // narrativa (cache em result_json.report)
    let narrativa = result.report;
    const forcar = req.query.regenerar === '1';
    if (!narrativa || forcar) {
      narrativa = await gerarRelatorioVendedor({ cliente, result });
      const novoResult = { ...result, report: narrativa };
      await db.from('mapa_assessments').update({ result_json: novoResult }).eq('id', assessment.id);
    }

    const pdf = await gerarPdfMaturidade({ cliente, result, narrativa });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="mapa-da-maturidade${cliente ? '-' + slug(cliente) : ''}.pdf"`
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

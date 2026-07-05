// GET /api/mapa/report?token=...&format=html|pdf
//   format=html (default) → página web do relatório editorial (text/html)
//   format=pdf            → PDF pixel-perfect (chromium renderiza o mesmo HTML)
// A narrativa da IA (Sonnet) é cacheada em result_json.report.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { gerarRelatorioVendedor } from '../../../lib/mapa-maturidade/reportVendedor';
import { buildRelatorioMaturidadeHtml } from '../../../lib/mapa-maturidade/reportHtml';
import { generatePdfFromPage } from '../../../lib/pdf/generatePdfFromPage';

export const maxDuration = 120;
export const config = { maxDuration: 120 };

function mesAno(iso) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
  } catch { return ''; }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;
  const token = (req.query.token || '').toString().trim();
  const format = (req.query.format || 'html').toString();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const { data: assessment } = await db
    .from('mapa_assessments')
    .select('id, projeto_id, status, result_json, cadastro_json, completed_at')
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
      const { data: proj } = await db.from('projetos').select('cliente').eq('id', assessment.projeto_id).maybeSingle();
      cliente = proj?.cliente || cliente;
    }

    let narrativa = result.report;
    if (!narrativa || req.query.regenerar === '1') {
      narrativa = await gerarRelatorioVendedor({ cliente, result });
      await db.from('mapa_assessments').update({ result_json: { ...result, report: narrativa } }).eq('id', assessment.id);
    }

    const html = buildRelatorioMaturidadeHtml({ cliente, dataLabel: mesAno(assessment.completed_at), result, narrativa });

    if (format === 'pdf') {
      const pdf = await generatePdfFromPage({ html, waitForSelector: 'footer .brand', margens: { top: '0', right: '0', bottom: '0', left: '0' } });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="mapa-da-maturidade${cliente ? '-' + slug(cliente) : ''}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      return res.status(200).send(Buffer.from(pdf));
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (e) {
    console.error('[mapa/report]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao gerar relatório' });
  }
}

function slug(str) {
  return String(str).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

// GET /api/mapa/report-pdf?token=...  → PDF do relatório (download real).
// Renderiza a página /api/mapa/report (mesmo HTML) num Chromium headless
// serverless (@sparticuz/chromium + playwright-core) e devolve como anexo.
import { generatePdfFromPage } from '../../../lib/pdf/generatePdfFromPage';

export const config = { maxDuration: 60 };

function baseUrl(req) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
  return host ? `${proto}://${host}` : (process.env.SITE_URL || '');
}

export default async function handler(req, res) {
  const token = (req.query.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const url = `${baseUrl(req)}/api/mapa/report?token=${encodeURIComponent(token)}`;
  try {
    const pdf = await generatePdfFromPage({ url, waitForSelector: null });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="mapa-da-maturidade.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(pdf));
  } catch (e) {
    console.error('[mapa/report-pdf]', e?.message);
    return res.status(500).json({ success: false, error: 'Falha ao gerar o PDF' });
  }
}

// GET /api/identidade-final/report?token=...  → PDF de triangulação (Sonnet).
// Aceita qualquer um dos 3 tokens do assessment (serve o admin). A narrativa
// é cacheada em result_json.report (regenerar com ?regenerar=1).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { gerarRelatorioTriangulacao } from '../../../lib/identidade-final/report';
import { gerarPdfIdentidade } from '../../../lib/identidade-final/reportPdf';

export const maxDuration = 120;
export const config = { maxDuration: 120 };

const TOKEN_RE = /^[a-f0-9]{32,64}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;

  const token = (req.query.token || '').toString().trim();
  if (!TOKEN_RE.test(token)) return res.status(400).json({ success: false, error: 'token inválido' });

  const { data: assessment } = await db
    .from('id_v2_assessments')
    .select('id, projeto_id, status, result_json, socios_token, colaboradores_token, clientes_token')
    .or(`socios_token.eq.${token},colaboradores_token.eq.${token},clientes_token.eq.${token}`)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });
  if (!assessment.result_json) {
    return res.status(409).json({ success: false, error: 'Ainda não há respostas suficientes para o relatório' });
  }

  const result = assessment.result_json;

  try {
    const { data: proj } = await db.from('projetos').select('cliente').eq('id', assessment.projeto_id).maybeSingle();
    const cliente = proj?.cliente || '';

    let narrativa = result.report;
    const forcar = req.query.regenerar === '1';
    if (!narrativa || forcar) {
      narrativa = await gerarRelatorioTriangulacao({ cliente, result });
      await db.from('id_v2_assessments').update({ result_json: { ...result, report: narrativa } }).eq('id', assessment.id);
    }

    const pdf = await gerarPdfIdentidade({ cliente, result, narrativa });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="mapa-identidade${cliente ? '-' + slug(cliente) : ''}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    return res.status(200).send(pdf);
  } catch (e) {
    console.error('[identidade-final/report]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao gerar relatório' });
  }
}

function slug(str) {
  return String(str).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

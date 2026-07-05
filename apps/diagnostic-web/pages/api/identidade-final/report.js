// GET /api/identidade-final/report?token=...&format=html|pdf
//   format=html (default) → página web do relatório de triangulação (text/html)
//   format=pdf            → PDF pixel-perfect (chromium renderiza o mesmo HTML)
// Aceita qualquer um dos 3 tokens. Narrativa cacheada em result_json.report.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { gerarRelatorioTriangulacao } from '../../../lib/identidade-final/report';
import { buildRelatorioIdentidadeHtml } from '../../../lib/identidade-final/reportHtml';
import { abertasDoPublico } from '../../../lib/identidade-final/catalog';
import { generatePdfFromPage } from '../../../lib/pdf/generatePdfFromPage';

export const maxDuration = 120;
export const config = { maxDuration: 120 };

const TOKEN_RE = /^[a-f0-9]{32,64}$/;
const PROPOSITO_ID = 'AB-SD-MAR-01'; // "que problema queriam resolver" — propósito de origem

function mesAno(iso) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
  } catch { return ''; }
}

// respostas abertas dos sócios (value_text) → { proposito, aberturas[] }
async function buscarAberturas(db, assessmentId) {
  const { data: reps } = await db.from('id_v2_respondents').select('id').eq('assessment_id', assessmentId).eq('publico', 'socios').eq('status', 'completed');
  const ids = (reps || []).map((r) => r.id);
  if (!ids.length) return { proposito: null, aberturas: [] };
  const abertaIds = new Set(abertasDoPublico('socios').map((q) => q.id));
  const { data: ans } = await db.from('id_v2_answers').select('question_id, value_text').in('respondent_id', ids);
  let proposito = null;
  const aberturas = [];
  for (const a of ans || []) {
    if (!a.value_text || !abertaIds.has(a.question_id)) continue;
    if (a.question_id === PROPOSITO_ID && !proposito) proposito = a.value_text;
    else aberturas.push(a.value_text);
  }
  if (!proposito && aberturas.length) proposito = aberturas.shift();
  return { proposito, aberturas };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;
  const token = (req.query.token || '').toString().trim();
  const format = (req.query.format || 'html').toString();
  if (!TOKEN_RE.test(token)) return res.status(400).json({ success: false, error: 'token inválido' });

  const { data: assessment } = await db
    .from('id_v2_assessments')
    .select('id, projeto_id, status, result_json, completed_at, socios_token, colaboradores_token, clientes_token')
    .or(`socios_token.eq.${token},colaboradores_token.eq.${token},clientes_token.eq.${token}`)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });
  if (!assessment.result_json) return res.status(409).json({ success: false, error: 'Ainda não há respostas suficientes para o relatório' });

  const result = assessment.result_json;

  try {
    const { data: proj } = await db.from('projetos').select('cliente').eq('id', assessment.projeto_id).maybeSingle();
    const cliente = proj?.cliente || '';
    const { proposito, aberturas } = await buscarAberturas(db, assessment.id);

    let narrativa = result.report;
    if (!narrativa || req.query.regenerar === '1') {
      narrativa = await gerarRelatorioTriangulacao({ cliente, result, proposito, aberturas });
      await db.from('id_v2_assessments').update({ result_json: { ...result, report: narrativa } }).eq('id', assessment.id);
    }

    const html = buildRelatorioIdentidadeHtml({ cliente, dataLabel: mesAno(assessment.completed_at), result, narrativa, proposito });

    if (format === 'pdf') {
      const pdf = await generatePdfFromPage({ html, waitForSelector: 'footer .brand', margens: { top: '0', right: '0', bottom: '0', left: '0' } });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="mapa-identidade${cliente ? '-' + slug(cliente) : ''}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      return res.status(200).send(Buffer.from(pdf));
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (e) {
    console.error('[identidade-final/report]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao gerar relatório' });
  }
}

function slug(str) {
  return String(str).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

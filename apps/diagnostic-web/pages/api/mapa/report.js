// GET /api/mapa/report?token=...  → página web do relatório editorial (text/html)
// Com ?print=1 a página dispara window.print() ao carregar (PDF pelo navegador).
// A narrativa da IA (Sonnet) é cacheada em result_json.report.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { gerarRelatorioVendedor } from '../../../lib/mapa-maturidade/reportVendedor';
import { buildRelatorioMaturidadeHtml } from '../../../lib/mapa-maturidade/reportHtml';
import { extrairTelefone } from '../../../lib/whatsapp/wasender';

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

    const html = buildRelatorioMaturidadeHtml({
      cliente,
      dataLabel: mesAno(assessment.completed_at),
      result,
      narrativa,
      // pré-preenche o painel de WhatsApp quando o contato do cadastro é telefone
      telefonePrefill: extrairTelefone(assessment.cadastro_json?.['CAD-MM-006']) || '',
    });
    // O PDF é gerado no cliente (window.print() na própria página — ver ?print=1),
    // evitando dependência de chromium serverless.
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  } catch (e) {
    console.error('[mapa/report]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao gerar relatório' });
  }
}

// POST /api/mapa/whatsapp — PÚBLICO, por token
// Body: { token, phone? }
// Envia o link do relatório Essencial por WhatsApp (WaSenderAPI) para o
// telefone informado (ou o do cadastro). Máx. 3 envios por avaliação.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { extrairTelefone, sendWhatsAppText } from '../../../lib/whatsapp/wasender';

const MAX_ENVIOS = 3;

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return host ? `${proto}://${host}` : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;
  const token = (req.body?.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  const { data: assessment } = await db
    .from('mapa_assessments')
    .select('id, status, cadastro_json, extras_json')
    .eq('token', token)
    .maybeSingle();
  if (!assessment) return res.status(404).json({ success: false, error: 'Link inválido' });
  if (assessment.status !== 'concluido') {
    return res.status(409).json({ success: false, error: 'Check-up ainda não concluído' });
  }

  const telefone =
    extrairTelefone(req.body?.phone) || extrairTelefone(assessment.cadastro_json?.['CAD-MM-006']);
  if (!telefone) {
    return res.status(400).json({ success: false, error: 'Informe um número de WhatsApp válido (com DDD).' });
  }

  const anterior = assessment.extras_json?.relatorio_whatsapp;
  if ((anterior?.count || 0) >= MAX_ENVIOS) {
    return res.status(429).json({ success: false, error: 'Limite de envios atingido para este relatório.' });
  }

  const base = baseUrl(req);
  const url = `${base}/api/mapa/report?token=${encodeURIComponent(token)}`;
  const nome = String(assessment.cadastro_json?.['CAD-MM-001'] || '').trim().split(/\s+/)[0];
  const empresa = String(assessment.cadastro_json?.['CAD-MM-002'] || '').trim();
  const text =
    `${nome ? `Olá, ${nome}! ` : 'Olá! '}Seu *Mapa do Crescimento Integrado Essencial*` +
    `${empresa ? ` da ${empresa}` : ''} está pronto. 📊\n\n` +
    `Acesse o relatório completo: ${url}\n\n` +
    `O link é pessoal — salve esta mensagem para consultar quando quiser. ` +
    `Na própria página você pode baixar o PDF.\n\n` +
    `Espansione · Clareza para decidir. Estrutura para crescer.`;

  try {
    await sendWhatsAppText({ to: telefone, text });
  } catch (e) {
    console.error('[mapa/whatsapp] envio falhou:', e?.message || e);
    return res.status(502).json({ success: false, error: 'Não foi possível enviar agora. Tente novamente.' });
  }

  await db
    .from('mapa_assessments')
    .update({
      extras_json: {
        ...(assessment.extras_json || {}),
        relatorio_whatsapp: {
          to: telefone,
          count: (anterior?.count || 0) + 1,
          last_sent_at: new Date().toISOString(),
        },
      },
    })
    .eq('id', assessment.id);

  return res.status(200).json({ success: true, to: telefone });
}

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { tokenValido } from '../../../lib/tokens/respondenteToken';

// Entrevista guiada por IA — Slice 2.
// Fallback de transcrição: quando o device não tem Web Speech API (caso típico
// do iOS Safari), o navegador grava o áudio com MediaRecorder e envia os bytes
// crus aqui; transcrevemos via OpenAI Whisper. Custo ~US$ 0,006/min.
//
// O áudio chega como corpo binário cru (Content-Type do blob), por isso o
// bodyParser do Next fica desligado e lemos o stream manualmente.

export const config = { api: { bodyParser: false } };

const MAX_BYTES = 25 * 1024 * 1024; // limite do Whisper

async function readRawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BYTES) throw new Error('Áudio muito grande (máx. 25MB).');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function extPorTipo(ct) {
  if (ct.includes('mp4') || ct.includes('m4a')) return 'mp4';
  if (ct.includes('mpeg') || ct.includes('mp3')) return 'mp3';
  if (ct.includes('wav')) return 'wav';
  if (ct.includes('ogg')) return 'ogg';
  return 'webm';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ success: false, error: 'OPENAI_API_KEY ausente' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const token = (req.query.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  try {
    // Valida o token (este endpoint custa dinheiro — não deixar aberto).
    const { data: resp, error } = await supabaseAdmin
      .from('respondentes')
      .select('token_expira_em')
      .eq('token', token)
      .maybeSingle();
    if (error) throw error;
    if (!resp) return res.status(404).json({ success: false, error: 'Token inválido' });
    if (!tokenValido(resp.token_expira_em)) {
      return res.status(410).json({ success: false, error: 'Link expirado' });
    }

    const contentType = (req.headers['content-type'] || 'audio/webm').split(';')[0];
    const buf = await readRawBody(req);
    if (!buf.length) return res.status(400).json({ success: false, error: 'Áudio vazio' });

    const form = new FormData();
    form.append('file', new Blob([buf], { type: contentType }), `audio.${extPorTipo(contentType)}`);
    form.append('model', 'whisper-1');
    form.append('language', 'pt');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || 'Falha na transcrição');

    return res.status(200).json({ success: true, text: (j.text || '').trim() });
  } catch (err) {
    console.error('[entrevista/transcribe] erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

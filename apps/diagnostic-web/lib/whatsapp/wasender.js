// Envio de mensagens WhatsApp via WaSenderAPI (wasenderapi.com).
// Env: WASENDERAPI (Bearer token da sessão conectada).

export { extrairTelefone } from './phone';

export async function sendWhatsAppText({ to, text }) {
  const key = process.env.WASENDERAPI;
  if (!key) throw new Error('WASENDERAPI não configurada');
  const r = await fetch('https://www.wasenderapi.com/api/send-message', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, text }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.success === false) {
    const msg = data?.message || data?.error || `HTTP ${r.status}`;
    throw new Error(`WaSender: ${msg}`);
  }
  return data;
}

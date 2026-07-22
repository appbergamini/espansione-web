// Envio de mensagens WhatsApp via WaSenderAPI (wasenderapi.com).
// Env: WASENDERAPI (Bearer token da sessão conectada).

// Extrai/normaliza um telefone BR do campo livre de contato para E.164.
// Aceita "(11) 98765-4321", "11987654321", "5511987654321", "+55 11 ...".
// Retorna null quando o texto não parece um telefone (ex.: é um e-mail).
export function extrairTelefone(contato) {
  const s = String(contato || '');
  if (s.includes('@')) return null;
  const digitos = s.replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) return `+55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) return `+${digitos}`;
  // internacional explícito (já veio com +)
  if (/^\s*\+/.test(s) && digitos.length >= 8 && digitos.length <= 15) return `+${digitos}`;
  return null;
}

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

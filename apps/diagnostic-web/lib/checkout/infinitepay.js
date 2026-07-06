// Verificação de pagamento no InfinitePay (anti-spoof do webhook/acesso).
// POST https://api.checkout.infinitepay.io/payment_check
//   { handle, order_nsu, transaction_nsu, slug } → confirma se o pagamento existe.
//
// A doc não fixa o formato exato da resposta — parse defensivo. Retorna:
//   'paid'      pagamento confirmado
//   'unpaid'    resposta explicitamente negativa
//   'unknown'   não deu p/ verificar (sem handle, erro de rede, formato novo)
export async function verificarPagamento({ order_nsu, transaction_nsu, slug }) {
  const handle = process.env.INFINITEPAY_HANDLE;
  if (!handle || !order_nsu) return 'unknown';
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.INFINITEPAY_API_KEY) headers.Authorization = `Bearer ${process.env.INFINITEPAY_API_KEY}`;
    const r = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST', headers,
      body: JSON.stringify({ handle, order_nsu, transaction_nsu, slug }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return 'unknown';
    // procura um sinal de "pago" em campos comuns
    const flat = JSON.stringify(data).toLowerCase();
    const pago = data.paid === true || data.success === true || data.is_paid === true ||
      /"(status|payment_status)":"(paid|approved|success|captured|confirmed)"/.test(flat) ||
      /"paid":true/.test(flat);
    const negado = /"(status|payment_status)":"(failed|refused|canceled|cancelled|denied|declined|pending|not_found)"/.test(flat) ||
      data.paid === false || data.success === false;
    if (pago) return 'paid';
    if (negado) return 'unpaid';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// POST /api/checkout/infinitepay-webhook
// Recebe a notificação de pagamento do InfinitePay e registra em `pagamentos`.
// Responde 200 (aceito) ou 400. Defensivo ao formato do payload — grava o raw
// e extrai os campos conhecidos (order_nsu, transaction_nsu, slug, receipt_url,
// status, cliente, valor). A liberação do produto p/ um projeto é feita depois
// pelo admin (o pagamento anônimo da LP não conhece o projeto).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function pick(obj, ...keys) {
  for (const k of keys) {
    const v = k.split('.').reduce((o, p) => (o == null ? o : o[p]), obj);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const registro = {
    order_nsu: pick(body, 'order_nsu', 'orderNsu', 'data.order_nsu'),
    transaction_nsu: pick(body, 'transaction_nsu', 'transactionNsu', 'data.transaction_nsu'),
    slug: pick(body, 'slug', 'data.slug'),
    receipt_url: pick(body, 'receipt_url', 'receiptUrl', 'data.receipt_url'),
    status: pick(body, 'status', 'payment_status', 'data.status') || 'received',
    valor_centavos: Number(pick(body, 'amount', 'price', 'paid_amount', 'data.amount')) || null,
    cliente: pick(body, 'customer', 'data.customer') || null,
    raw: body,
  };

  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('pagamentos').insert([registro]);
      if (error) console.error('[checkout/webhook] insert', error.message);
    }
  } catch (e) {
    console.error('[checkout/webhook] exceção', e?.message);
    // ainda respondemos 200 p/ não gerar reentrega infinita; o raw fica no log
  }

  console.log('[checkout/webhook] pagamento', registro.order_nsu, registro.status);
  return res.status(200).json({ ok: true });
}

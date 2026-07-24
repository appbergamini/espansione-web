// POST /api/feira/checkout
// Registra o visitante e cria um checkout individual da InfinitePay.
// Cada checkout recebe um order_nsu próprio, permitindo que o webhook marque
// com precisão qual cadastro realizado na feira foi pago.
import crypto from 'crypto';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const INFINITEPAY_API = 'https://api.checkout.infinitepay.io/links';
const FALLBACK_PAYMENT_URL = 'https://link.infinitepay.io/espansione/Ri1B-URqF8f0kDo-3700,00';

function baseUrl(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (!host) return (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  return `${protocol}://${host}`;
}

function normalizarTelefone(valor) {
  const numeros = String(valor || '').replace(/\D/g, '');
  if (numeros.length < 10 || numeros.length > 13) return null;
  return `+${numeros.startsWith('55') ? numeros : `55${numeros}`}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Cadastro indisponível no momento.' });

  const nome = String(req.body?.nome || '').trim().replace(/\s+/g, ' ');
  const email = String(req.body?.email || '').trim().toLowerCase();
  const whatsapp = normalizarTelefone(req.body?.whatsapp);

  if (nome.length < 2) return res.status(400).json({ success: false, error: 'Informe seu nome.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'Informe um e-mail válido.' });
  if (!whatsapp) return res.status(400).json({ success: false, error: 'Informe um WhatsApp válido com DDD.' });

  const orderNsu = `feira__${crypto.randomUUID()}`;
  const lead = { nome, email, whatsapp, order_nsu: orderNsu };
  const { error: leadError } = await supabaseAdmin.from('leads_feira').insert([lead]);
  if (leadError) {
    console.error('[feira/checkout] cadastro', leadError.message);
    return res.status(500).json({ success: false, error: 'Não foi possível salvar seu cadastro. Tente novamente.' });
  }

  const handle = process.env.FEIRA_INFINITEPAY_HANDLE || process.env.INFINITEPAY_HANDLE || 'espansione';
  const price = Number(process.env.FEIRA_VALOR_CENTAVOS || 370000);
  const description = process.env.FEIRA_PRODUTO_NOME || 'Oferta especial da feira · Espansione';
  const base = baseUrl(req);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.INFINITEPAY_API_KEY) headers.Authorization = `Bearer ${process.env.INFINITEPAY_API_KEY}`;
    const response = await fetch(INFINITEPAY_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        handle,
        items: [{ quantity: 1, price, description }],
        customer: { name: nome, email, phone_number: whatsapp },
        order_nsu: orderNsu,
        redirect_url: `${base}/feira/obrigado?order=${encodeURIComponent(orderNsu)}`,
        webhook_url: `${base}/api/checkout/infinitepay-webhook`,
      }),
    });
    const data = await response.json().catch(() => ({}));
    const paymentUrl = data.url || data.link || data.checkout_url || data.data?.url || data.payment_url;
    if (!response.ok || !paymentUrl) throw new Error(data?.error || 'Checkout não retornou um link válido.');

    await supabaseAdmin.from('leads_feira').update({ checkout_url: paymentUrl }).eq('order_nsu', orderNsu);
    return res.status(200).json({ success: true, paymentUrl });
  } catch (error) {
    // O link recebido da equipe mantém o atendimento funcionando caso a API
    // esteja momentaneamente indisponível. Ele não possui order_nsu próprio,
    // portanto não deve ser usado como o caminho normal de rastreamento.
    console.error('[feira/checkout] InfinitePay', error?.message || error);
    await supabaseAdmin.from('leads_feira')
      .update({ checkout_url: FALLBACK_PAYMENT_URL, status: 'checkout_estatico' })
      .eq('order_nsu', orderNsu);
    return res.status(200).json({ success: true, paymentUrl: FALLBACK_PAYMENT_URL, fallback: true });
  }
}

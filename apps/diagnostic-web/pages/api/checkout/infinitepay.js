// GET /api/checkout/infinitepay?produto=<slug>
// Cria um link de checkout hospedado no InfinitePay (POST /links) e redireciona.
// Preço/nome vêm do catálogo `produtos_checkout` (editável no /adm/produtos),
// NÃO de env var. O slug do produto vai codificado no order_nsu (slug__uuid)
// para o webhook saber o que provisionar.
// Config por env: INFINITEPAY_HANDLE (obrig.), INFINITEPAY_API_KEY (opc.),
//                 NEXT_PUBLIC_SITE_URL (opc.).

import crypto from 'crypto';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const API = 'https://api.checkout.infinitepay.io/links';

function baseUrl(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const slug = (req.query.produto || 'identidade').toString().trim();

  const { data: produto } = await supabaseAdmin
    .from('produtos_checkout')
    .select('slug, nome, preco_centavos, ativo')
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle();
  if (!produto) return res.status(404).json({ success: false, error: 'Produto não encontrado ou inativo' });

  const handle = process.env.INFINITEPAY_HANDLE;
  const price = Number(produto.preco_centavos);
  if (!handle || !Number.isFinite(price) || price <= 0) {
    console.error('[checkout] config ausente', { temHandle: !!handle, price });
    return res.status(500).json({ success: false, error: 'Checkout não configurado (handle/preço)' });
  }

  // slug codificado no order_nsu → o webhook sabe o produto/fulfillment
  const orderNsu = `${slug}__${crypto.randomUUID()}`;
  const base = baseUrl(req);

  const payload = {
    handle,
    items: [{ quantity: 1, price, description: produto.nome }],
    order_nsu: orderNsu,
    redirect_url: `${base}/identidade/setup?order=${encodeURIComponent(orderNsu)}`,
    webhook_url: `${base}/api/checkout/infinitepay-webhook`,
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.INFINITEPAY_API_KEY) headers.Authorization = `Bearer ${process.env.INFINITEPAY_API_KEY}`;

    const r = await fetch(API, { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[checkout] InfinitePay erro', r.status, data);
      return res.status(502).json({ success: false, error: 'Falha ao criar o checkout', detalhe: data });
    }
    const link = data.url || data.link || data.checkout_url || data.data?.url || data.payment_url;
    if (!link) {
      console.error('[checkout] resposta sem link', data);
      return res.status(502).json({ success: false, error: 'Checkout criado, mas sem link', detalhe: data });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, link);
  } catch (e) {
    console.error('[checkout] exceção', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro no checkout' });
  }
}

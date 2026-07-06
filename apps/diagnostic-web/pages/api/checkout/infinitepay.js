// GET /api/checkout/infinitepay?produto=identidade
// Cria um link de checkout hospedado no InfinitePay (POST /links) e redireciona
// o cliente para o pagamento. Config por env (sem segredos no código):
//   INFINITEPAY_HANDLE            InfiniteTag (sem o "$")            [obrigatório]
//   INFINITEPAY_PRICE_IDENTIDADE  preço em CENTAVOS (ex.: 149700)   [obrigatório]
//   INFINITEPAY_API_KEY           Bearer, se a sua conta exigir      [opcional]
//   NEXT_PUBLIC_SITE_URL          base p/ redirect/webhook (senão deriva do host)

import crypto from 'crypto';

const API = 'https://api.checkout.infinitepay.io/links';

const PRODUTOS = {
  identidade: { envPreco: 'INFINITEPAY_PRICE_IDENTIDADE', descricao: 'Mapa de Identidade Estratégica' },
};

function baseUrl(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const produtoKey = (req.query.produto || 'identidade').toString();
  const produto = PRODUTOS[produtoKey];
  if (!produto) return res.status(400).json({ success: false, error: 'Produto inválido' });

  const handle = process.env.INFINITEPAY_HANDLE;
  const price = Number(process.env[produto.envPreco]);
  if (!handle || !Number.isFinite(price) || price <= 0) {
    console.error('[checkout] config ausente', { temHandle: !!handle, price });
    return res.status(500).json({ success: false, error: 'Checkout não configurado (handle/preço)' });
  }

  // order_nsu opcional: se vier no query (ex.: id de um lead/projeto), amarra o pedido.
  const orderNsu = (req.query.order_nsu || `ip-${crypto.randomUUID()}`).toString();
  const base = baseUrl(req);

  const payload = {
    handle,
    items: [{ quantity: 1, price, description: produto.descricao }],
    order_nsu: orderNsu,
    // após pagar, o comprador cai direto no setup do Mapa de Identidade
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
    // o link vem em algum destes campos, conforme a resposta da API
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

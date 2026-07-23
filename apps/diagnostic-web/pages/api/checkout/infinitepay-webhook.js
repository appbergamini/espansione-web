// POST /api/checkout/infinitepay-webhook
// Recebe a notificação de pagamento do InfinitePay e registra em `pagamentos`.
// Responde 200 (aceito) ou 400. Defensivo ao formato do payload — grava o raw
// e extrai os campos conhecidos (order_nsu, transaction_nsu, slug, receipt_url,
// status, cliente, valor). A liberação do produto p/ um projeto é feita depois
// pelo admin (o pagamento anônimo da LP não conhece o projeto).

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { provisionarIdentidade, registrarPagamento } from '../../../lib/checkout/provisionar';
import { verificarPagamento } from '../../../lib/checkout/infinitepay';

// slug do produto vem codificado no order_nsu (slug__uuid); resolve o
// fulfillment pelo catálogo produtos_checkout (default 'identidade' p/ orders antigos)
async function fulfillmentDoPedido(db, orderNsu) {
  const slug = String(orderNsu || '').split('__')[0];
  // A compra da feira é acompanhada no painel, mas não libera um assessment.
  if (slug === 'feira') return { slug, fulfillment: 'nenhum' };
  if (!slug) return { slug: 'identidade', fulfillment: 'identidade' };
  const { data } = await db.from('produtos_checkout').select('slug, fulfillment').eq('slug', slug).maybeSingle();
  return data ? { slug: data.slug, fulfillment: data.fulfillment } : { slug: 'identidade', fulfillment: 'identidade' };
}

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
    slug: pick(body, 'invoice_slug', 'slug', 'data.invoice_slug', 'data.slug'),
    receipt_url: pick(body, 'receipt_url', 'receiptUrl', 'data.receipt_url'),
    status: pick(body, 'status', 'payment_status', 'data.status') || 'received',
    valor_centavos: Number(pick(body, 'amount', 'price', 'paid_amount', 'data.amount')) || null,
    cliente: pick(body, 'customer', 'data.customer') || null,
    raw: body,
  };

  // Anti-spoof: confirma o pagamento no InfinitePay antes de liberar acesso.
  //   paid    → provisiona
  //   unpaid  → NÃO provisiona (registra como não-pago)
  //   unknown → provisiona, mas marca 'paid_unverified' (não deu p/ verificar)
  const negadoStatus = /fail|refus|cancel|denied|declin/i.test(String(registro.status || ''));
  let verif = 'unknown';
  if (registro.order_nsu && !negadoStatus) {
    verif = await verificarPagamento({ order_nsu: registro.order_nsu, transaction_nsu: registro.transaction_nsu, slug: registro.slug });
  }
  const liberar = registro.order_nsu && !negadoStatus && verif !== 'unpaid';

  try {
    if (supabaseAdmin && liberar) {
      if (verif === 'unknown') console.warn('[checkout/webhook] pagamento NÃO verificado (payment_check inconclusivo) — liberando como paid_unverified', registro.order_nsu);
      const { slug, fulfillment } = await fulfillmentDoPedido(supabaseAdmin, registro.order_nsu);

      // A InfinitePay pode não repetir o objeto customer no webhook. No fluxo
      // da feira, recuperamos os dados do cadastro pelo order_nsu para que
      // /adm/pagamentos mostre o comprador como nas demais vendas.
      if (slug === 'feira' && !registro.cliente) {
        const { data: lead } = await supabaseAdmin
          .from('leads_feira')
          .select('nome, email, whatsapp')
          .eq('order_nsu', registro.order_nsu)
          .maybeSingle();
        if (lead) registro.cliente = { name: lead.nome, email: lead.email, phone_number: lead.whatsapp };
      }

      const extraPagamento = {
        transaction_nsu: registro.transaction_nsu,
        slug: registro.slug,
        receipt_url: registro.receipt_url,
        status: verif === 'unknown' ? 'paid_unverified' : (registro.status || 'paid'),
        valor_centavos: registro.valor_centavos,
        raw: registro.raw,
      };
      if (fulfillment === 'identidade') {
        await provisionarIdentidade(supabaseAdmin, { orderNsu: registro.order_nsu, comprador: registro.cliente, extraPagamento });
      } else {
        // treinamento/nenhum: só registra a compra (libera acesso à /area por compra paga)
        await registrarPagamento(supabaseAdmin, { orderNsu: registro.order_nsu, comprador: registro.cliente, produto: slug, extra: extraPagamento });
      }

      // O order_nsu é criado antes do redirecionamento em /feira. Assim, a
      // confirmação vem do webhook, e não de uma suposição do navegador.
      if (slug === 'feira') {
        const { data: pagamento } = await supabaseAdmin
          .from('pagamentos')
          .select('id')
          .eq('order_nsu', registro.order_nsu)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        await supabaseAdmin.from('leads_feira').update({
          status: 'pago',
          pagamento_id: pagamento?.id || null,
          pago_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('order_nsu', registro.order_nsu);
      }
    } else if (supabaseAdmin) {
      // sem order_nsu, negado, ou unpaid: só registra o evento
      await supabaseAdmin.from('pagamentos').insert([{ ...registro, status: verif === 'unpaid' ? 'unpaid' : registro.status }])
        .then(({ error }) => error && console.error('[checkout/webhook] insert', error.message));
    }
  } catch (e) {
    console.error('[checkout/webhook] provisionar', e?.message);
    // responde 200 mesmo assim (evita reentrega infinita); o raw fica no log
  }

  console.log('[checkout/webhook] pagamento', registro.order_nsu, 'verif=' + verif, registro.status);
  return res.status(200).json({ ok: true });
}

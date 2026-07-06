// /api/identidade-final/acesso?order=<order_nsu>
// GET  → estado do acesso pós-compra: aguardando pagamento OU (pago) os 3 links.
// POST { order, empresa, email } → define empresa (projeto.cliente) e/ou e-mail
//        do comprador (pagamentos.cliente → usado pela /area). Ao receber o
//        e-mail pela 1ª vez, dispara o e-mail de boas-vindas.
//
// Segurança: só libera se existe uma linha em `pagamentos` para o order_nsu
// (criada pelo webhook = pagamento confirmado). Não cria pagamento aqui.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { provisionarIdentidade } from '../../../lib/checkout/provisionar';
import { sendWelcomeIdentidade } from '../../../lib/emails/sendWelcomeIdentidade';

function baseUrl(req) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  if (host) {
    const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
    return `${proto}://${host}`;
  }
  return (process.env.SITE_URL || '').replace(/\/$/, '');
}

function montarLinks(a) {
  const add = (publico, token) => (token ? { publico, link: `/form/identidade-final/${publico}?token=${token}` } : null);
  return [add('socios', a.socios_token), add('colaboradores', a.colaboradores_token), add('clientes', a.clientes_token)].filter(Boolean);
}

async function pagamentoDe(db, orderNsu) {
  const { data } = await db
    .from('pagamentos')
    .select('id, projeto_id, status, cliente')
    .eq('order_nsu', orderNsu)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;
  const order = (req.method === 'GET' ? req.query.order : req.body?.order || '').toString().trim();
  if (!order) return res.status(400).json({ success: false, error: 'order obrigatório' });

  const pg = await pagamentoDe(db, order);
  if (!pg) {
    return res.status(200).json({ success: true, paid: false, aguardando: true });
  }
  if (/fail|refus|cancel|denied|declin/i.test(String(pg.status || ''))) {
    return res.status(200).json({ success: true, paid: false, recusado: true });
  }

  try {
    const { projetoId, assessment, cliente } = await provisionarIdentidade(db, { orderNsu: order });
    const clientePg = pg.cliente && typeof pg.cliente === 'object' ? pg.cliente : {};
    const emailStored = (clientePg.email || '').toString();

    if (req.method === 'POST') {
      const empresa = (req.body?.empresa || '').toString().trim();
      const email = (req.body?.email || '').toString().trim().toLowerCase();
      let clienteFinal = cliente;

      if (empresa) {
        await db.from('projetos').update({ cliente: empresa }).eq('id', projetoId);
        clienteFinal = empresa;
      }

      if (email && /.+@.+\..+/.test(email)) {
        const jaEnviou = clientePg.welcome_sent === true;
        const novoCliente = { ...clientePg, email, nome: empresa || clientePg.nome || null, welcome_sent: true };
        await db.from('pagamentos').update({ cliente: novoCliente }).eq('id', pg.id);

        if (!jaEnviou) {
          try {
            await sendWelcomeIdentidade({
              to: email,
              nome: empresa || clientePg.nome || '',
              baseUrl: baseUrl(req),
              links: montarLinks(assessment),
              setupUrl: `${baseUrl(req)}/identidade/setup?order=${encodeURIComponent(order)}`,
            });
          } catch (e) {
            console.error('[acesso] falha ao enviar boas-vindas:', e?.message);
            // não bloqueia o acesso se o e-mail falhar
          }
        }
      }

      return res.status(200).json({ success: true, paid: true, cliente: clienteFinal, precisa_empresa: false, precisa_email: false, status: assessment.status, links: montarLinks(assessment) });
    }

    return res.status(200).json({
      success: true,
      paid: true,
      cliente: cliente || '',
      precisa_empresa: !cliente || cliente === 'Cliente Identidade',
      precisa_email: !emailStored,
      status: assessment.status,
      links: montarLinks(assessment),
    });
  } catch (e) {
    console.error('[identidade-final/acesso]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao liberar acesso' });
  }
}

// /api/identidade-final/acesso?order=<order_nsu>
// GET  → estado do acesso pós-compra: aguardando pagamento OU (pago) os 3 links.
// POST { order, empresa } → define o nome da empresa (projeto.cliente).
//
// Segurança: só libera se existe uma linha em `pagamentos` para o order_nsu
// (criada pelo webhook = pagamento confirmado). Não cria pagamento aqui.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { provisionarIdentidade } from '../../../lib/checkout/provisionar';

function montarLinks(a) {
  const add = (publico, token) => (token ? { publico, link: `/form/identidade-final/${publico}?token=${token}` } : null);
  return [
    add('socios', a.socios_token),
    add('colaboradores', a.colaboradores_token),
    add('clientes', a.clientes_token),
  ].filter(Boolean);
}

async function pagamentoDe(db, orderNsu) {
  const { data } = await db
    .from('pagamentos')
    .select('id, projeto_id, status')
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
    // webhook ainda não chegou (ou pagamento não confirmado) → cliente faz polling
    return res.status(200).json({ success: true, paid: false, aguardando: true });
  }
  if (/fail|refus|cancel|denied|declin/i.test(String(pg.status || ''))) {
    return res.status(200).json({ success: true, paid: false, recusado: true });
  }

  try {
    const { projetoId, assessment, cliente } = await provisionarIdentidade(db, { orderNsu: order });

    if (req.method === 'POST') {
      const empresa = (req.body?.empresa || '').toString().trim();
      if (empresa) {
        await db.from('projetos').update({ cliente: empresa }).eq('id', projetoId);
        return res.status(200).json({ success: true, paid: true, cliente: empresa, status: assessment.status, links: montarLinks(assessment) });
      }
    }

    return res.status(200).json({
      success: true,
      paid: true,
      cliente: cliente || '',
      precisa_empresa: !cliente || cliente === 'Cliente Identidade',
      status: assessment.status,
      links: montarLinks(assessment),
    });
  } catch (e) {
    console.error('[identidade-final/acesso]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao liberar acesso' });
  }
}

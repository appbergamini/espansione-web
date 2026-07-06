// =====================================================================
// Provisionamento pós-compra do Mapa de Identidade (self-serve).
// Idempotente por order_nsu: cria (ou recupera) um projeto leve para o
// comprador + o assessment id_v2 (produto=identidade_final) com os 3 tokens.
// Usado pelo webhook (fonte de verdade do pagamento) e pela API de acesso.
// =====================================================================
import crypto from 'crypto';

const tk = () => crypto.randomBytes(24).toString('hex');

// deriva um nome de cliente a partir dos dados do comprador (InfinitePay)
function nomeCliente(comprador) {
  if (!comprador) return null;
  return comprador.company || comprador.empresa || comprador.name || comprador.nome || comprador.email || null;
}

// Registra (idempotente por order_nsu) a linha de pagamento de QUALQUER produto.
// Usado por fulfillments que não criam assessment (treinamento/nenhum) e pela
// provisão de identidade.
export async function registrarPagamento(db, { orderNsu, comprador = null, produto = 'identidade', extra = {} }) {
  const { data } = await db
    .from('pagamentos')
    .select('id, projeto_id')
    .eq('order_nsu', orderNsu)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) return data;
  const { data: nova, error } = await db
    .from('pagamentos')
    .insert([{ order_nsu: orderNsu, status: 'paid', produto, cliente: comprador || null, ...extra }])
    .select('id, projeto_id')
    .single();
  if (error) throw error;
  return nova;
}

/**
 * Provisiona (ou recupera) o assessment do comprador (fulfillment=identidade).
 * @returns {{ projetoId, assessment, cliente }}
 */
export async function provisionarIdentidade(db, { orderNsu, comprador = null, extraPagamento = {} }) {
  if (!orderNsu) throw new Error('orderNsu obrigatório');

  const pg = await registrarPagamento(db, { orderNsu, comprador, produto: 'identidade', extra: extraPagamento });

  // 1) projeto (cria leve se ainda não vinculado)
  let projetoId = pg.projeto_id;
  if (!projetoId) {
    const cliente = nomeCliente(comprador) || 'Cliente Identidade';
    const { data: proj, error } = await db.from('projetos').insert([{ cliente }]).select('id, cliente').single();
    if (error) throw error;
    projetoId = proj.id;
    await db.from('pagamentos').update({ projeto_id: projetoId }).eq('id', pg.id);
  }

  // 2) assessment id_v2 (get-or-create, produto=identidade_final)
  const COLS = 'id, status, socios_token, colaboradores_token, clientes_token';
  let { data: a } = await db
    .from('id_v2_assessments')
    .select(COLS)
    .eq('projeto_id', projetoId)
    .eq('produto', 'identidade_final')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!a) {
    const { data: nova, error } = await db
      .from('id_v2_assessments')
      .insert([{ projeto_id: projetoId, produto: 'identidade_final', status: 'not_started', socios_token: tk(), colaboradores_token: tk(), clientes_token: tk() }])
      .select(COLS)
      .single();
    if (error) throw error;
    a = nova;
  }

  const { data: proj } = await db.from('projetos').select('cliente').eq('id', projetoId).maybeSingle();
  return { projetoId, assessment: a, cliente: proj?.cliente || nomeCliente(comprador) || '' };
}

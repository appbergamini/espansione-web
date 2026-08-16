import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';
import { criarSessao, sessaoPorToken } from '../../../lib/competencias/repo.js';

/**
 * Resolve o acesso do comprador ao teste.
 *
 * DECISÃO: o webhook do InfinitePay NÃO cria a sessão. Ele já registra o
 * pagamento (o ramo genérico dele faz exatamente isso para qualquer
 * fulfillment que não seja 'identidade'), e a sessão nasce aqui, na
 * primeira vez que a pessoa chega.
 *
 * Por quê: comp_assessments guarda catalogo_versao, faixas_versao e
 * delta_versao, que vivem no catálogo desta zona. Criar a sessão no
 * diagnostic-web obrigaria aquele app a conhecer o catálogo daqui — e a
 * versão gravada ficaria desatualizada em toda regeneração. Assim o
 * caminho de pagamento, que está vivo, não é tocado.
 *
 * Idempotente: chamar duas vezes devolve a MESMA sessão, com as respostas
 * já dadas. Nunca cria uma segunda.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Method Not Allowed' });
  if (!supabaseAdmin) return res.status(500).json({ erro: 'Indisponível no momento.' });

  try {
    const orderNsu = String(req.body?.orderNsu || '').trim();
    const token = String(req.body?.token || '').trim();

    // Já tem o link do teste: só devolve o estado.
    if (token) {
      const s = await sessaoPorToken(token);
      if (!s) return res.status(404).json({ erro: 'Teste não encontrado.' });
      return res.status(200).json({ token: s.token, status: s.status });
    }

    if (!orderNsu) return res.status(400).json({ erro: 'Informe o pedido.' });

    const { data: pagamento, error } = await supabaseAdmin
      .from('pagamentos')
      .select('id, status, cliente')
      .eq('order_nsu', orderNsu)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    if (!pagamento) return res.status(404).json({ erro: 'Não encontramos esse pedido.' });

    // 'paid_unverified' entra: é o caso em que o webhook não conseguiu
    // confirmar no InfinitePay, e o fluxo existente já trata como pago.
    const pago = ['paid', 'paid_unverified'].includes(String(pagamento.status || '').toLowerCase());
    if (!pago) return res.status(402).json({ erro: 'O pagamento ainda não foi confirmado. Tente em alguns minutos.' });

    const email = pagamento.cliente?.email || pagamento.cliente?.mail || null;
    const sessao = await criarSessao({ email, pagamentoId: pagamento.id, origem: 'pago' });

    return res.status(200).json({ token: sessao.token, status: sessao.status });
  } catch (e) {
    console.error('[competencias] acesso:', e);
    return res.status(500).json({ erro: 'Não foi possível liberar o seu teste. Fale com a gente.' });
  }
}

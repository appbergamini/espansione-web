// GET /api/adm/pagamentos — admin (master/admin). Lista as compras recebidas.
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { createApiHandler } from '../../../lib/api/http';
import { requireRole } from '../../../lib/api/auth';

export default createApiHandler({
  async GET(req, res) {
    await requireRole(req, res);
    const db = supabaseAdmin;

    const { data, error } = await db
      .from('pagamentos')
      .select('id, order_nsu, status, valor_centavos, produto, cliente, receipt_url, projeto_id, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return res.status(500).json({ success: false, error: error.message });

    // nome do projeto (quando vinculado)
    const ids = [...new Set((data || []).map((p) => p.projeto_id).filter(Boolean))];
    const projById = {};
    if (ids.length) {
      const { data: projs } = await db.from('projetos').select('id, cliente').in('id', ids);
      for (const p of projs || []) projById[p.id] = p.cliente;
    }

    const pagamentos = (data || []).map((p) => ({
      ...p,
      projeto_cliente: p.projeto_id ? projById[p.projeto_id] || null : null,
      comprador: p.cliente?.company || p.cliente?.name || p.cliente?.email || null,
    }));

    return res.status(200).json({ success: true, pagamentos });
  },
});

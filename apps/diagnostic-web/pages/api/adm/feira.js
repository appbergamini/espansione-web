// GET /api/adm/feira — cadastros e pagamentos originados no QR Code da feira.
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { createApiHandler } from '../../../lib/api/http';
import { requireRole } from '../../../lib/api/auth';

export default createApiHandler({
  async GET(req, res) {
    await requireRole(req, res);
    const { data, error } = await supabaseAdmin
      .from('leads_feira')
      .select('id, nome, email, whatsapp, order_nsu, status, checkout_iniciado_em, pago_em, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, leads: data || [] });
  },
});

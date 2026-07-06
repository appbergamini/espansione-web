// /api/adm/produtos — catálogo de produtos do checkout (master/admin).
// GET  → lista. POST { id?, slug, nome, descricao, preco_centavos, fulfillment, ativo } → cria/edita.
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { createApiHandler } from '../../../lib/api/http';
import { requireRole } from '../../../lib/api/auth';

const FULFILLMENTS = ['identidade', 'treinamento', 'nenhum'];

export default createApiHandler({
  async GET(req, res) {
    await requireRole(req, res);
    const { data, error } = await supabaseAdmin.from('produtos_checkout')
      .select('id, slug, nome, descricao, preco_centavos, fulfillment, ativo, created_at')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, produtos: data || [] });
  },

  async POST(req, res) {
    await requireRole(req, res);
    const b = req.body || {};
    const slug = String(b.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    const nome = String(b.nome || '').trim();
    const preco = Number(b.preco_centavos);
    const fulfillment = FULFILLMENTS.includes(b.fulfillment) ? b.fulfillment : 'nenhum';
    if (!slug || !nome || !Number.isFinite(preco) || preco <= 0) {
      return res.status(422).json({ success: false, error: 'slug, nome e preço (centavos > 0) obrigatórios' });
    }
    const linha = {
      slug, nome,
      descricao: b.descricao ? String(b.descricao) : null,
      preco_centavos: Math.round(preco),
      fulfillment,
      ativo: b.ativo !== false,
      updated_at: new Date().toISOString(),
    };
    if (b.id) {
      const { error } = await supabaseAdmin.from('produtos_checkout').update(linha).eq('id', b.id);
      if (error) return res.status(500).json({ success: false, error: error.message });
    } else {
      const { error } = await supabaseAdmin.from('produtos_checkout').upsert([linha], { onConflict: 'slug' });
      if (error) return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(200).json({ success: true });
  },
});

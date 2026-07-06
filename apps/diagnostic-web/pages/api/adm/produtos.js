// /api/adm/produtos — catálogo de produtos do checkout (master/admin).
// GET  → lista. POST { id?, slug, nome, descricao, preco_centavos, fulfillment, ativo } → cria/edita.
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const FULFILLMENTS = ['identidade', 'treinamento', 'nenhum'];

export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  const db = supabaseAdmin;
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  if (req.method === 'GET') {
    const { data, error } = await db.from('produtos_checkout')
      .select('id, slug, nome, descricao, preco_centavos, fulfillment, ativo, created_at')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, produtos: data || [] });
  }

  if (req.method === 'POST') {
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
    try {
      if (b.id) {
        const { error } = await db.from('produtos_checkout').update(linha).eq('id', b.id);
        if (error) throw error;
      } else {
        const { error } = await db.from('produtos_checkout').upsert([linha], { onConflict: 'slug' });
        if (error) throw error;
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message || 'Erro ao salvar' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

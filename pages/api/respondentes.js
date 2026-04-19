import { getServerUser } from '../../lib/getServerUser';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const VALID_PAPEIS = ['socios', 'colaboradores', 'clientes'];

async function checkAccess(user, projetoId) {
  const db = supabaseAdmin;
  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email').eq('id', projetoId).single(),
  ]);
  if (!projeto) return { ok: false, status: 404, error: 'Projeto não encontrado' };
  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return { ok: false, status: 403, error: 'Acesso negado a este projeto' };
  }
  return { ok: true };
}

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const projeto_id = req.query.projeto_id || req.body?.projeto_id;
  if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });

  const access = await checkAccess(user, projeto_id);
  if (!access.ok) return res.status(access.status).json({ success: false, error: access.error });

  const db = supabaseAdmin;

  try {
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('respondentes')
        .select('*')
        .eq('projeto_id', projeto_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ success: true, respondentes: data || [] });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const items = Array.isArray(body?.items) ? body.items : [body];
      const rows = items
        .filter(r => r.nome && r.email && r.papel)
        .map(r => ({
          projeto_id,
          nome: String(r.nome).trim(),
          email: String(r.email).trim().toLowerCase(),
          papel: r.papel,
          whatsapp: r.whatsapp ? String(r.whatsapp).trim() : null,
        }))
        .filter(r => VALID_PAPEIS.includes(r.papel));

      if (rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhum respondente válido (nome, email e papel obrigatórios)' });
      }

      const { data, error } = await db
        .from('respondentes')
        .upsert(rows, { onConflict: 'projeto_id,email,papel', ignoreDuplicates: false })
        .select('*');
      if (error) throw error;
      return res.status(200).json({ success: true, respondentes: data, inserted: data.length });
    }

    if (req.method === 'PUT') {
      const { id, nome, email, papel, whatsapp, status_convite } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });
      const patch = {};
      if (nome !== undefined) patch.nome = String(nome).trim();
      if (email !== undefined) patch.email = String(email).trim().toLowerCase();
      if (papel !== undefined) {
        if (!VALID_PAPEIS.includes(papel)) return res.status(400).json({ success: false, error: 'papel inválido' });
        patch.papel = papel;
      }
      if (whatsapp !== undefined) patch.whatsapp = whatsapp ? String(whatsapp).trim() : null;
      if (status_convite !== undefined) patch.status_convite = status_convite;

      const { data, error } = await db
        .from('respondentes')
        .update(patch)
        .eq('id', id)
        .eq('projeto_id', projeto_id)
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, respondente: data });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });
      const { error } = await db
        .from('respondentes')
        .delete()
        .eq('id', id)
        .eq('projeto_id', projeto_id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[API respondentes] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

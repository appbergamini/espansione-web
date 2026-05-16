import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID do projeto não informado' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Não autenticado' });
  }

  const db = supabaseAdmin;

  if (req.method === 'GET') {
    try {
      const { data: projeto, error } = await db
        .from('projetos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !projeto) {
        return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
      }

      return res.status(200).json({ success: true, projeto });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await db
        .from('projetos')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      return res.status(200).json({ success: true, message: 'Projeto excluído com sucesso' });
    } catch (err) {
      console.error('[API DELETE projeto]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // FIX.15 — PATCH para alternar tem_evp (e futuras flags do projeto).
  // Whitelist explícita; nada além dos campos abaixo é gravado.
  if (req.method === 'PATCH') {
    try {
      const allowed = ['tem_evp'];
      const update = {};
      for (const k of allowed) {
        if (k in (req.body || {})) update[k] = req.body[k];
      }
      if (Object.keys(update).length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhum campo válido para atualizar' });
      }

      const { data: projeto, error } = await db
        .from('projetos')
        .update(update)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw new Error(error.message);

      return res.status(200).json({ success: true, projeto });
    } catch (err) {
      console.error('[API PATCH projeto]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

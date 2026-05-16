import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getServerUser } from '../../../lib/getServerUser';

const STATUS_VALIDOS = ['pendente', 'priorizado', 'entrevistado', 'descartado'];

async function resolveProfile(userId) {
  if (!userId) return null;
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role, empresa_id')
    .eq('id', userId)
    .single();
  return data || null;
}

async function verificarAcessoRegistro(user, profile, id) {
  const { data: registro } = await supabaseAdmin
    .from('opt_in_entrevistas')
    .select('*, projetos!inner(empresa_id, responsavel_email)')
    .eq('id', id)
    .single();

  if (!registro) return { allowed: false, registro: null };
  if (profile?.role === 'master') return { allowed: true, registro };
  if (profile?.role === 'admin' && profile?.empresa_id === registro.projetos.empresa_id) {
    return { allowed: true, registro };
  }
  if (registro.projetos.responsavel_email === user.email) {
    return { allowed: true, registro };
  }
  return { allowed: false, registro };
}

export default async function handler(req, res) {
  try {
    const { user } = await getServerUser(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const profile = await resolveProfile(user.id);

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const { allowed, registro } = await verificarAcessoRegistro(user, profile, id);
    if (!registro) return res.status(404).json({ error: 'Not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    if (req.method === 'GET') {
      const { projetos, ...data } = registro;
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const { status, notas_internas } = req.body || {};
      const update = {};
      if (status !== undefined) {
        if (!STATUS_VALIDOS.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        update.status = status;
      }
      if (notas_internas !== undefined) update.notas_internas = notas_internas;
      if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      const { data, error } = await supabaseAdmin
        .from('opt_in_entrevistas')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('opt_in_entrevistas')
        .delete()
        .eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/opt-in-entrevistas/[id]]', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

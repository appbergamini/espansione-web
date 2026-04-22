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

async function verificarAcessoProjeto(user, profile, projetoId) {
  if (!user || !projetoId) return false;
  if (profile?.role === 'master') return true;
  const { data: projeto } = await supabaseAdmin
    .from('projetos')
    .select('empresa_id, responsavel_email')
    .eq('id', projetoId)
    .single();
  if (!projeto) return false;
  if (profile?.role === 'admin' && profile?.empresa_id === projeto.empresa_id) return true;
  if (projeto.responsavel_email && projeto.responsavel_email === user.email) return true;
  return false;
}

async function handleList(req, res, user, profile) {
  const { projeto_id, tipo, status } = req.query;
  if (!projeto_id) return res.status(400).json({ error: 'projeto_id is required' });

  if (!(await verificarAcessoProjeto(user, profile, projeto_id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  let query = supabaseAdmin
    .from('opt_in_entrevistas')
    .select('*')
    .eq('projeto_id', projeto_id)
    .order('created_at', { ascending: false });

  if (tipo)   query = query.eq('tipo', tipo);
  if (status) query = query.eq('status', status);

  const { data: items, error } = await query;
  if (error) throw error;

  const { data: todos } = await supabaseAdmin
    .from('opt_in_entrevistas')
    .select('status')
    .eq('projeto_id', projeto_id);

  const counts_by_status = { pendente: 0, priorizado: 0, entrevistado: 0, descartado: 0 };
  (todos || []).forEach(r => {
    if (Object.prototype.hasOwnProperty.call(counts_by_status, r.status)) {
      counts_by_status[r.status]++;
    }
  });

  return res.status(200).json({
    items: items || [],
    total: (items || []).length,
    counts_by_status,
  });
}

async function handleBulkUpdate(req, res, user, profile) {
  const { ids, status } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }
  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data: registros } = await supabaseAdmin
    .from('opt_in_entrevistas')
    .select('id, projeto_id')
    .in('id', ids);

  if (!registros || registros.length !== ids.length) {
    return res.status(404).json({ error: 'Some records not found' });
  }

  const projetosUnicos = [...new Set(registros.map(r => r.projeto_id))];
  for (const projeto_id of projetosUnicos) {
    if (!(await verificarAcessoProjeto(user, profile, projeto_id))) {
      return res.status(403).json({ error: 'Forbidden on one or more records' });
    }
  }

  const { error } = await supabaseAdmin
    .from('opt_in_entrevistas')
    .update({ status })
    .in('id', ids);
  if (error) throw error;

  return res.status(200).json({ success: true, updated: ids.length });
}

export default async function handler(req, res) {
  try {
    const { user } = await getServerUser(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const profile = await resolveProfile(user.id);

    if (req.method === 'GET')   return handleList(req, res, user, profile);
    if (req.method === 'PATCH') return handleBulkUpdate(req, res, user, profile);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/opt-in-entrevistas]', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

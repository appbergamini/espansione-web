import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getServerUser } from '../../../lib/getServerUser';

// Entrevista guiada por IA — Slice 3.
// Status das entrevistas IA de um projeto (uso do painel/consultor).
// GET ?projeto_id= → lista { respondente, papel, status, updated_at } + contagens.

async function resolveProfile(userId) {
  if (!userId) return null;
  const { data } = await supabaseAdmin.from('profiles').select('role, empresa_id').eq('id', userId).single();
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

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { user } = await getServerUser(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const profile = await resolveProfile(user.id);

    const { projeto_id } = req.query;
    if (!projeto_id) return res.status(400).json({ error: 'projeto_id is required' });
    if (!(await verificarAcessoProjeto(user, profile, projeto_id))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('entrevista_sessoes')
      .select('respondente_id, tipo, status, updated_at, respondentes ( nome, papel )')
      .eq('projeto_id', projeto_id)
      .order('updated_at', { ascending: false });
    if (error) throw error;

    const items = (data || []).map((s) => ({
      respondente_id: s.respondente_id,
      nome: s.respondentes?.nome || '—',
      papel: s.respondentes?.papel || null,
      tipo: s.tipo,
      status: s.status,
      updated_at: s.updated_at,
    }));

    const counts = { em_andamento: 0, concluida: 0 };
    items.forEach((i) => { if (counts[i.status] != null) counts[i.status]++; });

    return res.status(200).json({ items, counts, total: items.length });
  } catch (err) {
    console.error('[api/entrevista/sessions]', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

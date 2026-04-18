import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const projeto_id = req.query.projeto_id;
  if (!projeto_id) {
    return res.status(400).json({ success: false, error: 'projeto_id is missing' });
  }

  const db = supabaseAdmin;
  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email').eq('id', projeto_id).single(),
  ]);

  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('cis_participantes')
        .select('*')
        .eq('projeto_id', projeto_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, participantes: data || [] });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (Array.isArray(body)) {
        const rows = body.map(p => ({
          projeto_id,
          nome: p.nome,
          email: p.email,
          cargo: p.cargo || '',
        }));
        const { data, error } = await db.from('cis_participantes').insert(rows).select('*');
        if (error) {
          if (error.code === '23505') return res.status(409).json({ success: false, error: 'Um ou mais e-mails já estão cadastrados neste projeto.' });
          throw error;
        }
        return res.status(200).json({ success: true, participantes: data });
      }
      const { nome, email, cargo } = body;
      const { data, error } = await db
        .from('cis_participantes')
        .insert([{ projeto_id, nome, email, cargo }])
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, participante: data });
    }

    if (req.method === 'PUT') {
      const { id, nome, email, cargo, liberado } = req.body;
      const { data, error } = await db
        .from('cis_participantes')
        .update({ nome, email, cargo, liberado })
        .eq('id', id)
        .eq('projeto_id', projeto_id)
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, participante: data });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      const { error } = await db
        .from('cis_participantes')
        .delete()
        .eq('id', id)
        .eq('projeto_id', projeto_id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[API CIS Participantes] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

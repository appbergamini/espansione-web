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
        .from('email_templates')
        .select('*')
        .eq('projeto_id', projeto_id);
      if (error) throw error;
      return res.status(200).json({ success: true, templates: data || [] });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { papel, assunto, corpo } = req.body;
      if (!VALID_PAPEIS.includes(papel)) return res.status(400).json({ success: false, error: 'papel inválido' });
      const { data, error } = await db
        .from('email_templates')
        .upsert(
          { projeto_id, papel, assunto: assunto || null, corpo: corpo || null, updated_at: new Date().toISOString() },
          { onConflict: 'projeto_id,papel' }
        )
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, template: data });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[API email-templates] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

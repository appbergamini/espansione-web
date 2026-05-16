import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user } = await getServerUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const db = supabaseAdmin;

    const { data: profile } = await db
      .from('profiles')
      .select('empresa_id, role, nome_completo')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(403).json({ success: false, error: 'Perfil não encontrado' });
    }

    const isMaster = profile.role === 'master';

    const userEmail = user.email;

    let query;
    if (isMaster) {
      // Master vê todos os projetos com nome da empresa
      query = db
        .from('projetos')
        .select('*, empresas(nome)')
        .order('created_at', { ascending: false });
    } else {
      // Não-master vê apenas projetos onde é o responsável
      query = db
        .from('projetos')
        .select('*, empresas(nome)')
        .eq('responsavel_email', userEmail)
        .order('created_at', { ascending: false });
    }

    const { data: projetos, error } = await query;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      projetos: projetos || [],
      isMaster,
      userRole: profile.role,
    });
  } catch (error) {
    console.error("ERRO fetch projetos:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

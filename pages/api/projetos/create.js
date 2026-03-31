import { db } from '../../../lib/db';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { nome_empresa } = req.body;

    // 1. Obter a sessão e o perfil do usuário logado para saber o empresa_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.empresa_id) {
      return res.status(403).json({ success: false, error: 'Usuário não vinculado a uma empresa' });
    }
    
    // 2. Criar o projeto vinculado ao tenant do usuário
    const projetoId = await db.createProject({
      empresa_id: profile.empresa_id,
      cliente: nome_empresa || "Novo Cliente"
    });

    return res.status(200).json({ success: true, projetoId });
  } catch (err) {
    console.error("[API] Erro ao criar projeto:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

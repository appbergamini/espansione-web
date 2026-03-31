import { db } from '../../../lib/db';
import { createServerClient, serializeCookieHeader } from '@supabase/ssr';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // 1. Criar o cliente do Supabase específico para o Servidor (API Route)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] }));
        },
        setAll(cookiesToSet) {
          res.setHeader('Set-Cookie', cookiesToSet.map(({ name, value, options }) => serializeCookieHeader(name, value, options)));
        },
      },
    }
  );
  
  try {
    const { nome_empresa } = req.body;

    // 2. Tentar obter a sessão no Servidor através dos cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session || sessionError) {
      // Se não houver sessão no cookie, tentamos via Header de Autenticação (Bearer)
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
          return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
        }
        // Se encontramos o usuário via token, procedemos
        return handleCreateWithUser(user, nome_empresa, res);
      }
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    return handleCreateWithUser(session.user, nome_empresa, res);

  } catch (err) {
    console.error("[API] Erro interno:", err);
    return res.status(500).json({ success: false, error: err.message });
  }

  async function handleCreateWithUser(user, nome_empresa, res) {
    // 3. Buscar perfil para encontrar o empresa_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    if (!profile?.empresa_id) {
      return res.status(403).json({ success: false, error: 'Usuário não vinculado a uma empresa' });
    }
    
    // 4. Criar o projeto
    const projetoId = await db.createProject({
      empresa_id: profile.empresa_id,
      cliente: nome_empresa || "Novo Cliente"
    });

    return res.status(200).json({ success: true, projetoId });
  }
}

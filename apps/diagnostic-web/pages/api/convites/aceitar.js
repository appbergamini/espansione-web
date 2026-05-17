import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Configuracao do servidor incompleta.' });
  }

  // 1. Autenticar o usuario via cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
          });
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Nao autenticado.' });
  }

  // 2. Verificar se o profile ja existe
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, empresa_id')
    .eq('id', user.id)
    .single();

  if (existingProfile && existingProfile.empresa_id) {
    return res.status(200).json({ message: 'Profile ja existe.', alreadyExists: true });
  }

  // 3. Buscar convite pendente para este e-mail
  const { data: convite, error: conviteError } = await supabaseAdmin
    .from('convites')
    .select('*')
    .eq('email', user.email)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (conviteError || !convite) {
    return res.status(404).json({ error: 'Nenhum convite pendente encontrado para este e-mail.' });
  }

  // 4. Criar o profile vinculado a empresa do convite
  const nome = user.user_metadata?.full_name || user.email.split('@')[0];

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      nome_completo: nome,
      empresa_id: convite.empresa_id,
      role: convite.role || 'membro',
    }, { onConflict: 'id' });

  if (profileError) {
    return res.status(500).json({ error: `Erro ao criar perfil: ${profileError.message}` });
  }

  // 5. Marcar o convite como aceito
  await supabaseAdmin
    .from('convites')
    .update({ status: 'aceito' })
    .eq('id', convite.id);

  return res.status(200).json({
    message: 'Perfil criado e convite aceito com sucesso.',
    empresa_id: convite.empresa_id,
    role: convite.role,
  });
}

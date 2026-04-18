import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 1. Verificar se o admin client está disponível
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' });
  }

  // 2. Autenticar o usuário que está fazendo a requisição (via cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
          });
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  // 3. Verificar se o usuário é admin
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, empresa_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'Perfil não encontrado.' });
  }

  if (profile.role !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem enviar convites.' });
  }

  // 4. Validar o e-mail do convite
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  // 5. Verificar se já existe um profile com esse e-mail na mesma empresa
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .eq('empresa_id', profile.empresa_id)
    .limit(1);

  if (existingProfile && existingProfile.length > 0) {
    return res.status(409).json({ error: 'Este e-mail já é membro da sua empresa.' });
  }

  // 6. Inserir o convite na tabela (usando admin para ignorar RLS)
  const { data: convite, error: insertError } = await supabaseAdmin
    .from('convites')
    .insert({
      email,
      empresa_id: profile.empresa_id,
      convidado_por: profile.id,
      role: 'membro',
      status: 'pendente',
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return res.status(409).json({ error: 'Já existe um convite pendente para este e-mail.' });
    }
    return res.status(500).json({ error: `Erro ao criar convite: ${insertError.message}` });
  }

  // 7. Enviar o Magic Link via Supabase Auth
  // inviteUserByEmail cria o usuário (se não existir) e envia o link de convite
  const redirectTo = `${req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      invited_by: profile.id,
      empresa_id: profile.empresa_id,
    },
  });

  if (inviteError) {
    // Se o usuário já existe no auth mas não na empresa, usar magic link (OTP) ao invés
    if (inviteError.message?.includes('already been registered') || inviteError.status === 422) {
      const { error: otpError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo },
      });

      if (otpError) {
        // Rollback: remove o convite criado
        await supabaseAdmin.from('convites').delete().eq('id', convite.id);
        return res.status(500).json({ error: `Erro ao enviar magic link: ${otpError.message}` });
      }

      // Para usuários existentes, enviar via signInWithOtp (envia o e-mail)
      const { error: sendError } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (sendError) {
        await supabaseAdmin.from('convites').delete().eq('id', convite.id);
        return res.status(500).json({ error: `Erro ao enviar e-mail: ${sendError.message}` });
      }
    } else {
      // Rollback: remove o convite criado
      await supabaseAdmin.from('convites').delete().eq('id', convite.id);
      return res.status(500).json({ error: `Erro ao enviar convite: ${inviteError.message}` });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Magic Link enviado para ${email}`,
  });
}

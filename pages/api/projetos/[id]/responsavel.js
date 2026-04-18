import crypto from 'crypto';
import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID do projeto não informado' });

  const { user } = await getServerUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const db = supabaseAdmin;

  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'master') {
    return res.status(403).json({ error: 'Apenas o master pode alterar o responsável.' });
  }

  const { nome, email } = req.body;

  // Atualizar o projeto
  const { error: updateErr } = await db
    .from('projetos')
    .update({
      responsavel_nome: nome || null,
      responsavel_email: email || null,
    })
    .eq('id', id);

  if (updateErr) {
    return res.status(500).json({ error: updateErr.message });
  }

  // Se tem email, garantir auth user + profile
  if (email) {
    const { data: projeto } = await db
      .from('projetos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (projeto?.empresa_id) {
      await ensureResponsavel(db, {
        email,
        nome,
        empresaId: projeto.empresa_id,
        convidadoPor: user.id,
      });
    }
  }

  return res.status(200).json({ success: true });
}

async function ensureResponsavel(db, { email, nome, empresaId, convidadoPor }) {
  let authUserId = null;

  const { data: { users } } = await db.auth.admin.listUsers();
  const existingUser = users?.find(u => u.email === email);

  if (existingUser) {
    authUserId = existingUser.id;
  } else {
    const tempPassword = crypto.randomUUID() + '!Aa1';
    const { data: newUser, error: createErr } = await db.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: nome },
    });

    if (createErr) {
      console.error('Erro ao criar auth user:', createErr.message);
      return;
    }
    authUserId = newUser.user.id;
  }

  const { data: existingProfile } = await db
    .from('profiles')
    .select('id')
    .eq('id', authUserId)
    .single();

  if (!existingProfile) {
    await db.from('profiles').insert({
      id: authUserId,
      empresa_id: empresaId,
      nome_completo: nome || email.split('@')[0],
      role: 'admin',
    });
  }

  await db.from('convites').upsert({
    email,
    empresa_id: empresaId,
    convidado_por: convidadoPor,
    role: 'admin',
    status: 'aceito',
  }, { onConflict: 'empresa_id,email' });
}

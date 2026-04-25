import crypto from 'crypto';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { user } = await getServerUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const { nome_empresa, responsavel_nome, responsavel_email, tem_evp } = req.body;
    const db = supabaseAdmin;

    const { data: profile } = await db
      .from('profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.empresa_id) {
      return res.status(403).json({ success: false, error: 'Usuário não vinculado a uma empresa' });
    }

    const empresaId = profile.empresa_id;
    const nome = nome_empresa || 'Novo Cliente';

    // Criar o projeto
    const { data: projeto, error } = await db
      .from('projetos')
      .insert([{
        empresa_id: empresaId,
        nome: nome,
        cliente: nome,
        status: 'planejamento',
        etapa_atual: 0,
        responsavel_nome: responsavel_nome || null,
        responsavel_email: responsavel_email || null,
        // FIX.15 — escopo EVP marcado na criação. UI envia "true"/"on" do checkbox.
        tem_evp: tem_evp === true || tem_evp === 'true' || tem_evp === 'on',
      }])
      .select('id')
      .single();

    if (error) throw error;

    // Se tem responsável, garantir que ele tenha auth user + profile
    if (responsavel_email) {
      await ensureResponsavel(db, {
        email: responsavel_email,
        nome: responsavel_nome,
        empresaId,
        convidadoPor: user.id,
      });
    }

    return res.status(200).json({ success: true, projetoId: projeto.id });
  } catch (err) {
    console.error("[API] Erro interno:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function ensureResponsavel(db, { email, nome, empresaId, convidadoPor }) {
  // 1. Verificar/criar auth user
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

  // 2. Verificar/criar profile
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

  // 3. Criar convite (para registro)
  await db.from('convites').upsert({
    email,
    empresa_id: empresaId,
    convidado_por: convidadoPor,
    role: 'admin',
    status: 'aceito',
  }, { onConflict: 'empresa_id,email' });
}

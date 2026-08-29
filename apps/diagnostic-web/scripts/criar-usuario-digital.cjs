// Cria (ou atualiza) um usuário do time de digital: login por e-mail/senha em
// /login, com papel 'digital' — acesso apenas ao painel /adm/leads.
//
//   node scripts/criar-usuario-digital.cjs digital@espansione.com.br "SenhaForte123"
//
// Lê SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL de .env.local.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
for (const linha of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const [email, senha] = process.argv.slice(2);
if (!email || !senha) {
  console.error('Uso: node scripts/criar-usuario-digital.cjs <email> <senha>');
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  // O usuário pode já existir — nesse caso só redefinimos a senha e o papel.
  const { data: lista } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existente = (lista?.users || []).find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId;
  if (existente) {
    const { error } = await db.auth.admin.updateUserById(existente.id, { password: senha, email_confirm: true });
    if (error) throw error;
    userId = existente.id;
    console.log('Usuário já existia — senha redefinida.');
  } else {
    const { data, error } = await db.auth.admin.createUser({ email, password: senha, email_confirm: true });
    if (error) throw error;
    userId = data.user.id;
    console.log('Usuário criado.');
  }

  const { error: errPerfil } = await db
    .from('profiles')
    .upsert({ id: userId, email, role: 'digital' }, { onConflict: 'id' });
  if (errPerfil) throw errPerfil;

  console.log(`OK — ${email} (role: digital) → https://crescimentointegrado.com.br/adm/leads`);
})().catch((e) => { console.error('Falhou:', e.message || e); process.exit(1); });

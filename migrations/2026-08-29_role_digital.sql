-- Papel 'digital' — time de digital, acesso restrito ao painel de leads (/adm/leads).
-- A checagem de rota fica no código (ROLES_LEADS em lib/api/auth.js); aqui só
-- liberamos o valor na coluna profiles.role, que hoje é limitada por CHECK.
alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles add constraint profiles_role_check
  check (role = any (array['master'::text, 'admin'::text, 'membro'::text, 'digital'::text]));

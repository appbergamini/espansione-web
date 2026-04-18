-- =====================================================================
-- 01_bootstrap.sql
-- Tabelas de tenancy (empresas, profiles), trigger de signup e RLS.
-- Deve rodar ANTES de schema.sql e migration_convites_magiclink.sql.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ── empresas ──────────────────────────────────────────────────────
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ── profiles ──────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome_completo text,
  whatsapp text,
  empresa_id uuid references empresas(id) on delete set null,
  role text not null default 'membro' check (role in ('master', 'admin', 'membro')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_profiles_empresa on profiles(empresa_id);
create index if not exists idx_profiles_email on profiles(email);

-- ── trigger: cria empresa + profile no signup ─────────────────────
-- Lê company_name / full_name / whatsapp de raw_user_meta_data.
-- O primeiro usuário de uma empresa nova vira role='admin'.
-- Se não veio company_name, deixa o trigger de convites cuidar (ou nada).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_empresa_id uuid;
  v_company_name text := new.raw_user_meta_data->>'company_name';
  v_full_name text := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_whatsapp text := new.raw_user_meta_data->>'whatsapp';
begin
  if v_company_name is null or v_company_name = '' then
    return new;
  end if;

  insert into empresas (nome) values (v_company_name) returning id into new_empresa_id;

  insert into profiles (id, email, nome_completo, whatsapp, empresa_id, role)
  values (new.id, new.email, v_full_name, v_whatsapp, new_empresa_id, 'admin')
  on conflict (id) do update set
    email = excluded.email,
    nome_completo = excluded.nome_completo,
    whatsapp = excluded.whatsapp,
    empresa_id = excluded.empresa_id,
    role = 'admin';

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ── RLS: empresas ─────────────────────────────────────────────────
alter table empresas enable row level security;

drop policy if exists "empresas_select_own" on empresas;
create policy "empresas_select_own"
  on empresas for select
  using (
    id in (select empresa_id from profiles where id = auth.uid())
  );

drop policy if exists "empresas_update_admin" on empresas;
create policy "empresas_update_admin"
  on empresas for update
  using (
    id in (select empresa_id from profiles where id = auth.uid() and role in ('admin', 'master'))
  );

-- ── RLS: profiles ─────────────────────────────────────────────────
alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_select_same_empresa" on profiles;
create policy "profiles_select_same_empresa"
  on profiles for select
  using (
    empresa_id in (select empresa_id from profiles where id = auth.uid())
  );

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

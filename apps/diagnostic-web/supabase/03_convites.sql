-- =====================================================================
-- Migration: Sistema de Convites com Magic Link
-- Cria tabela convites, políticas RLS e trigger para auto-criar profile
-- =====================================================================

-- ── 1. Tabela: convites ────────────────────────────────────────────

create table if not exists convites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  convidado_por uuid references profiles(id) on delete set null,
  role text not null default 'membro',
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'expirado')),
  created_at timestamp with time zone default timezone('utc'::text, now()),

  -- Impede convites duplicados para o mesmo e-mail na mesma empresa
  unique (empresa_id, email)
);

-- Índice para busca rápida por e-mail (usado no callback)
create index if not exists idx_convites_email on convites(email);

-- ── 2. RLS: convites ──────────────────────────────────────────────

alter table convites enable row level security;

-- Admin da empresa pode ver os convites da sua empresa
create policy "convites_select_admin"
  on convites for select
  using (
    empresa_id in (
      select p.empresa_id from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin da empresa pode criar convites para a sua empresa
create policy "convites_insert_admin"
  on convites for insert
  with check (
    empresa_id in (
      select p.empresa_id from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin da empresa pode atualizar convites da sua empresa
create policy "convites_update_admin"
  on convites for update
  using (
    empresa_id in (
      select p.empresa_id from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Service role (usado pelo trigger) pode fazer tudo - implícito via SECURITY DEFINER

-- ── 3. RLS: profiles (garantir que membros vejam colegas) ─────────

-- Caso ainda não exista: membros podem ver profiles da mesma empresa
-- (Não recria se já existir — rode manualmente se necessário)
-- create policy "profiles_select_same_empresa"
--   on profiles for select
--   using (
--     empresa_id in (
--       select p.empresa_id from profiles p where p.id = auth.uid()
--     )
--   );

-- ── 4. Função: processar convite após autenticação via Magic Link ──

create or replace function public.handle_invite_on_signup()
returns trigger
language plpgsql
security definer  -- executa com permissões elevadas (ignora RLS)
set search_path = public
as $$
declare
  v_invite_id uuid;
  v_empresa_id uuid;
  v_role text;
begin
  select id, empresa_id, role
    into v_invite_id, v_empresa_id, v_role
  from convites
  where email = new.email
    and status = 'pendente'
  order by created_at desc
  limit 1;

  if v_invite_id is not null then
    insert into profiles (id, email, nome_completo, empresa_id, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      v_empresa_id,
      v_role
    )
    on conflict (id) do update set
      empresa_id = v_empresa_id,
      role = v_role;

    update convites
    set status = 'aceito'
    where id = v_invite_id;
  end if;

  return new;
end;
$$;

-- ── 5. Trigger: dispara ao criar novo usuário no auth.users ───────

-- Remove trigger anterior se existir (para idempotência)
drop trigger if exists on_auth_user_created_invite on auth.users;

-- Cria o trigger
create trigger on_auth_user_created_invite
  after insert on auth.users
  for each row
  execute function public.handle_invite_on_signup();

-- =====================================================================
-- NOTAS DE EXECUÇÃO:
--
-- 1. Este SQL deve ser executado no SQL Editor do Supabase Dashboard
-- 2. Requer que as tabelas 'empresas' e 'profiles' já existam
-- 3. O trigger funciona em conjunto com qualquer trigger existente
--    de registro (ex: handle_new_user) — não conflita
-- 4. Para que a API Route envie magic links, configure a variável
--    SUPABASE_SERVICE_ROLE_KEY no .env.local
-- =====================================================================

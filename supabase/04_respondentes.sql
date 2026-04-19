-- =====================================================================
-- 04_respondentes.sql
-- Tabela de respondentes dos formulários (sócios, colaboradores, clientes).
-- =====================================================================

create table if not exists respondentes (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  nome text not null,
  papel text not null check (papel in ('socios', 'colaboradores', 'clientes')),
  email text not null,
  whatsapp text,
  status_convite text default 'pendente' check (status_convite in ('pendente', 'enviado', 'respondido')),
  convidado_em timestamp with time zone,
  respondido_em timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (projeto_id, email, papel)
);

create index if not exists idx_respondentes_projeto_papel on respondentes(projeto_id, papel);
create index if not exists idx_respondentes_email on respondentes(email);

-- Tabela de templates de email por projeto (opcional: armazenar customização por papel)
create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  papel text not null check (papel in ('socios', 'colaboradores', 'clientes')),
  assunto text,
  corpo text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique (projeto_id, papel)
);

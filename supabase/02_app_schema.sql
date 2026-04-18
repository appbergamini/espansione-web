-- =====================================================================
-- 02_app_schema.sql
-- Tabelas de domínio (projetos, outputs, intake_data, formularios,
-- checkpoints, logs_execucao, cis_assessments, cis_participantes).
-- Roda DEPOIS de 01_bootstrap.sql.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ── projetos ──────────────────────────────────────────────────────
create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text,
  cliente text,
  segmento text,
  porte text,
  momento text,
  objetivo text,
  contato text,
  responsavel_nome text,
  responsavel_email text,
  status text default 'planejamento',
  etapa_atual integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_projetos_empresa on projetos(empresa_id);
create index if not exists idx_projetos_responsavel_email on projetos(responsavel_email);

-- ── outputs ───────────────────────────────────────────────────────
create table if not exists outputs (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  agent_num integer not null,
  conteudo text,
  resumo_executivo text,
  conclusoes text,
  confianca text,
  fontes text,
  gaps text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_outputs_projeto_agent on outputs(projeto_id, agent_num);

-- ── intake_data ───────────────────────────────────────────────────
create table if not exists intake_data (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  campo text not null,
  valor text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ── formularios ───────────────────────────────────────────────────
create table if not exists formularios (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  tipo text not null,
  respondente text,
  respostas_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ── checkpoints ───────────────────────────────────────────────────
create table if not exists checkpoints (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  checkpoint_num integer not null,
  status text default 'pendente',
  notas text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ── logs_execucao ─────────────────────────────────────────────────
create table if not exists logs_execucao (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade,
  agente text,
  tokens_in integer,
  tokens_out integer,
  modelo text,
  status text,
  error_msg text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ── cis_assessments ───────────────────────────────────────────────
create table if not exists cis_assessments (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade,
  email text not null,
  nome text,
  genero text,
  perfil_label text,
  scores_json jsonb not null default '{}'::jsonb,
  raw_rankings_json jsonb not null default '{}'::jsonb,
  learn_prefs_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_cis_email on cis_assessments(email);
create index if not exists idx_cis_projeto_email on cis_assessments(projeto_id, email);

-- ── cis_participantes ─────────────────────────────────────────────
create table if not exists cis_participantes (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  nome text not null,
  email text not null,
  cargo text,
  liberado boolean default true,
  respondido boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (projeto_id, email)
);

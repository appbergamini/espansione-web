-- Habilita extensão pgcrypto para UUIDs
create extension if not exists "pgcrypto";

-- Limpeza (Opcional - só use se for reiniciar o banco do zero)
-- drop table if exists logs_execucao cascade;
-- drop table if exists checkpoints cascade;
-- drop table if exists formularios cascade;
-- drop table if exists intake_data cascade;
-- drop table if exists outputs cascade;
-- drop table if exists projetos cascade;

-- Tabela 1: projetos
create table projetos (
  id uuid primary key default gen_random_uuid(),
  cliente text not null,
  segmento text,
  porte text,
  momento text,
  objetivo text,
  contato text,
  status text default 'intake',
  etapa_atual integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela 2: outputs
create table outputs (
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
-- Índice útil para o cruzamento Output/Projeto
create index idx_outputs_projeto_agent on outputs(projeto_id, agent_num);

-- Tabela 3: intake_data
create table intake_data (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  campo text not null,
  valor text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela 4: formularios
create table formularios (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  tipo text not null,
  respondente text,
  respostas_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela 5: checkpoints
create table checkpoints (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  checkpoint_num integer not null,
  status text default 'pendente',
  notas text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela 6: logs_execucao
create table logs_execucao (
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

-- Tabela 7: cis_assessments
create table cis_assessments (
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

-- Índice útil para buscar avaliações passadas rapidamente
create index idx_cis_email on cis_assessments(email);

-- Tabela 8: cis_participantes
create table cis_participantes (
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

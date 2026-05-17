-- ============================================================
-- BRAND MEMORY — Schema v2
-- Espansione Agency Layer (Phase 2)
-- Postgres 15+ / Supabase compatible
--
-- Applied 2026-05-17 to Supabase project qjmokydtdwisznttipvi.
-- Slate clean: none of the 12 tables existed prior. Idempotent via IF NOT EXISTS.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================================
-- ENUMS
-- ============================================================

do $$ begin
  create type diagnostic_status as enum ('in_progress', 'complete', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_decision as enum ('pending', 'approved', 'rejected', 'revision_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type brief_status as enum ('draft', 'in_progress', 'in_review', 'approved', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_approval as enum ('draft', 'approved', 'archived');
exception when duplicate_object then null; end $$;

-- ============================================================
-- ROOT: BRANDS (tenants)
-- ============================================================

create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- DIAGNOSTIC RUNS
-- One row per execution of the Espansione pipeline.
-- Versioning: every new run for a brand auto-increments version.
-- Human review gate: loader refuses to operate without human_reviewed_at.
-- ============================================================

create table if not exists diagnostic_runs (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  version int not null default 1,
  methodology text default 'ana_couto_decodificando_valor',
  schema_version text not null default '2.0',
  status diagnostic_status not null default 'in_progress',
  espansione_project_id text,
  agent_16_output_id text,            -- link back to outputs table in diagnostic-web
  consolidated_at timestamptz,        -- when Agent 16 finished
  human_reviewed_at timestamptz,      -- GATE: loader requires this to be set
  human_reviewed_by text,             -- who approved
  completed_at timestamptz,           -- when loader finished
  created_at timestamptz not null default now(),
  unique (brand_id, version)
);
create index if not exists diagnostic_runs_brand_idx on diagnostic_runs(brand_id);
create index if not exists diagnostic_runs_active_idx
  on diagnostic_runs(brand_id, completed_at desc)
  where human_reviewed_at is not null;

-- ============================================================
-- BRAND SNAPSHOTS
-- One row per agent per diagnostic_run.
-- The `data` JSONB holds the full export from that agent.
-- This is the canonical store for Brand Memory.
-- ============================================================

create table if not exists brand_snapshots (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  diagnostic_run_id uuid not null references diagnostic_runs(id) on delete cascade,
  agent_id int not null,
  data jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (diagnostic_run_id, agent_id)
);
create index if not exists brand_snapshots_brand_agent_idx
  on brand_snapshots(brand_id, agent_id) where is_active = true;
create index if not exists brand_snapshots_run_idx on brand_snapshots(diagnostic_run_id);
create index if not exists brand_snapshots_data_idx on brand_snapshots using gin (data jsonb_path_ops);

create unique index if not exists brand_snapshots_one_active_per_agent
  on brand_snapshots(brand_id, agent_id) where is_active = true;

-- ============================================================
-- PERSONAS (extracted from agent 12 snapshot for relational queries)
-- ============================================================

create table if not exists personas (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  diagnostic_run_id uuid references diagnostic_runs(id) on delete set null,
  name text not null,
  role_profession text,
  age int,
  is_internal_persona boolean not null default false,
  descritivo text,
  jtbd text,
  full_data jsonb,
  priority int default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists personas_brand_active_idx on personas(brand_id, is_active);

-- ============================================================
-- EDITORIAL PILLARS (derived from agents 9 + 13)
-- ============================================================

create table if not exists editorial_pillars (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  diagnostic_run_id uuid references diagnostic_runs(id) on delete set null,
  name text not null,
  description text,
  source text not null,
  target_persona_id uuid references personas(id) on delete set null,
  weight int default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists editorial_pillars_brand_active_idx
  on editorial_pillars(brand_id, is_active);

-- ============================================================
-- CONTENT EXAMPLES (vector-searchable for RAG)
-- ============================================================

create table if not exists content_examples (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  content_type text not null,
  title text,
  body text not null,
  embedding vector(1536),
  approval_status content_approval not null default 'draft',
  metadata jsonb default '{}'::jsonb,
  published_at timestamptz,
  source_brief_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists content_examples_brand_status_idx
  on content_examples(brand_id, approval_status);
create index if not exists content_examples_embedding_idx
  on content_examples using hnsw (embedding vector_cosine_ops);

-- ============================================================
-- BRAND ASSETS
-- ============================================================

create table if not exists brand_assets (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  asset_type text not null,
  name text not null,
  description text,
  storage_url text not null,
  mime_type text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);
create index if not exists brand_assets_brand_type_idx on brand_assets(brand_id, asset_type);

-- ============================================================
-- CAMPAIGN BRIEFS
-- ============================================================

create table if not exists campaign_briefs (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  title text not null,
  objective text,
  target_persona_id uuid references personas(id) on delete set null,
  pillar_id uuid references editorial_pillars(id) on delete set null,
  channel text,
  deadline timestamptz,
  brief_content jsonb not null default '{}'::jsonb,
  status brief_status not null default 'draft',
  created_by_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campaign_briefs_brand_status_idx
  on campaign_briefs(brand_id, status);

alter table content_examples
  drop constraint if exists content_examples_brief_fk,
  add constraint content_examples_brief_fk
    foreign key (source_brief_id) references campaign_briefs(id) on delete set null;

-- ============================================================
-- CONTENT PERFORMANCE & LEARNINGS
-- ============================================================

create table if not exists content_performance (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  content_example_id uuid references content_examples(id) on delete cascade,
  platform text not null,
  metric_type text not null,
  value numeric,
  captured_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists content_performance_content_idx
  on content_performance(content_example_id);

create table if not exists learnings (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  insight text not null,
  evidence_summary text,
  confidence text default 'medium',
  created_by_agent text,
  applies_to jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AGENT RUNS
-- ============================================================

create table if not exists agent_runs (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  agent_name text not null,
  input jsonb,
  output jsonb,
  status text not null default 'pending',
  error_message text,
  token_usage jsonb,
  duration_ms int,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists agent_runs_brand_agent_idx
  on agent_runs(brand_id, agent_name);

-- ============================================================
-- APPROVAL GATES
-- ============================================================

create table if not exists approvals (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  artifact_type text not null,
  artifact_id uuid not null,
  requested_by_agent text,
  requested_at timestamptz not null default now(),
  decided_by text,
  decided_at timestamptz,
  decision approval_decision not null default 'pending',
  feedback text
);
create index if not exists approvals_artifact_idx on approvals(artifact_type, artifact_id);
create index if not exists approvals_brand_status_idx on approvals(brand_id, decision);

-- ============================================================
-- TRIGGERS: maintain updated_at
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists brands_updated on brands;
create trigger brands_updated before update on brands
  for each row execute function set_updated_at();

drop trigger if exists campaign_briefs_updated on campaign_briefs;
create trigger campaign_briefs_updated before update on campaign_briefs
  for each row execute function set_updated_at();

-- ============================================================
-- HELPER VIEW: active_brand_memory
-- ============================================================

create or replace view active_brand_memory as
select
  b.id as brand_id,
  b.slug,
  b.name,
  b.industry,
  dr.id as diagnostic_run_id,
  dr.version,
  dr.human_reviewed_at,
  jsonb_object_agg(bs.agent_id::text, bs.data) as snapshots
from brands b
join diagnostic_runs dr on dr.brand_id = b.id
  and dr.human_reviewed_at is not null
  and dr.status = 'complete'
join brand_snapshots bs on bs.diagnostic_run_id = dr.id
  and bs.is_active = true
group by b.id, b.slug, b.name, b.industry, dr.id, dr.version, dr.human_reviewed_at;

-- ============================================================
-- ROW LEVEL SECURITY (Supabase pattern — enable when auth is set up)
-- ============================================================

-- create table if not exists brand_members (
--   brand_id uuid references brands(id) on delete cascade,
--   user_id uuid references auth.users(id) on delete cascade,
--   role text default 'member',
--   primary key (brand_id, user_id)
-- );
--
-- alter table brands enable row level security;
-- alter table brand_snapshots enable row level security;
-- alter table personas enable row level security;
-- (... repeat for all brand-scoped tables ...)
--
-- create policy "members read brand" on brands for select
--   using (id in (select brand_id from brand_members where user_id = auth.uid()));

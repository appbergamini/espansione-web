-- ============================================================
-- AGENCY RUNS & STEPS — Phase 2 Sprint 3
-- Postgres 15+ / Supabase compatible
--
-- Stores controlled sequential Agency execution state.
-- No model execution is implied by this migration.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists agency_runs (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references agency_requests(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  brand_kernel_version text,
  status text not null default 'pending' check (status in (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'partial'
  )),
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_runs_request_idx
  on agency_runs(request_id, created_at desc);

create index if not exists agency_runs_brand_status_idx
  on agency_runs(brand_id, status, created_at desc);

create table if not exists agency_steps (
  id uuid primary key default uuid_generate_v4(),
  run_id uuid not null references agency_runs(id) on delete cascade,
  agent_id text not null check (agent_id in (
    'account_director',
    'copywriter',
    'visual_director',
    'editor',
    'approver'
  )),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  status text not null default 'pending' check (status in (
    'pending',
    'running',
    'completed',
    'failed',
    'skipped',
    'regenerated'
  )),
  model_used text,
  tokens jsonb,
  cost_estimate numeric,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_steps_run_agent_idx
  on agency_steps(run_id, agent_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists agency_runs_updated on agency_runs;
create trigger agency_runs_updated before update on agency_runs
  for each row execute function set_updated_at();

drop trigger if exists agency_steps_updated on agency_steps;
create trigger agency_steps_updated before update on agency_steps
  for each row execute function set_updated_at();


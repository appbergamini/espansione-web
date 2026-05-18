-- ============================================================
-- EXPLICIT STATES + BRAND MEMORY VERSIONING
-- Espansione Phase 2 hardening
-- Postgres 15+ / Supabase compatible
--
-- Adds a formal Brand Memory version registry and ties Agency runs to
-- the exact active memory version used to build the BrandKernel.
-- Does not alter the Phase 1 agent execution logic.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROJECT LIFECYCLE STATUS
-- Keep the legacy projetos.status column untouched. This explicit lifecycle
-- field is additive and can be adopted gradually by the admin UI.
-- ============================================================

alter table projetos
  add column if not exists lifecycle_status text not null default 'project_created';

alter table projetos
  drop constraint if exists projetos_lifecycle_status_check;

alter table projetos
  add constraint projetos_lifecycle_status_check
  check (lifecycle_status in (
    'project_created',
    'intake_configured',
    'diagnosis_running',
    'checkpoint_pending',
    'diagnosis_completed',
    'brand_memory_ready_to_load',
    'brand_memory_active',
    'agency_ready',
    'archived'
  ));

create index if not exists projetos_lifecycle_status_idx
  on projetos(lifecycle_status);

-- ============================================================
-- BRAND MEMORY VERSIONS
-- Snapshots remain the canonical slice store. This table is the explicit
-- version registry consumed by Agency runs.
-- ============================================================

create table if not exists brand_memory_versions (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  diagnostic_run_id uuid references diagnostic_runs(id) on delete set null,
  source_output_id text,
  version_number int not null,
  status text not null default 'draft' check (status in (
    'draft',
    'active',
    'archived',
    'invalid'
  )),
  espansione_diagnostic_json jsonb not null,
  change_summary text,
  validation_status text,
  validation_errors jsonb not null default '[]'::jsonb,
  approved_by text,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, version_number)
);

create unique index if not exists brand_memory_versions_one_active_per_brand
  on brand_memory_versions(brand_id)
  where status = 'active';

create index if not exists brand_memory_versions_brand_created_idx
  on brand_memory_versions(brand_id, created_at desc);

create index if not exists brand_memory_versions_diagnostic_run_idx
  on brand_memory_versions(diagnostic_run_id);

-- ============================================================
-- AGENCY REQUEST STATES
-- ============================================================

update agency_requests set status = 'briefing_generated' where status = 'briefing_created';
update agency_requests set status = 'approval_pending' where status = 'generated';

alter table agency_requests
  add column if not exists briefing_original_json jsonb,
  add column if not exists approved_briefing_json jsonb,
  add column if not exists briefing_source text check (briefing_source in ('ai', 'admin_edited')),
  add column if not exists briefing_revision_reason text,
  add column if not exists briefing_generated_at timestamptz,
  add column if not exists briefing_approved_at timestamptz,
  add column if not exists briefing_approved_by text;

alter table agency_requests
  drop constraint if exists agency_requests_status_check;

alter table agency_requests
  add constraint agency_requests_status_check
  check (status in (
    'draft',
    'briefing_pending',
    'briefing_generated',
    'briefing_revision_requested',
    'briefing_approved',
    'generation_pending',
    'generation_running',
    'approval_pending',
    'revision_requested',
    'approved',
    'rejected',
    'archived'
  ));

-- ============================================================
-- AGENCY RUN STATES + MEMORY VERSION REFERENCE
-- ============================================================

update agency_runs set status = 'pending' where status = 'ready';

alter table agency_runs
  add column if not exists brand_memory_version_id uuid references brand_memory_versions(id) on delete restrict,
  add column if not exists brand_kernel_snapshot jsonb;

alter table agency_runs
  drop constraint if exists agency_runs_status_check;

alter table agency_runs
  add constraint agency_runs_status_check
  check (status in (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'partial'
  ));

create index if not exists agency_runs_brand_memory_version_idx
  on agency_runs(brand_memory_version_id);

-- ============================================================
-- AGENCY STEP STATES
-- ============================================================

update agency_steps set status = 'pending' where status = 'ready';

alter table agency_steps
  drop constraint if exists agency_steps_status_check;

alter table agency_steps
  add constraint agency_steps_status_check
  check (status in (
    'pending',
    'running',
    'completed',
    'failed',
    'skipped',
    'regenerated'
  ));

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists brand_memory_versions_updated on brand_memory_versions;
create trigger brand_memory_versions_updated before update on brand_memory_versions
  for each row execute function set_updated_at();

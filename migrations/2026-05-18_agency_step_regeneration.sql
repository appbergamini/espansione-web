-- ============================================================
-- AGENCY PARTIAL REPROCESSING
-- Adds lightweight run branching and step versioning.
-- Historical outputs are preserved; regenerated/invalidated steps are
-- marked non-current instead of being overwritten.
-- ============================================================

alter table agency_runs
  add column if not exists parent_run_id uuid references agency_runs(id) on delete set null,
  add column if not exists branch_label text;

update agency_runs
set branch_label = 'Original'
where branch_label is null;

create index if not exists agency_runs_parent_run_idx
  on agency_runs(parent_run_id, created_at desc);

alter table agency_steps
  add column if not exists parent_step_id uuid references agency_steps(id) on delete set null,
  add column if not exists superseded_by_step_id uuid references agency_steps(id) on delete set null,
  add column if not exists invalidated_by_step_id uuid references agency_steps(id) on delete set null,
  add column if not exists version_number integer not null default 1,
  add column if not exists is_current boolean not null default true;

create index if not exists agency_steps_run_agent_current_idx
  on agency_steps(run_id, agent_id, is_current, version_number desc);

create index if not exists agency_steps_parent_step_idx
  on agency_steps(parent_step_id);

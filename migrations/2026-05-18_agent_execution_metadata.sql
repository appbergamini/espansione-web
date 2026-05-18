-- ============================================================
-- AGENT EXECUTION METADATA
-- Instrumentation layer for Agency steps/runs and Phase 1 logs.
-- This does not change prompts, workers, publishing or permissions.
-- ============================================================

alter table agency_steps
  add column if not exists provider text,
  add column if not exists prompt_version text,
  add column if not exists duration_ms integer,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists execution_metadata jsonb not null default '{}'::jsonb;

alter table agency_runs
  add column if not exists execution_metadata jsonb not null default '{}'::jsonb;

alter table logs_execucao
  add column if not exists execution_metadata jsonb;

alter table outputs
  add column if not exists execution_metadata jsonb;

create index if not exists agency_steps_execution_metadata_idx
  on agency_steps using gin (execution_metadata jsonb_path_ops);

create index if not exists agency_runs_execution_metadata_idx
  on agency_runs using gin (execution_metadata jsonb_path_ops);

create index if not exists outputs_execution_metadata_idx
  on outputs using gin (execution_metadata jsonb_path_ops)
  where execution_metadata is not null;

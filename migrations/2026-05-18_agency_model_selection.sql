-- ============================================================
-- AGENCY MODEL SELECTION / COST MODES
-- Adds execution mode and per-step model metadata for Agency IA.
-- ============================================================

alter table agency_runs
  add column if not exists execution_mode text check (execution_mode in (
    'mock',
    'economical',
    'use_agent_defaults',
    'use_single_model_for_run',
    'override_single_agent'
  )),
  add column if not exists model_selection_json jsonb,
  add column if not exists max_tokens_per_step integer,
  add column if not exists max_estimated_cost_per_run numeric;

alter table agency_steps
  add column if not exists model_id text,
  add column if not exists is_mock boolean not null default false,
  add column if not exists execution_metadata_json jsonb;

create index if not exists agency_runs_execution_mode_idx
  on agency_runs(execution_mode, created_at desc);

create index if not exists agency_steps_model_id_idx
  on agency_steps(model_id, is_mock, created_at desc);


-- ============================================================
-- AGENCY EXECUTION PROFILES
-- Adds configurable execution profile metadata to Agency runs.
-- No worker, publisher, or autonomous orchestration is introduced.
-- ============================================================

alter table agency_runs
  add column if not exists execution_profile_id text,
  add column if not exists execution_plan_json jsonb;

create index if not exists agency_runs_execution_profile_idx
  on agency_runs(execution_profile_id, created_at desc);

create index if not exists agency_runs_execution_plan_idx
  on agency_runs using gin (execution_plan_json jsonb_path_ops);

alter table agency_steps
  drop constraint if exists agency_steps_agent_id_check;

alter table agency_steps
  add constraint agency_steps_agent_id_check
  check (agent_id in (
    'account_director',
    'copywriter',
    'channel_adapter',
    'visual_director',
    'editor',
    'brand_compliance',
    'approver'
  ));

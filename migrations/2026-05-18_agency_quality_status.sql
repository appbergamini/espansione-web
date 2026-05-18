-- ============================================================
-- AGENCY TECHNICAL STATUS VS QUALITY STATUS
-- Separates execution failures from poor or risky outputs.
-- Keeps legacy status columns intact for compatibility.
-- ============================================================

alter table agency_steps
  add column if not exists technical_status text check (technical_status in (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'skipped'
  )),
  add column if not exists quality_assessment jsonb;

alter table outputs
  add column if not exists technical_status text check (technical_status in (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'skipped'
  )),
  add column if not exists quality_assessment jsonb;

update agency_steps
set technical_status = case
  when status in ('pending', 'running', 'completed', 'failed', 'skipped') then status
  when status = 'regenerated' then 'skipped'
  else technical_status
end
where technical_status is null;

create index if not exists agency_steps_technical_status_idx
  on agency_steps(run_id, technical_status);

create index if not exists agency_steps_quality_assessment_idx
  on agency_steps using gin (quality_assessment jsonb_path_ops)
  where quality_assessment is not null;

create index if not exists outputs_quality_assessment_idx
  on outputs using gin (quality_assessment jsonb_path_ops)
  where quality_assessment is not null;

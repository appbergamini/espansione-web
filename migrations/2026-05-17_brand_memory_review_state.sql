-- ============================================================
-- BRAND MEMORY — Review state migration
-- Espansione Agency Layer — Phase 2 review gate
-- Postgres 15+ / Supabase compatible
--
-- Applied 2026-05-17 to Supabase project qjmokydtdwisznttipvi.
-- Depends on: brand_memory_schema_v2.sql (already applied as ad1fec43).
--
-- Adds the human-review-gate infrastructure consumed by:
--   - UI v1.5 at /admin/projetos/[id]/revisao-brand-memory
--   - API endpoints under /api/projetos/[id]/review/*
--   - loadDiagnosticToBrandMemory (refuses without human_reviewed_at)
-- ============================================================

-- ============================================================
-- 1. ALTER diagnostic_runs — add review_state column
-- Text+check (not enum) per spec, for evolution flexibility.
-- ============================================================

alter table diagnostic_runs
  add column if not exists review_state text not null default 'pending'
    check (review_state in ('pending', 'review_in_progress', 'human_approved', 'loaded', 'rejected'));

-- Partial index: only useful for runs awaiting action.
create index if not exists diagnostic_runs_review_state_idx
  on diagnostic_runs(review_state)
  where review_state in ('pending', 'review_in_progress');

-- ============================================================
-- 2. CREATE TABLE diagnostic_run_reviews
-- One row per review session (draft or final).
-- Multiple rows per run allowed: drafts during review_in_progress
-- plus the final 'approved' or 'rejected' row.
--
-- field_edits structure:
--   [{ agent_id: int, field_path: string, original_value: any,
--      edited_value: any, edited_at: timestamptz }]
--
-- agent_rejections structure:
--   [{ agent_id: int, reason: string, rejected_at: timestamptz }]
-- ============================================================

create table if not exists diagnostic_run_reviews (
  id uuid primary key default uuid_generate_v4(),
  diagnostic_run_id uuid not null references diagnostic_runs(id) on delete cascade,
  reviewer_email text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  decision text check (decision in ('approved', 'rejected', 'draft')),
  field_edits jsonb default '[]'::jsonb,
  agent_rejections jsonb default '[]'::jsonb,
  general_note text
);

create index if not exists diagnostic_run_reviews_run_idx
  on diagnostic_run_reviews(diagnostic_run_id);

-- ============================================================
-- 3. Trigger: defense-in-depth check on review_state transitions
-- API layer also enforces this. Trigger is the safety net.
--
-- Rule: review_state can only transition to 'human_approved'
--       if there's at least one diagnostic_run_reviews row with
--       decision='approved' and finished_at IS NOT NULL.
-- ============================================================

create or replace function check_review_approval()
returns trigger as $$
begin
  if new.review_state = 'human_approved' and (old.review_state is null or old.review_state != 'human_approved') then
    if not exists (
      select 1 from diagnostic_run_reviews
      where diagnostic_run_id = new.id
        and decision = 'approved'
        and finished_at is not null
    ) then
      raise exception 'Cannot set diagnostic_runs.review_state to human_approved without a finalized approved review (decision=approved, finished_at not null) in diagnostic_run_reviews. run_id=%', new.id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists diagnostic_runs_review_check on diagnostic_runs;
create trigger diagnostic_runs_review_check
  before update on diagnostic_runs
  for each row execute function check_review_approval();

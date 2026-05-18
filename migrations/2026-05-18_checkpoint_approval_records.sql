-- Structured human checkpoint decisions that travel as context.

create table if not exists checkpoint_approval_records (
  id uuid primary key default gen_random_uuid(),
  checkpoint_id uuid not null references checkpoints(id) on delete cascade,
  project_id uuid not null references projetos(id) on delete cascade,
  agent_id text not null,
  decision text not null,
  structured_notes jsonb not null default '{}'::jsonb,
  freeform_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkpoint_approval_records_decision_check
    check (decision in ('approved', 'approved_with_notes', 'revision_requested', 'rejected'))
);

create index if not exists checkpoint_approval_records_project_created_idx
  on checkpoint_approval_records (project_id, created_at desc);

create index if not exists checkpoint_approval_records_checkpoint_idx
  on checkpoint_approval_records (checkpoint_id);

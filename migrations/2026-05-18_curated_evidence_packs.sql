-- Human/semiautomatic VI/VE/VM evidence curation before Agent 6.

create table if not exists curated_evidence_packs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projetos(id) on delete cascade,
  vi_output_id uuid references outputs(id) on delete set null,
  ve_output_id uuid references outputs(id) on delete set null,
  vm_output_id uuid references outputs(id) on delete set null,
  content_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curated_evidence_packs_status_check
    check (status in ('draft', 'ready_for_agent_6', 'archived'))
);

create index if not exists curated_evidence_packs_project_status_idx
  on curated_evidence_packs (project_id, status, updated_at desc);

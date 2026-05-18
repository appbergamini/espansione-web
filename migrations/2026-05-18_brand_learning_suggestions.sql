-- ============================================================
-- BRAND LEARNING SUGGESTIONS
-- Human-reviewed queue for future Brand Memory incorporation.
-- Approval here does NOT mutate Brand Memory.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists brand_learning_suggestions (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  source_agency_run_id uuid references agency_runs(id) on delete set null,
  source_agency_request_id uuid references agency_requests(id) on delete set null,
  source_library_item_id uuid references brand_library_items(id) on delete set null,
  learning_type text not null check (learning_type in (
    'voice_preference',
    'forbidden_language',
    'approved_cta',
    'rejected_cta',
    'audience_insight',
    'visual_preference',
    'visual_rejection',
    'claim_rule',
    'channel_rule',
    'campaign_learning'
  )),
  content text not null,
  rationale text,
  confidence_score integer check (confidence_score between 0 and 100),
  status text not null default 'suggested' check (status in (
    'suggested',
    'approved_for_memory',
    'rejected',
    'archived'
  )),
  approved_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_learning_suggestions_brand_idx
  on brand_learning_suggestions(brand_id, status, created_at desc);

create index if not exists brand_learning_suggestions_type_idx
  on brand_learning_suggestions(brand_id, learning_type, status);

create index if not exists brand_learning_suggestions_sources_idx
  on brand_learning_suggestions(source_agency_run_id, source_agency_request_id, source_library_item_id);

drop trigger if exists brand_learning_suggestions_updated on brand_learning_suggestions;
create trigger brand_learning_suggestions_updated before update on brand_learning_suggestions
  for each row execute function set_updated_at();

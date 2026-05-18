-- ============================================================
-- BRAND LIBRARY ITEMS
-- Repertoire layer for approved/rejected agency examples.
-- This does not mutate Brand Memory and does not replace agency_steps.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists brand_library_items (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  source_agency_run_id uuid references agency_runs(id) on delete set null,
  source_agency_step_id uuid references agency_steps(id) on delete set null,
  source_agency_request_id uuid references agency_requests(id) on delete set null,
  item_type text not null check (item_type in (
    'approved_copy',
    'rejected_copy',
    'approved_visual_direction',
    'rejected_visual_direction',
    'approved_cta',
    'rejected_cta',
    'visual_prompt',
    'creative_reference',
    'campaign_example',
    'negative_example'
  )),
  status text not null default 'active' check (status in ('active', 'archived')),
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  plain_text text,
  tags jsonb not null default '[]'::jsonb,
  channel text,
  request_type text,
  objective text,
  audience_cluster text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_library_items_brand_idx
  on brand_library_items(brand_id, status, created_at desc);

create index if not exists brand_library_items_filters_idx
  on brand_library_items(brand_id, item_type, channel, objective, request_type);

create index if not exists brand_library_items_source_run_idx
  on brand_library_items(source_agency_run_id);

drop trigger if exists brand_library_items_updated on brand_library_items;
create trigger brand_library_items_updated before update on brand_library_items
  for each row execute function set_updated_at();

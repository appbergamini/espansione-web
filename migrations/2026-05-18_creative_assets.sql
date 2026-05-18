-- ============================================================
-- CREATIVE ASSETS
-- Reviewable visual assets for Agency runs.
-- These assets do not publish automatically and do not mutate Brand Memory.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists creative_assets (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  agency_request_id uuid references agency_requests(id) on delete set null,
  agency_run_id uuid references agency_runs(id) on delete set null,
  source_step_id uuid references agency_steps(id) on delete set null,
  asset_type text not null check (asset_type in (
    'conceptual_image',
    'moodboard_reference',
    'background_image',
    'visual_prompt',
    'editable_art_reference',
    'final_art'
  )),
  status text not null default 'draft' check (status in (
    'draft',
    'generated',
    'approved',
    'rejected',
    'archived'
  )),
  title text not null,
  prompt text,
  negative_prompt text,
  file_url text,
  metadata_json jsonb not null default '{}'::jsonb,
  has_embedded_text boolean not null default false,
  text_review_required boolean not null default false,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creative_assets_text_review_check
    check (has_embedded_text = false or text_review_required = true)
);

create index if not exists creative_assets_brand_idx
  on creative_assets(brand_id, status, created_at desc);

create index if not exists creative_assets_run_idx
  on creative_assets(agency_run_id, status, created_at desc);

create index if not exists creative_assets_request_idx
  on creative_assets(agency_request_id, status, created_at desc);

create index if not exists creative_assets_type_idx
  on creative_assets(brand_id, asset_type, status);

drop trigger if exists creative_assets_updated on creative_assets;
create trigger creative_assets_updated before update on creative_assets
  for each row execute function set_updated_at();

-- ============================================================
-- AGENCY REQUESTS — Phase 2 Sprint 2
-- Postgres 15+ / Supabase compatible
--
-- Adds structured marketing requests for the Agency layer.
-- Does not touch Phase 1 pipeline tables.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists agency_requests (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  request_type text not null check (request_type in (
    'social_post',
    'carousel',
    'short_video_script',
    'email',
    'landing_page_copy'
  )),
  channel text not null check (channel in (
    'linkedin',
    'instagram',
    'whatsapp',
    'email',
    'website',
    'paid_media',
    'other'
  )),
  objective text not null check (objective in (
    'awareness',
    'authority',
    'lead_generation',
    'conversion',
    'launch',
    'relationship',
    'retention'
  )),
  audience_cluster text,
  offer text,
  context text not null,
  desired_cta text,
  restrictions jsonb not null default '[]'::jsonb,
  reference_material jsonb not null default '[]'::jsonb,
  readiness_warnings jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in (
    'draft',
    'briefing_pending',
    'briefing_created',
    'briefing_approved',
    'generation_pending',
    'generated',
    'revision_requested',
    'approved',
    'rejected',
    'archived'
  )),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_requests_brand_status_idx
  on agency_requests(brand_id, status, created_at desc);

create index if not exists agency_requests_created_by_idx
  on agency_requests(created_by);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists agency_requests_updated on agency_requests;
create trigger agency_requests_updated before update on agency_requests
  for each row execute function set_updated_at();


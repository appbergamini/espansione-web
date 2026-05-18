-- ============================================================
-- AGENCY SIGNALS
-- Structured feedback from Agency operations to Brand Memory review.
-- Signals do NOT mutate Brand Memory or BrandKernel automatically.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists agency_signals (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  agency_run_id uuid references agency_runs(id) on delete set null,
  agency_request_id uuid references agency_requests(id) on delete set null,
  source_agent_id text,
  affected_slice text not null check (affected_slice in (
    'decodificacao',
    'plataforma_branding',
    'voice_profile',
    'visual_identity',
    'experiencia',
    'plano_comunicacao',
    'strategic_tensions',
    'executional_readiness',
    'other'
  )),
  signal_type text not null check (signal_type in (
    'missing_information',
    'vague_guideline',
    'contradiction',
    'weak_proof',
    'tone_gap',
    'visual_gap',
    'audience_gap',
    'channel_gap',
    'repeated_manual_edit',
    'performance_learning'
  )),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  title text not null,
  description text not null,
  evidence_json jsonb not null default '[]'::jsonb,
  recommendation text not null,
  status text not null default 'open' check (status in (
    'open',
    'reviewed',
    'converted_to_learning',
    'dismissed',
    'archived'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table brand_learning_suggestions
  add column if not exists source_agency_signal_id uuid references agency_signals(id) on delete set null;

create index if not exists agency_signals_brand_idx
  on agency_signals(brand_id, status, created_at desc);

create index if not exists agency_signals_slice_idx
  on agency_signals(brand_id, affected_slice, status);

create index if not exists agency_signals_type_idx
  on agency_signals(brand_id, signal_type, severity);

create index if not exists agency_signals_sources_idx
  on agency_signals(agency_run_id, agency_request_id, source_agent_id);

create index if not exists brand_learning_suggestions_signal_idx
  on brand_learning_suggestions(source_agency_signal_id)
  where source_agency_signal_id is not null;

drop trigger if exists agency_signals_updated on agency_signals;
create trigger agency_signals_updated before update on agency_signals
  for each row execute function set_updated_at();

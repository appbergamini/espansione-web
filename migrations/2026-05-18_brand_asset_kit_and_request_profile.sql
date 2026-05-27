-- Brand Book / Brand Asset Kit visibility and explicit request profile hints.
-- Brand assets already exist in schema v2; this migration keeps compatibility
-- and only adds a request-level profile preference.

alter table agency_requests
  add column if not exists execution_profile_id text;

alter table agency_requests
  drop constraint if exists agency_requests_execution_profile_id_check;

alter table agency_requests
  add constraint agency_requests_execution_profile_id_check
  check (
    execution_profile_id is null
    or execution_profile_id in (
      'simple_content',
      'channel_adapted_content',
      'visual_content',
      'landing_page_copy',
      'campaign_light',
      'custom'
    )
  );

create index if not exists agency_requests_execution_profile_idx
  on agency_requests(brand_id, execution_profile_id, created_at desc);

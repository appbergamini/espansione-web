alter table agency_requests
  add column if not exists campaign_group_id uuid,
  add column if not exists campaign_title text,
  add column if not exists campaign_wave_label text,
  add column if not exists campaign_item_key text,
  add column if not exists campaign_item_order integer,
  add column if not exists campaign_blueprint_json jsonb not null default '{}'::jsonb;

create index if not exists agency_requests_campaign_group_idx
  on agency_requests(campaign_group_id, campaign_item_order, created_at asc);

create index if not exists agency_requests_campaign_title_idx
  on agency_requests(brand_id, campaign_title, created_at desc);

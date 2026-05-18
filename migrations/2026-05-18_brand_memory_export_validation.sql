-- Incremental validation of upstream <brand_memory_export> blocks.
-- Existing outputs remain readable; new outputs persist validation metadata.

alter table outputs
  add column if not exists brand_memory_export_status text not null default 'not_applicable',
  add column if not exists brand_memory_export_validation_result jsonb,
  add column if not exists brand_memory_export_json jsonb,
  add column if not exists brand_memory_export_validated_at timestamptz;

alter table outputs
  drop constraint if exists outputs_brand_memory_export_status_check;

alter table outputs
  add constraint outputs_brand_memory_export_status_check
  check (
    brand_memory_export_status in (
      'not_applicable',
      'missing',
      'valid',
      'invalid',
      'warning'
    )
  );

create index if not exists outputs_brand_memory_export_status_idx
  on outputs (projeto_id, agent_num, brand_memory_export_status);

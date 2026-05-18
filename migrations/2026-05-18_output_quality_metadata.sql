-- ============================================================
-- OUTPUT QUALITY METADATA
-- Espansione review quality layer
-- Postgres 15+ / Supabase compatible
--
-- Optional metadata for critical diagnostic outputs. Existing outputs keep
-- working with quality_metadata = null.
-- ============================================================

alter table outputs
  add column if not exists quality_metadata jsonb;

create index if not exists outputs_quality_metadata_idx
  on outputs using gin (quality_metadata jsonb_path_ops)
  where quality_metadata is not null;


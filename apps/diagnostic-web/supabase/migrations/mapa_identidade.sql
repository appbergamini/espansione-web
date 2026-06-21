-- =====================================================================
-- Mapa de Identidade Estratégica — schema enxuto (2 tabelas + agregados JSON)
-- =====================================================================
-- Conteúdo dos formulários vive em código (lib/mapa-identidade/*). O banco
-- guarda: a avaliação por projeto (com vínculo opcional ao Mapa de Maturidade)
-- e cada submissão de formulário (respostas JSONB + derivados). Agregados
-- (território, NPS, eNPS, contexto de maturidade) ficam em result_json.

create table if not exists public.identity_assessments (
  id                     uuid primary key default gen_random_uuid(),
  projeto_id             uuid not null references public.projetos(id) on delete cascade,
  maturity_assessment_id uuid references public.mapa_assessments(id) on delete set null,
  token                  text not null unique,
  status                 text not null default 'not_started'
                           check (status in ('not_started','in_progress','waiting_internal_responses','waiting_external_responses','completed','not_applicable')),
  result_json            jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  completed_at           timestamptz
);

create index if not exists idx_identity_assessments_projeto on public.identity_assessments (projeto_id);

create table if not exists public.identity_submissions (
  id                     uuid primary key default gen_random_uuid(),
  identity_assessment_id uuid not null references public.identity_assessments(id) on delete cascade,
  form_type              text not null
                           check (form_type in ('identity_brand_essence_v1','identity_value_territory_v1','identity_internal_mirror_v1','identity_external_mirror_v1')),
  respondent_type        text,
  is_anonymous           boolean not null default false,
  status                 text not null default 'in_progress'
                           check (status in ('in_progress','completed','skipped')),
  answers                jsonb not null default '{}'::jsonb,
  computed               jsonb,
  started_at             timestamptz not null default now(),
  completed_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_identity_submissions_assessment on public.identity_submissions (identity_assessment_id);
create index if not exists idx_identity_submissions_form on public.identity_submissions (identity_assessment_id, form_type);

-- updated_at automático
create or replace function public.identity_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_identity_assessments_touch on public.identity_assessments;
create trigger trg_identity_assessments_touch
  before update on public.identity_assessments
  for each row execute function public.identity_touch_updated_at();

drop trigger if exists trg_identity_submissions_touch on public.identity_submissions;
create trigger trg_identity_submissions_touch
  before update on public.identity_submissions
  for each row execute function public.identity_touch_updated_at();

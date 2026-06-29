-- =====================================================================
-- Mapa de Identidade Estratégica v2 (MVP v1) — schema
-- =====================================================================
-- Recomeço limpo: tabelas NOVAS e isoladas (as antigas identity_assessments
-- / identity_submissions / mapa_assessments seguem vivas até a aposentadoria).
-- Catálogo de perguntas vive em código (lib/identidade-v2/catalog.generated.js).
-- O banco guarda: a avaliação por projeto/produto, os respondentes (1 link por
-- público) e as respostas. Notas, gaps, eNPS/NPS e priorização em result_json.
-- Reusa a função de trigger identity_touch_updated_at() (migration mapa_identidade).

create table if not exists public.id_v2_assessments (
  id           uuid primary key default gen_random_uuid(),
  projeto_id   uuid not null references public.projetos(id) on delete cascade,
  produto      text not null
                 check (produto in ('maturidade_free','identidade_pago')),
  status       text not null default 'not_started'
                 check (status in ('not_started','in_progress','completed')),
  result_json  jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz,
  unique (projeto_id, produto)
);
create index if not exists idx_id_v2_assessments_projeto on public.id_v2_assessments (projeto_id);

create table if not exists public.id_v2_respondents (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.id_v2_assessments(id) on delete cascade,
  publico       text not null
                  check (publico in ('socios','colaboradores','clientes')),
  subperfil     text not null default 'todos'
                  check (subperfil in ('todos','lider','cliente','fornecedor')),
  is_anonymous  boolean not null default false,
  token         text not null unique,
  status        text not null default 'in_progress'
                  check (status in ('in_progress','completed','skipped')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists idx_id_v2_respondents_assessment on public.id_v2_respondents (assessment_id);

create table if not exists public.id_v2_answers (
  id            uuid primary key default gen_random_uuid(),
  respondent_id uuid not null references public.id_v2_respondents(id) on delete cascade,
  question_id   text not null,
  value_num     integer,
  value_text    text,
  value_json    jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (respondent_id, question_id)
);
create index if not exists idx_id_v2_answers_respondent on public.id_v2_answers (respondent_id);
create index if not exists idx_id_v2_answers_question on public.id_v2_answers (question_id);

-- updated_at automático (reusa a função existente)
drop trigger if exists trg_id_v2_assessments_touch on public.id_v2_assessments;
create trigger trg_id_v2_assessments_touch
  before update on public.id_v2_assessments
  for each row execute function public.identity_touch_updated_at();

drop trigger if exists trg_id_v2_respondents_touch on public.id_v2_respondents;
create trigger trg_id_v2_respondents_touch
  before update on public.id_v2_respondents
  for each row execute function public.identity_touch_updated_at();

drop trigger if exists trg_id_v2_answers_touch on public.id_v2_answers;
create trigger trg_id_v2_answers_touch
  before update on public.id_v2_answers
  for each row execute function public.identity_touch_updated_at();

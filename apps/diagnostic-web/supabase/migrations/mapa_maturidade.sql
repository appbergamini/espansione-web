-- =====================================================================
-- Mapa de Maturidade Espansione — schema mínimo
-- =====================================================================
-- Conteúdo do diagnóstico (pilares, perguntas, escala, níveis, trilhas,
-- textos) vive em CÓDIGO (lib/mapa-maturidade/*). O banco guarda apenas o
-- que é por-empresa: a avaliação, as respostas e o resultado consolidado.
--
-- Uma avaliação por projeto, acessada por token (link de convite), no mesmo
-- padrão dos forms/entrevista. O resultado completo (buildResult) é
-- persistido em result_json para render rápido e uso futuro (PDF, IA, dashboard).

create table if not exists public.mapa_assessments (
  id            uuid primary key default gen_random_uuid(),
  projeto_id    uuid not null references public.projetos(id) on delete cascade,
  token         text not null unique,
  status        text not null default 'pendente'
                  check (status in ('pendente', 'em_andamento', 'concluido')),
  started_at    timestamptz,
  completed_at  timestamptz,
  general_score integer,
  general_level text,
  result_json   jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_mapa_assessments_projeto on public.mapa_assessments (projeto_id);

create table if not exists public.mapa_answers (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.mapa_assessments(id) on delete cascade,
  question_code text not null,
  pillar_code   text not null,
  value         smallint not null check (value >= 0 and value <= 3),
  label         text,
  is_deepening  boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (assessment_id, question_code)
);

create index if not exists idx_mapa_answers_assessment on public.mapa_answers (assessment_id);
create index if not exists idx_mapa_answers_pillar on public.mapa_answers (assessment_id, pillar_code);

-- updated_at automático na avaliação
create or replace function public.mapa_assessments_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_mapa_assessments_touch on public.mapa_assessments;
create trigger trg_mapa_assessments_touch
  before update on public.mapa_assessments
  for each row execute function public.mapa_assessments_touch_updated_at();

-- =====================================================================
-- Identidade v2 — correção do modelo de links/respondentes (F4 prep)
-- =====================================================================
-- Aditivo e não-destrutivo. O token do LINK é por PÚBLICO (vive no
-- assessment); cada PESSOA que responde é um respondente (colaboradores e
-- clientes são multi-respondente). Por isso o token do respondente deixa de
-- ser obrigatório (passa a ser um resume token opcional por pessoa).

alter table public.id_v2_assessments add column if not exists socios_token text;
alter table public.id_v2_assessments add column if not exists colaboradores_token text;
alter table public.id_v2_assessments add column if not exists clientes_token text;
create unique index if not exists uq_id_v2_assessments_socios_token on public.id_v2_assessments (socios_token);
create unique index if not exists uq_id_v2_assessments_colaboradores_token on public.id_v2_assessments (colaboradores_token);
create unique index if not exists uq_id_v2_assessments_clientes_token on public.id_v2_assessments (clientes_token);

alter table public.id_v2_respondents alter column token drop not null;
alter table public.id_v2_respondents add column if not exists started_at timestamptz not null default now();

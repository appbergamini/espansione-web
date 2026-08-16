-- ============================================================
-- TESTE DE COMPETÊNCIAS EMPREENDEDORAS
-- Postgres 15+ / Supabase compatible
--
-- Aditiva. Não toca em nenhuma tabela existente (mapa_*, id_v2_*, cis_*).
-- Plano de referência: docs/plano-app-competencias-2026-08-16.md §5.
--
-- VOCABULÁRIO: a palavra "aderência" não aparece aqui de propósito — ela
-- significava três coisas diferentes no material de origem. Ver §2.5:
--   posição na faixa · Índice de Ajuste · Índice de Coerência.
--
-- As 48 faixas NÃO viram tabela: elas vêm do catálogo gerado do Excel, que
-- é o ativo metodológico e a fonte única. O que a sessão grava é a VERSÃO
-- (faixas_versao, delta_versao, catalogo_versao), que é o que permite
-- reproduzir um relatório antigo depois de uma recalibração.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── sessão do teste ─────────────────────────────────────────
create table if not exists comp_assessments (
  id uuid primary key default uuid_generate_v4(),
  projeto_id uuid references projetos(id) on delete set null,
  pagamento_id uuid references pagamentos(id) on delete set null,
  email text,
  token text not null unique,

  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'done')),

  -- 'gratuito' converte para 'pago' sem refazer nada (caminho A do §4):
  -- refazer quebraria a integridade e permitiria calibrar a resposta
  -- depois de ver o resultado.
  origem text not null default 'pago' check (origem in ('gratuito', 'pago')),

  -- randomização reproduzível da ordem das 4 opções dentro de cada bloco
  ordem_seed text not null,

  -- como o corte da ramificação foi decidido. Sem 'por_ancora': as âncoras
  -- verificam declaração contra evidência e não entram no ranking.
  criterio_corte text check (criterio_corte in ('por_score', 'por_escolha')),

  catalogo_versao text not null,
  faixas_versao text not null,
  delta_versao text not null,
  delta_valor int not null,

  iniciado_em timestamptz,
  concluido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comp_assessments_email_idx on comp_assessments (lower(email));
create index if not exists comp_assessments_projeto_idx on comp_assessments (projeto_id);
create index if not exists comp_assessments_status_idx on comp_assessments (status);

-- ── respostas, uma linha por tela ───────────────────────────
create table if not exists comp_answers (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references comp_assessments(id) on delete cascade,

  etapa smallint not null check (etapa in (1, 2, 3)),
  item_id text not null,          -- 'B01'..  |  id do ancorado  |  'EVI-01'..

  -- etapa 1: {"mais":"chave","menos":"chave"}
  -- etapa 2: {"nivel":1..4}
  -- etapa 3: {"valor":0..4}
  payload jsonb not null,

  -- ordem em que as 4 opções foram exibidas. Sem isto não há como medir
  -- viés de posição nem calibrar desejabilidade — que é o ponto que a SPEC
  -- aponta como o mais provável de exigir ajuste.
  ordem_exibida jsonb,

  respondido_em timestamptz not null default now(),
  unique (assessment_id, item_id)
);

create index if not exists comp_answers_assessment_idx on comp_answers (assessment_id, etapa);

-- ── resultado consolidado das 12 ────────────────────────────
create table if not exists comp_scores (
  assessment_id uuid not null references comp_assessments(id) on delete cascade,
  competencia_key text not null,
  capacidade text not null,

  score_bruto int not null,       -- -K .. +K, onde K = aparições por competência
  posicao text not null check (posicao in
    ('mais_forte', 'forte', 'intermediaria', 'fragil', 'mais_fragil')),

  nivel_afirmado smallint check (nivel_afirmado between 1 and 4),
  confianca_nivel text check (confianca_nivel in ('afirmado', 'estimado')),

  primary key (assessment_id, competencia_key)
);

-- ── Mapeamento Comportamental (instrumento 2) ───────────────
-- Respostas cruas + saída do instrumento. Fica na zona porque o caminho
-- self-serve não tem projeto nem participante liberado — esse é o caminho
-- B2B, que segue usando cis_participantes/cis_assessments sem alteração.
create table if not exists comp_comportamental (
  assessment_id uuid primary key references comp_assessments(id) on delete cascade,

  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'done')),

  -- { r1: [[idx,...]x8], p1: ['a'|'b' x6], r2: [...], p2: [...] }
  -- Índices dentro do bloco, não rótulos: reconstrói contra o catálogo do
  -- pacote e sobrevive a mudança de texto do item.
  respostas jsonb not null default '{}'::jsonb,

  -- saída de calcularScores: disc, dA, lead, comp (as 16), profile
  scores_json jsonb,

  iniciado_em timestamptz,
  concluido_em timestamptz,
  created_at timestamptz not null default now()
);

-- ── os 4 pilares, congelados no fechamento ──────────────────
-- Materializados em vez de lidos de cis_assessments na hora de gerar o
-- relatório: congela o resultado e o mantém reproduzível.
create table if not exists comp_pilares (
  assessment_id uuid not null references comp_assessments(id) on delete cascade,
  pilar text not null check (pilar in ('determinacao', 'conexao', 'constancia', 'precisao')),
  natural_score int not null,
  em_contexto int not null,
  primary key (assessment_id, pilar)
);

-- ── posição de cada pilar frente à faixa de cada competência ─
create table if not exists comp_faixa_posicao (
  assessment_id uuid not null references comp_assessments(id) on delete cascade,
  competencia_key text not null,
  pilar text not null,
  posicao text not null check (posicao in ('abaixo', 'dentro', 'acima')),
  distancia int not null,         -- pontos até a borda; 0 quando dentro
  sinalizado boolean not null,    -- distancia > delta
  primary key (assessment_id, competencia_key, pilar)
);

-- ── Índice de Ajuste: % dos 48 checks dentro da faixa ───────
-- Só painel do avaliador. Nunca chega a 100: como os pilares somam 200,
-- estar dentro das 48 é impossível por construção.
create table if not exists comp_indice_ajuste (
  assessment_id uuid primary key references comp_assessments(id) on delete cascade,
  valor int not null check (valor between 0 and 100),
  dentro int not null,
  total int not null,
  leitura text not null,
  calculado_em timestamptz not null default now()
);

-- ── Índice de Coerência: declaração × evidência (4 âncoras) ──
-- Só painel do avaliador. Nunca aparece no relatório do cliente.
create table if not exists comp_indice_coerencia (
  assessment_id uuid primary key references comp_assessments(id) on delete cascade,
  evidencia_media numeric(5,2) not null,
  declaracao_media numeric(5,2) not null,
  valor numeric(5,2) not null,
  leitura text not null check (leitura in ('coerente', 'atencao', 'revisar_na_sessao')),
  calculado_em timestamptz not null default now()
);

-- ── trilha ──────────────────────────────────────────────────
create table if not exists comp_trilha (
  assessment_id uuid not null references comp_assessments(id) on delete cascade,
  ordem smallint not null,
  competencia_key text not null,

  -- 'tecnica'         = todos os pilares dentro: a fragilidade não é comportamental
  -- 'confianca_baixa' = a leitura comportamental explica pouco (regra 5 da SPEC)
  rota text not null check (rota in
    ('regular', 'desenvolver', 'compensar', 'tecnica', 'confianca_baixa')),

  pilar_alvo text,
  conteudo_id text,
  primary key (assessment_id, ordem)
);

-- ── updated_at ──────────────────────────────────────────────
create or replace function comp_touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists comp_assessments_touch on comp_assessments;
create trigger comp_assessments_touch
  before update on comp_assessments
  for each row execute function comp_touch_updated_at();

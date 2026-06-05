-- supabase/11_entrevista_sessoes.sql
-- Migration 11: sessões da entrevista guiada por IA.
-- Persiste o estado da entrevista no servidor (não só no sessionStorage do
-- device): perguntas geradas (cache, evita re-chamar o LLM), progresso e
-- status. Permite retomar em qualquer device e o painel acompanhar quem
-- concluiu.
--
-- ANONIMATO: para colaboradores (entrevista_colaboradores) o CONTEÚDO das
-- respostas NÃO é gravado aqui (progresso_json fica sem respostas), preservando
-- o mesmo anonimato dos formulários. Guarda-se apenas perguntas + status + idx.

create table if not exists entrevista_sessoes (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  respondente_id uuid not null references respondentes(id) on delete cascade,
  tipo text not null check (tipo in ('entrevista_socios', 'entrevista_colaboradores', 'entrevista_cliente')),
  anonimo boolean not null default false,
  source text, -- 'roteiro' | 'fallback'
  perguntas_json jsonb not null default '[]'::jsonb,   -- [{ pergunta, hipotese }]
  progresso_json jsonb not null default '{}'::jsonb,    -- { idx, respostas, followups } (sem respostas se anonimo)
  status text not null default 'em_andamento'
    check (status in ('em_andamento', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (respondente_id)
);

create index if not exists idx_entrevista_sessoes_projeto on entrevista_sessoes(projeto_id);
create index if not exists idx_entrevista_sessoes_status on entrevista_sessoes(projeto_id, status);

-- Trigger updated_at (mesmo padrão das outras tabelas).
create or replace function update_entrevista_sessoes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_entrevista_sessoes_updated_at on entrevista_sessoes;
create trigger trg_entrevista_sessoes_updated_at
  before update on entrevista_sessoes
  for each row execute function update_entrevista_sessoes_updated_at();

-- RLS: acesso real acontece via service role (supabaseAdmin) nas rotas; as
-- policies abaixo seguem o padrão das demais tabelas para dashboards diretos.
alter table entrevista_sessoes enable row level security;

create policy "master_all_entrevista_sessoes" on entrevista_sessoes
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'master')
  );

create policy "admin_empresa_entrevista_sessoes" on entrevista_sessoes
  for all using (
    exists (
      select 1 from projetos p
      join profiles pr on pr.empresa_id = p.empresa_id
      where p.id = entrevista_sessoes.projeto_id
        and pr.id = auth.uid() and pr.role = 'admin'
    )
  );

create policy "user_responsavel_entrevista_sessoes" on entrevista_sessoes
  for all using (
    exists (
      select 1 from projetos p
      join profiles pr on pr.id = auth.uid()
      where p.id = entrevista_sessoes.projeto_id
        and (p.responsavel_email = pr.email or pr.role in ('master', 'admin'))
    )
  );

comment on table entrevista_sessoes is
  'Estado da entrevista guiada por IA (perguntas, progresso, status). Conteúdo de respostas omitido para colaboradores (anonimato).';

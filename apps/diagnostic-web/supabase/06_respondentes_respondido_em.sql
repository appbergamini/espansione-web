-- supabase/06_respondentes_respondido_em.sql
-- Migration 06: rastreamento de status sem rastreamento de conteúdo.
-- Adiciona coluna respondido_em em respondentes para permitir que o
-- painel mostre status "respondido/pendente" mesmo em formulários anônimos
-- (onde _respondente_id não é persistido nas respostas).

alter table respondentes
  add column if not exists respondido_em timestamptz;

create index if not exists idx_respondentes_respondido_em
  on respondentes(projeto_id, respondido_em);

comment on column respondentes.respondido_em is
  'Timestamp do último submit de formulário por este respondente. Preenchido via /api/formularios no submit, independentemente de o conteúdo da resposta estar ou não associado ao respondente (formulários anônimos não persistem _respondente_id na resposta, mas atualizam este campo).';

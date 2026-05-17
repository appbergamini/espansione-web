-- supabase/07_intake_data_unique.sql
-- Migration 07: unique constraint em intake_data(projeto_id, campo)
-- para permitir upsert com onConflict='projeto_id,campo'.
--
-- Contexto: valores agregados derivados (ex.: maturidade_360) precisam
-- ser reescritos idempotentemente a cada submit. Sem a constraint, o
-- upsert do Supabase client não sabe qual linha atualizar.

-- Limpa duplicatas potenciais antes de criar a constraint
-- (mantém a mais recente por (projeto_id, campo))
delete from intake_data a
using intake_data b
where a.projeto_id = b.projeto_id
  and a.campo = b.campo
  and a.created_at < b.created_at;

alter table intake_data
  add constraint intake_data_projeto_campo_unique unique (projeto_id, campo);

comment on constraint intake_data_projeto_campo_unique on intake_data is
  'Permite upsert idempotente por (projeto_id, campo). Usado por hooks que persistem agregados derivados (ex.: maturidade_360 computado no submit de intake_socios).';

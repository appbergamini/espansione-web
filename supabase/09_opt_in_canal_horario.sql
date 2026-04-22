-- supabase/09_opt_in_canal_horario.sql
-- Migration 09: adiciona canal_preferido e horario_preferido em opt_in_entrevistas.
-- Contexto: o opt-in de clientes (intake_clientes v2) captura essas preferências
-- para a agenda de entrevistas. Essas preferências podem também ser úteis
-- para opt-ins de colaboradores em futuras iterações.

alter table opt_in_entrevistas
  add column if not exists canal_preferido text,
  add column if not exists horario_preferido text;

comment on column opt_in_entrevistas.canal_preferido is
  'Canal preferido para contato (WhatsApp, E-mail, Telefone). Capturado em intake_clientes v2 Seção 7.';

comment on column opt_in_entrevistas.horario_preferido is
  'Melhor horário para conversar (manhã/tarde/final de tarde). Capturado em intake_clientes v2 Seção 7.';

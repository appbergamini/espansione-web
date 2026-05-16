-- supabase/08_projetos_tipo_negocio.sql
-- Migration 08: coluna tipo_negocio em projetos.
-- Controla exibição do campo "empresa" no formulário de clientes v2
-- (aparece apenas quando B2B).

alter table projetos
  add column if not exists tipo_negocio text not null default 'B2C'
    check (tipo_negocio in ('B2B', 'B2C', 'B2B2C'));

comment on column projetos.tipo_negocio is
  'Tipo de negócio do projeto: B2B, B2C ou B2B2C. Usado para renderização condicional de campos em formulários (ex.: pergunta de empresa no intake_clientes só aparece em B2B).';

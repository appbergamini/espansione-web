-- =====================================================================
-- Mapa de Identidade FINAL — perfil do assessment (funil | consultoria)
--
-- 27/08/2026. Aditiva e não-destrutiva: coluna nova com default, nenhuma
-- linha existente muda de comportamento.
--
-- POR QUE
-- O catálogo passou a ter um módulo de consultoria (perguntas que a
-- esteira dos 15 agentes lê por nome: identificação nominal, comunicação,
-- ICP e provas). `montarFormulario(publico, { perfil })` decide se ele
-- entra, e o default é 'funil'. Falta o lugar onde essa escolha fica
-- gravada por projeto — é esta coluna.
--
-- Quem compra pelo site continua respondendo 41/33/32. Quem é cliente de
-- consultoria, e cujo assessment for criado pelo /adm, responde 76/34/32.
--
-- DEPOIS DE APLICAR
--   1. hub.js grava perfil ao criar o assessment vindo do /adm
--   2. session.js/finalize.js passam o perfil ao montarFormulario
--   Antes disso a coluna existe e não é lida — aplicar é seguro e inerte.
-- =====================================================================

alter table public.id_v2_assessments
  add column if not exists perfil text not null default 'funil';

alter table public.id_v2_assessments
  drop constraint if exists id_v2_assessments_perfil_check;

alter table public.id_v2_assessments
  add constraint id_v2_assessments_perfil_check
  check (perfil in ('funil', 'consultoria'));

comment on column public.id_v2_assessments.perfil is
  'funil = so o instrumento (41/33/32). consultoria = instrumento + modulo de consultoria, que alimenta a esteira dos 15 agentes. Ver data/identidade/modulo_consultoria.json.';

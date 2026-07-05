-- =====================================================================
-- Identidade FINAL — permite produto='identidade_final' nas id_v2_assessments.
-- O CHECK original só aceitava 'maturidade_free'/'identidade_pago'; o novo
-- instrumento (lib/identidade-final) usa 'identidade_final' para se distinguir
-- do banco de 231 vivo. Tabela vazia, mudança não-destrutiva.
-- =====================================================================
alter table public.id_v2_assessments
  drop constraint if exists id_v2_assessments_produto_check;

alter table public.id_v2_assessments
  add constraint id_v2_assessments_produto_check
  check (produto in ('maturidade_free', 'identidade_pago', 'identidade_final'));

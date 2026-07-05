-- =====================================================================
-- Mapa da Maturidade FINAL — funil híbrido (lead público → projeto).
-- Adota a taxonomia de 4 sistemas × 10. Recomeço limpo: as avaliações
-- antigas (7 pilares) são incompatíveis e são removidas.
-- =====================================================================

-- 1) Lead público: a avaliação pode existir SEM projeto (vira lead);
--    na conversão, o comercial vincula a um projeto (projeto_id preenchido).
alter table public.mapa_assessments
  alter column projeto_id drop not null;

-- 2) Cadastro/captação de lead (nome, empresa, papel, porte, segmento, contato)
--    e respostas não-pontuadas estruturadas (atributos de marca do MM2-MAR-10b).
alter table public.mapa_assessments
  add column if not exists cadastro_json jsonb,
  add column if not exists extras_json jsonb;

-- 3) Busca de lead por contato/empresa (funil comercial).
create index if not exists idx_mapa_assessments_projeto_null
  on public.mapa_assessments (created_at desc)
  where projeto_id is null;

-- 4) Recomeço limpo: remove as 3 avaliações de teste do modelo de 7 pilares
--    (result_json e question_codes incompatíveis com a nova taxonomia).
delete from public.mapa_answers;
delete from public.mapa_assessments;

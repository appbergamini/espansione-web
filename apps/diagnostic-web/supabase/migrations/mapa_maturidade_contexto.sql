-- =====================================================================
-- Mapa de Maturidade — etapa "Contexto da Empresa" (snapshot por medição)
-- =====================================================================
-- O contexto (perfil da empresa, fora do score) é salvo como snapshot por
-- assessment. Cada medição = um assessment = um snapshot próprio, sem
-- sobrescrever o histórico. Guardado em JSONB (snapshot normalizado + cru).

alter table public.mapa_assessments add column if not exists context_json jsonb;

-- =====================================================================
-- Mapa de Identidade — Fase 2: tokens próprios dos Espelhos Interno/Externo
-- =====================================================================
-- Forms 3 e 4 são multi-respondente, com links compartilhados DISTINTOS do
-- token do fundador (que abre Essência/Território). Isso preserva o anonimato
-- do Espelho Interno e evita expor os formulários da liderança.

alter table public.identity_assessments
  add column if not exists internal_token text unique,
  add column if not exists external_token text unique;

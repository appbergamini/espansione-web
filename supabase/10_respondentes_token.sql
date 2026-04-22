-- =====================================================================
-- 10_respondentes_token.sql  (TASK FIX.1)
--
-- Consolida o contrato de token em `respondentes`. A coluna já era
-- referenciada por API (respondentes.js, convites/*), páginas públicas
-- de formulário e emails de convite, mas não existia na migration
-- versionada (04_respondentes.sql). Auditoria pós-Bloco-D pegou a
-- divergência.
--
-- Decisões:
--   * Token server-side (24 bytes → 48 chars hex) gerado na criação.
--   * Imutável ao longo da vida do respondente. Reenvio de convite
--     não troca o token — apenas renova a expiração (preserva respostas
--     parciais).
--   * Expira em 30 dias.
--
-- IMPORTANTE: a extensão pgcrypto deve estar habilitada (01_bootstrap.sql
-- já faz `create extension if not exists pgcrypto`). Repetimos aqui
-- por segurança — não cria duplicata, é idempotente.
-- =====================================================================

create extension if not exists pgcrypto;

-- 1. Colunas nullable primeiro, pra o backfill não bater em NOT NULL.
alter table respondentes
  add column if not exists token text,
  add column if not exists token_expira_em timestamptz;

-- 2. Backfill de linhas existentes — token novo e expiração contando
--    a partir do momento do deploy da migration.
update respondentes
   set token           = encode(gen_random_bytes(24), 'hex'),
       token_expira_em = now() + interval '30 days'
 where token is null;

-- 3. Agora que todos têm valor, NOT NULL.
alter table respondentes
  alter column token set not null,
  alter column token_expira_em set not null;

-- 4. Lookup rápido por token + garantia de unicidade.
create unique index if not exists respondentes_token_unique_idx
  on respondentes (token);

-- 5. Índice para futuras queries de expiração (limpezas / dashboards).
create index if not exists respondentes_token_expira_em_idx
  on respondentes (token_expira_em);

-- 6. Documentação viva no schema.
comment on column respondentes.token
  is 'Token de 48 chars (hex de 24 bytes). Gerado na criação. Imutável ao longo da vida do respondente. Usado em links públicos de formulário (/form/<papel>?t=<token>). Lookup via /api/respondentes/by-token.';
comment on column respondentes.token_expira_em
  is 'Data após a qual o token deixa de ser válido. Padrão: 30 dias a partir da criação. Após expiração, /api/respondentes/by-token retorna 410 Gone; reenvio via enviar-batch renova a expiração automaticamente (mesmo token).';

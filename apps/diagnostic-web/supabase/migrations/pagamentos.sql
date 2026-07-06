-- =====================================================================
-- Pagamentos (checkout InfinitePay) — registro das compras recebidas via webhook.
-- Compra anônima da LP não conhece o projeto; o admin vincula depois (projeto_id).
-- =====================================================================
create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  order_nsu text,
  transaction_nsu text,
  slug text,
  receipt_url text,
  status text not null default 'received',
  valor_centavos integer,
  produto text default 'identidade',
  cliente jsonb,
  raw jsonb,
  projeto_id uuid references public.projetos(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pagamentos_created on public.pagamentos (created_at desc);
create index if not exists idx_pagamentos_order on public.pagamentos (order_nsu);
create index if not exists idx_pagamentos_sem_projeto on public.pagamentos (created_at desc) where projeto_id is null;

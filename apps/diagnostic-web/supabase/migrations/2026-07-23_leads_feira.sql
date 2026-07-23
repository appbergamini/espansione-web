-- Leads capturados na página de feira antes do checkout.
-- O order_nsu conecta o cadastro ao webhook da InfinitePay, sem depender
-- dos dados preenchidos novamente pelo comprador no checkout.
create table if not exists public.leads_feira (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null,
  order_nsu text not null unique,
  checkout_url text,
  status text not null default 'checkout_criado'
    check (status in ('checkout_criado', 'checkout_estatico', 'pago', 'pagamento_nao_confirmado')),
  pagamento_id uuid references public.pagamentos(id) on delete set null,
  checkout_iniciado_em timestamptz not null default now(),
  pago_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_feira_created on public.leads_feira (created_at desc);
create index if not exists idx_leads_feira_status on public.leads_feira (status, created_at desc);

alter table public.leads_feira enable row level security;

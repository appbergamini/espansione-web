-- =====================================================================
-- Catálogo de produtos do checkout (InfinitePay). Preço/nome editáveis no
-- /adm sem deploy. `fulfillment` diz o que a compra libera.
-- =====================================================================
create table if not exists public.produtos_checkout (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text,
  preco_centavos integer not null,
  fulfillment text not null default 'nenhum'
    check (fulfillment in ('identidade', 'treinamento', 'nenhum')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- seed do produto atual (mantém o fluxo funcionando; migra do env var)
insert into public.produtos_checkout (slug, nome, descricao, preco_centavos, fulfillment, ativo)
values ('identidade', 'Mapa de Identidade Estratégica', 'Diagnóstico de triangulação (Sócios × Equipe × Clientes) + relatório.', 149700, 'identidade', true)
on conflict (slug) do nothing;

-- supabase/05_opt_in_entrevistas.sql
-- Migration 05: tabela de opt-in para entrevistas em profundidade
-- Contexto: colaboradores e clientes podem voluntariamente sinalizar
-- disponibilidade para entrevista. Dados ficam desacoplados das respostas
-- dos formulários (que permanecem anônimas no caso de colaboradores).

create table opt_in_entrevistas (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  tipo text not null check (tipo in ('colaborador', 'cliente')),
  nome text not null,
  contato text not null, -- whatsapp ou email
  area text, -- opcional; só preenchido para colaboradores
  tempo_casa text, -- opcional; só preenchido para colaboradores
  consentimento_texto text, -- versão do texto aceito (para trilha LGPD)
  status text not null default 'pendente'
    check (status in ('pendente', 'priorizado', 'entrevistado', 'descartado')),
  notas_internas text, -- campo livre para a consultora
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para consulta por projeto (uso mais comum)
create index idx_opt_in_projeto on opt_in_entrevistas(projeto_id);
create index idx_opt_in_status on opt_in_entrevistas(projeto_id, status);

-- Trigger para atualizar updated_at
create or replace function update_opt_in_entrevistas_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_opt_in_entrevistas_updated_at
  before update on opt_in_entrevistas
  for each row execute function update_opt_in_entrevistas_updated_at();

-- RLS: segue o mesmo padrão das outras tabelas do projeto
alter table opt_in_entrevistas enable row level security;

-- Master vê tudo
create policy "master_all_opt_in" on opt_in_entrevistas
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'master'
    )
  );

-- Admin vê os opt-ins dos projetos da sua empresa
create policy "admin_empresa_opt_in" on opt_in_entrevistas
  for all using (
    exists (
      select 1 from projetos p
      join profiles pr on pr.empresa_id = p.empresa_id
      where p.id = opt_in_entrevistas.projeto_id
        and pr.id = auth.uid()
        and pr.role = 'admin'
    )
  );

-- User vê os opt-ins dos projetos onde é responsável
create policy "user_responsavel_opt_in" on opt_in_entrevistas
  for all using (
    exists (
      select 1 from projetos p
      join profiles pr on pr.id = auth.uid()
      where p.id = opt_in_entrevistas.projeto_id
        and (p.responsavel_email = pr.email or pr.role in ('master', 'admin'))
    )
  );

comment on table opt_in_entrevistas is
  'Voluntários para entrevista em profundidade. Desacoplado de formularios para preservar anonimato das respostas (caso colaboradores) e permitir consentimento explícito.';

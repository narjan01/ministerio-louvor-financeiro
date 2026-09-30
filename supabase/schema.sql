-- ========================================================
-- SCHEMA SUPABASE - PORTAL DO MINISTÉRIO DE LOUVOR
-- ========================================================
--
-- O frontend pode consultar dados públicos, mas somente um usuário
-- autenticado com app_metadata.role = 'admin' pode alterar registros.
-- Configure essa role pelo painel do Supabase ou por uma operação segura
-- usando a service_role key no backend. Nunca exponha a service_role key.

create extension if not exists "uuid-ossp";

create table if not exists public.membros (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  funcao text not null,
  ativo boolean not null default true,
  telefone text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Evita duplicidade de membros quando o seed for executado novamente.
create unique index if not exists membros_nome_unico on public.membros (lower(nome));

create table if not exists public.mensalidades (
  id uuid primary key default uuid_generate_v4(),
  membro_id uuid not null references public.membros(id) on delete cascade,
  mes int not null check (mes between 1 and 12),
  ano int not null default extract(year from now())::int,
  status text not null check (status in ('Pendente', 'Pago', 'Isento')) default 'Pendente',
  valor numeric(10,2) not null default 10.00 check (valor > 0),
  payment_id text,
  data_pagamento timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  unique(membro_id, mes, ano)
);

create table if not exists public.transacoes (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('DESPESA', 'OFERTA')),
  descricao text not null,
  valor numeric(10,2) not null check (valor > 0),
  mes int not null check (mes between 1 and 12),
  ano int not null default extract(year from now())::int,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.eventos (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  data date not null,
  categoria text not null check (categoria in ('Reunião Geral', 'Reunião', 'Ensaio', 'Comunhão', 'Culto', 'Confraternização', 'Escala LouveApp')),
  escalados text[] not null default '{}',
  is_api boolean not null default false,
  origem_id text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create unique index if not exists eventos_origem_id_unico on public.eventos (origem_id);

create table if not exists public.frequencias (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  membro_id uuid not null references public.membros(id) on delete cascade,
  data date not null,
  status text not null check (status in ('Presente', 'Falta', 'Pendente')) default 'Pendente',
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  unique(evento_id, membro_id)
);

create table if not exists public.confra_participantes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  is_convidado boolean not null default false,
  convidado_por text,
  parentesco text,
  setembro_status text not null check (setembro_status in ('Pendente', 'Pago')) default 'Pendente',
  outubro_status text not null check (outubro_status in ('Pendente', 'Pago')) default 'Pendente',
  novembro_status text not null check (novembro_status in ('Pendente', 'Pago')) default 'Pendente',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

insert into public.membros (nome, funcao) values
  ('Narjan Trugilho', 'Líder / Violão'),
  ('Lucas Silva', 'Teclado'),
  ('Matheus Santos', 'Bateria'),
  ('Gabriel Oliveira', 'Baixo'),
  ('Beatriz Costa', 'Voz Principal'),
  ('Camila Ferreira', 'Backing Vocal'),
  ('Daniel Almeida', 'Guitarra'),
  ('Priscila Rocha', 'Voz / Ministração'),
  ('Thiago Martins', 'Técnico de Som')
on conflict do nothing;

alter table public.membros enable row level security;
alter table public.mensalidades enable row level security;
alter table public.transacoes enable row level security;
alter table public.eventos enable row level security;
alter table public.frequencias enable row level security;
alter table public.confra_participantes enable row level security;

-- Policies são recriadas de forma idempotente para permitir novas execuções do schema.
do $$
declare
  tabela text;
begin
  foreach tabela in array array['membros', 'mensalidades', 'transacoes', 'eventos', 'frequencias', 'confra_participantes'] loop
    execute format('drop policy if exists "Acesso leitura publica %s" on public.%I', tabela, tabela);
    execute format('drop policy if exists "Acesso escrita %s" on public.%I', tabela, tabela);
    execute format('drop policy if exists "Acesso administrador %s" on public.%I', tabela, tabela);
  end loop;
end $$;

create policy "Acesso leitura publica membros" on public.membros
  for select to anon, authenticated using (true);
create policy "Acesso administrador membros" on public.membros
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Acesso leitura publica mensalidades" on public.mensalidades
  for select to anon, authenticated using (true);
create policy "Acesso administrador mensalidades" on public.mensalidades
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Acesso leitura publica transacoes" on public.transacoes
  for select to anon, authenticated using (true);
create policy "Acesso administrador transacoes" on public.transacoes
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Acesso leitura publica eventos" on public.eventos
  for select to anon, authenticated using (true);
create policy "Acesso administrador eventos" on public.eventos
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Acesso leitura publica frequencias" on public.frequencias
  for select to anon, authenticated using (true);
create policy "Acesso administrador frequencias" on public.frequencias
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Acesso leitura publica confra" on public.confra_participantes
  for select to anon, authenticated using (true);
create policy "Acesso administrador confra" on public.confra_participantes
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ========================================================
-- SCHEMA DE BANCO DE DADOS SUPABASE
-- MINISTÉRIO DE LOUVOR (INA ESPERANÇA)
-- ========================================================

-- Habilita extensão para UUIDs se necessário
create extension if not exists "uuid-ossp";

-- 1. TABELA DE MEMBROS
create table if not exists public.membros (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  funcao text not null,
  ativo boolean default true,
  telefone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. TABELA DE MENSALIDADES (R$ 10,00 padrão)
create table if not exists public.mensalidades (
  id uuid primary key default uuid_generate_v4(),
  membro_id uuid references public.membros(id) on delete cascade,
  mes int not null check (mes between 1 and 12),
  ano int not null default 2026,
  status text not null check (status in ('Pendente', 'Pago', 'Isento')) default 'Pendente',
  valor numeric(10,2) default 10.00,
  payment_id text,
  data_pagamento timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(membro_id, mes, ano)
);

-- 3. TABELA DE TRANSAÇÕES FINANCEIRAS (DESPESAS E OFERTAS DO MÊS)
create table if not exists public.transacoes (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('DESPESA', 'OFERTA')),
  descricao text not null,
  valor numeric(10,2) not null,
  mes int not null check (mes between 1 and 12),
  ano int not null default 2026,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. TABELA DE EVENTOS / ESCALAS
create table if not exists public.eventos (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  data date not null,
  categoria text not null check (categoria in ('Reunião Geral', 'Reunião', 'Ensaio', 'Comunhão', 'Culto', 'Confraternização', 'Escala LouveApp')),
  escalados text[] default '{}',
  is_api boolean default false,
  origem_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. TABELA DE FREQUÊNCIA / CHAMADA
create table if not exists public.frequencias (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid references public.eventos(id) on delete cascade,
  membro_id uuid references public.membros(id) on delete cascade,
  data date not null,
  status text not null check (status in ('Presente', 'Falta', 'Pendente')) default 'Pendente',
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(evento_id, membro_id)
);

-- 6. TABELA DE CONFRATERNIZAÇÃO (PARCELAS SET, OUT, NOV - R$ 15 CADA)
create table if not exists public.confra_participantes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  is_convidado boolean default false,
  convidado_por text,
  parentesco text,
  setembro_status text not null check (setembro_status in ('Pendente', 'Pago')) default 'Pendente',
  outubro_status text not null check (outubro_status in ('Pendente', 'Pago')) default 'Pendente',
  novembro_status text not null check (novembro_status in ('Pendente', 'Pago')) default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. DADOS INICIAIS (SEED)
insert into public.membros (nome, funcao) values
  ('Narjan Trugilho', 'Líder / Violão'),
  ('Lucas Silva', 'Teclado'),
  ('Matheus Santos', 'Bateria'),
  ('Gabriel Oliveira', 'Baixo'),
  ('Beatriz Costa', 'Voz Principal'),
  ('Camila Ferreira', 'Backing Vocal'),
  ('Daniel Almeida', 'Guitarra')
on conflict do nothing;

-- Habilita Row Level Security (RLS) para proteção
alter table public.membros enable row level security;
alter table public.mensalidades enable row level security;
alter table public.transacoes enable row level security;
alter table public.eventos enable row level security;
alter table public.frequencias enable row level security;
alter table public.confra_participantes enable row level security;

-- Políticas de acesso público para leitura e escrita autenticada/anônima com chave anon
create policy "Acesso leitura publica membros" on public.membros for select using (true);
create policy "Acesso escrita membros" on public.membros for all using (true);

create policy "Acesso leitura publica mensalidades" on public.mensalidades for select using (true);
create policy "Acesso escrita mensalidades" on public.mensalidades for all using (true);

create policy "Acesso leitura publica transacoes" on public.transacoes for select using (true);
create policy "Acesso escrita transacoes" on public.transacoes for all using (true);

create policy "Acesso leitura publica eventos" on public.eventos for select using (true);
create policy "Acesso escrita eventos" on public.eventos for all using (true);

create policy "Acesso leitura publica frequencias" on public.frequencias for select using (true);
create policy "Acesso escrita frequencias" on public.frequencias for all using (true);

create policy "Acesso leitura publica confra" on public.confra_participantes for select using (true);
create policy "Acesso escrita confra" on public.confra_participantes for all using (true);

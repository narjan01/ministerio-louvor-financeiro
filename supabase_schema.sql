-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS DO MINISTÉRIO DE LOUVOR (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase (https://supabase.com/dashboard/project/ocnojaerwfjpozvzwfxo/sql)

-- 1. TABELA DE MEMBROS
CREATE TABLE IF NOT EXISTS public.membros (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    funcao TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE MENSALIDADES
CREATE TABLE IF NOT EXISTS public.mensalidades (
    id TEXT PRIMARY KEY,
    membro_id TEXT REFERENCES public.membros(id) ON DELETE CASCADE,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pendente', 'Pago', 'Isento')),
    valor NUMERIC(10,2) DEFAULT 10.00 NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE TRANSAÇÕES FINANCEIRAS (DESPESAS E OFERTAS)
CREATE TABLE IF NOT EXISTS public.transacoes (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('DESPESA', 'OFERTA')),
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE EVENTOS DA AGENDA
CREATE TABLE IF NOT EXISTS public.eventos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    data DATE NOT NULL,
    data_formatada TEXT NOT NULL,
    mes INTEGER NOT NULL,
    dia INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    escalados TEXT,
    gcal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE FREQUÊNCIA / CHAMADA
CREATE TABLE IF NOT EXISTS public.frequencias (
    id TEXT PRIMARY KEY,
    data_str TEXT NOT NULL,
    membro_id TEXT REFERENCES public.membros(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Presente', 'Falta', 'Pendente')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE CONFRATERNIZAÇÃO
CREATE TABLE IF NOT EXISTS public.confra (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    convidado_por TEXT,
    parentesco TEXT,
    set_status TEXT DEFAULT 'Pendente' CHECK (set_status IN ('Pago', 'Pendente')),
    out_status TEXT DEFAULT 'Pendente' CHECK (out_status IN ('Pago', 'Pendente')),
    nov_status TEXT DEFAULT 'Pendente' CHECK (nov_status IN ('Pago', 'Pendente')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR ROW LEVEL SECURITY (RLS) E PERMISSÕES PÚBLICAS (ANON)
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confra ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Total para a chave Anon/Publishable (App da Liderança)
CREATE POLICY "Permitir leitura membros" ON public.membros FOR SELECT USING (true);
CREATE POLICY "Permitir escrita membros" ON public.membros FOR ALL USING (true);

CREATE POLICY "Permitir leitura mensalidades" ON public.mensalidades FOR SELECT USING (true);
CREATE POLICY "Permitir escrita mensalidades" ON public.mensalidades FOR ALL USING (true);

CREATE POLICY "Permitir leitura transacoes" ON public.transacoes FOR SELECT USING (true);
CREATE POLICY "Permitir escrita transacoes" ON public.transacoes FOR ALL USING (true);

CREATE POLICY "Permitir leitura eventos" ON public.eventos FOR SELECT USING (true);
CREATE POLICY "Permitir escrita eventos" ON public.eventos FOR ALL USING (true);

CREATE POLICY "Permitir leitura frequencias" ON public.frequencias FOR SELECT USING (true);
CREATE POLICY "Permitir escrita frequencias" ON public.frequencias FOR ALL USING (true);

CREATE POLICY "Permitir leitura confra" ON public.confra FOR SELECT USING (true);
CREATE POLICY "Permitir escrita confra" ON public.confra FOR ALL USING (true);

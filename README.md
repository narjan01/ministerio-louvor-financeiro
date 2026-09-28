# 🎵 Portal Louvor - Controle Financeiro & Escalas (INA Esperança)

Sistema moderno e responsivo para gestão financeira, arrecadação mensal via PIX, controle de fundos de confraternização, escalas de ensaios e chamadas de frequência para ministérios de louvor e igrejas.

Desenvolvido para hospedagem gratuita de alta performance no **Cloudflare Pages** com banco de dados relacional **Supabase (PostgreSQL)** e integração com a **API do Mercado Pago** e **LouveApp**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend / Edge Functions**: Cloudflare Pages Functions (`/functions/api/*`)
- **Banco de Dados**: Supabase (PostgreSQL com Row Level Security)
- **Integrações**:
  - API do Mercado Pago (PIX Dinâmico, QRCodes e Verificação)
  - API LouveApp (Sincronização de Escalas do Ministério)
  - Google Calendar (Sincronização 1-clique via Web)
  - WhatsApp (Exportação de relatórios com formatação oficial)

---

## 📁 Estrutura do Repositório

```text
├── functions/                  # Cloudflare Pages Functions (Serverless Edge)
│   └── api/
│       ├── pix/
│       │   ├── create.ts       # Geração de PIX seguro com token secreto
│       │   └── status.ts       # Consulta do status do pagamento
│       └── louveapp/
│           └── escalas.ts      # Proxy seguro para LouveApp API
├── src/
│   ├── components/             # Componentes React modulares
│   │   ├── FinanceiroTab.tsx   # Recibo, métricas, tabela e baixas manuais
│   │   ├── ConfraTab.tsx       # Fundo confraternização e convidados
│   │   ├── AgendaTab.tsx       # Calendário mensal, escalas e chamada
│   │   ├── GitHubTab.tsx       # Painel de deploy e conexão Supabase
│   │   ├── PixModal.tsx        # Modal do QRCode e Copia e Cola
│   │   ├── RelatorioModal.tsx  # Modal de exportação para WhatsApp
│   │   └── AdminModal.tsx      # Autenticação de líderes
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase tipado
│   │   ├── dataStore.ts        # Persistência híbrida (Supabase / Local)
│   │   └── services.ts         # Serviços PIX, LouveApp e formatadores
│   ├── types/                  # Tipagens TypeScript estritas
│   ├── App.tsx                 # Layout principal
│   └── main.tsx
├── supabase/
│   └── schema.sql              # Script SQL com tabelas, RLS e dados iniciais
├── .env.example                # Variáveis de ambiente modelo
└── package.json
```

---

## ⚡ Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/SEU-USUARIO/ministerio-louvor-financeiro.git
cd ministerio-louvor-financeiro
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

---

## 🗄️ Configuração do Banco de Dados no Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** no painel do Supabase.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
4. Vá em **Project Settings &rarr; API** e copie a **Project URL** e a **anon public key**.

---

## ☁️ Deploy no Cloudflare Pages (100% Grátis)

1. Faça login na [Cloudflare](https://dash.cloudflare.com).
2. Vá em **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Selecione o repositório `ministerio-louvor-financeiro`.
4. Defina as configurações de build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Em **Environment variables**, configure:
   - `VITE_SUPABASE_URL`: sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: sua chave anônima do Supabase
   - `MP_ACCESS_TOKEN`: seu token de produção do Mercado Pago (criptografado)
   - `LOUVEAPP_TOKEN`: seu token da API do LouveApp (criptografado)
6. Clique em **Save and Deploy**. Seu portal estará online mundialmente em menos de 1 minuto!

---

## 🔐 Senha Padrão de Administrador

- Senha de acesso administrativo master: `admin123` (ou configurável no Supabase).

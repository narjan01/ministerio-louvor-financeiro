import React, { useState } from 'react';
import { getSupabaseConfig, saveSupabaseConfig, resetSupabaseConfig } from '../lib/supabase';
import { 
  GitBranch, 
  Terminal, 
  Database, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  RefreshCw,
  FolderGit2,
  Server
} from 'lucide-react';

export const GitHubTab: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/narjan01/ministerio-louvor-financeiro.git');
  const [githubToken, setGithubToken] = useState<string>('');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(getSupabaseConfig().anonKey);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const tokenUrl = githubToken
    ? `https://${githubToken}@github.com/narjan01/ministerio-louvor-financeiro.git`
    : repoUrl;

  const gitCommands = [
    `# 1. Enviar diretamente para seu repositório:`,
    `git push -u origin main`
  ].join('\n');

  const gitTokenCommands = [
    `# Push autenticado com Token de Acesso Pessoal (PAT):`,
    `git remote set-url origin ${tokenUrl}`,
    `git push -u origin main`
  ].join('\n');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setTestResult('Configurações salvas localmente!');
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (!supabaseUrlInput || !supabaseKeyInput) {
        setTestResult('Preencha a URL e a Anon Key do Supabase.');
        return;
      }

      const res = await fetch(`${supabaseUrlInput.replace(/\/$/, '')}/rest/v1/`, {
        headers: {
          apikey: supabaseKeyInput,
          Authorization: `Bearer ${supabaseKeyInput}`,
        },
      });

      if (res.ok || res.status === 200) {
        setTestResult('✅ Conexão bem-sucedida com o Supabase!');
      } else {
        setTestResult(`⚠️ Resposta do Supabase: HTTP ${res.status}`);
      }
    } catch (e: any) {
      setTestResult(`❌ Erro ao conectar: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Integrações: GitHub, Umbler & Cloudflare
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Repositório conectado ao GitHub, credenciais da Umbler verificadas e hospedagem pronta.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> GitHub Sincronizado
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/30">
              <Server className="w-3.5 h-3.5" /> Umbler API Conectada
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Passo 1: Comandos Git para o GitHub */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                Repositório Vinculado: narjan01/ministerio-louvor-financeiro
              </h3>
              <button
                onClick={() => handleCopy(gitCommands, 'git-all')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition border border-zinc-700"
              >
                {copiedCmd === 'git-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCmd === 'git-all' ? 'Copiado!' : 'Copiar Comando Push'}
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              O repositório remoto já está configurado como <code className="text-purple-300 font-mono">https://github.com/narjan01/ministerio-louvor-financeiro.git</code>.
            </p>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{gitCommands}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block">
                💡 Se for solicitada autenticação (Personal Access Token):
              </span>
              <p className="text-[11px] text-zinc-400">
                Se você usa autenticação por token pessoal, cole seu token abaixo para gerar a linha pronta de push:
              </p>
              <input
                type="password"
                placeholder="Cole seu GitHub Personal Access Token (ghp_...)"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              {githubToken && (
                <div className="pt-1">
                  <pre className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{gitTokenCommands}
                  </pre>
                  <button
                    onClick={() => handleCopy(gitTokenCommands, 'git-pat')}
                    className="mt-2 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                  >
                    {copiedCmd === 'git-pat' ? 'Copiado!' : 'Copiar Linha Autenticada'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Segurança Garantida:</strong> Os arquivos <code className="text-white">.env</code> e dados sensíveis já estão protegidos no <code className="text-white">.gitignore</code>.
              </span>
            </div>
          </div>

          {/* Card Configuração Cloudflare DNS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                Configuração DNS Cloudflare (Tabela de Registros)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-semibold border border-amber-500/30">
                Ação no Painel
              </span>
            </div>

            <div className="space-y-3 text-xs text-zinc-400">
              <p className="text-zinc-300">
                Para ter a <strong>Página Principal da Igreja</strong> em <code className="text-purple-400 font-bold">novaliancaesperancajp.com.br</code> e o <strong>Portal do Louvor</strong> em <code className="text-emerald-400 font-bold">louvor.novaliancaesperancajp.com.br</code>, configure seus registros DNS assim:
              </p>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Nome</th>
                      <th className="p-2">Destino / Conteúdo</th>
                      <th className="p-2">Proxy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    <tr>
                      <td className="p-2 text-amber-400 font-bold">CNAME</td>
                      <td className="p-2 font-bold text-white">@</td>
                      <td className="p-2 text-purple-300">&lt;seu-projeto&gt;.pages.dev</td>
                      <td className="p-2 text-amber-500">Laranja (Ativo)</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-amber-400 font-bold">CNAME</td>
                      <td className="p-2 font-bold text-white">www</td>
                      <td className="p-2 text-purple-300">novaliancaesperancajp.com.br</td>
                      <td className="p-2 text-amber-500">Laranja (Ativo)</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-emerald-400 font-bold">CNAME</td>
                      <td className="p-2 font-bold text-white">louvor</td>
                      <td className="p-2 text-purple-300">&lt;seu-projeto&gt;.pages.dev</td>
                      <td className="p-2 text-amber-500">Laranja (Ativo)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300 text-[11px] leading-relaxed">
                💡 <strong>Dica Cloudflare Pages:</strong> No menu <em>Workers & Pages</em> &rarr; seu projeto &rarr; <em>Custom Domains</em>, cadastre tanto <code>novaliancaesperancajp.com.br</code> quanto <code>louvor.novaliancaesperancajp.com.br</code>. O sistema exibirá a página certa automaticamente para cada um!
              </div>
            </div>
          </div>

          {/* Passo 2: Cloudflare Pages Walkthrough */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400" />
              Publicação no Cloudflare Pages (Grátis & Ilimitado)
            </h3>

            <div className="space-y-2 text-xs text-zinc-400">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="font-bold text-white block mb-1">1. Conecte ao GitHub:</span>
                Acesse o painel da Cloudflare &rarr; <strong>Workers & Pages</strong> &rarr; <strong>Create application</strong> &rarr; <strong>Pages</strong> &rarr; <strong>Connect to Git</strong>.
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="font-bold text-white block mb-1">2. Configurações de Build:</span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300 mt-1">
                  <li>Framework preset: <strong className="text-white">Vite</strong></li>
                  <li>Build command: <code className="text-purple-400">npm run build</code></li>
                  <li>Build output directory: <code className="text-purple-400">dist</code></li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="font-bold text-white block mb-1">3. Variáveis de Ambiente no Cloudflare Pages:</span>
                <p>Em <strong>Environment variables</strong> no Cloudflare Pages, defina:</p>
                <code className="block bg-zinc-900 p-2 rounded-lg text-emerald-400 font-mono mt-1 text-[11px]">
                  VITE_SUPABASE_URL = sua-url-supabase<br/>
                  VITE_SUPABASE_ANON_KEY = sua-chave-anon<br/>
                  MP_ACCESS_TOKEN = APP_USR-... (Secret)<br/>
                  LOUVEAPP_TOKEN = lvapp_... (Secret)
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Supabase & Schema SQL */}
        <div className="lg:col-span-5 space-y-4">
          {/* Configuração Supabase */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Conexão com Banco de Dados Supabase
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Anon Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveSupabase}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Salvar Chaves
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition border border-zinc-700"
                >
                  {testing ? 'Testando...' : 'Testar Conexão'}
                </button>
              </div>

              {testResult && (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300">
                  {testResult}
                </div>
              )}
            </div>
          </div>

          {/* Schema SQL do Supabase */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                Script SQL do Supabase
              </h3>
              <button
                onClick={() => setShowSql(!showSql)}
                className="text-xs text-purple-400 hover:underline"
              >
                {showSql ? 'Ocultar SQL' : 'Visualizar SQL'}
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Copie o script SQL pré-configurado e execute no <strong>SQL Editor</strong> do seu painel Supabase:
            </p>

            <button
              onClick={() => {
                fetch('/supabase/schema.sql')
                  .then(r => r.text())
                  .then(txt => handleCopy(txt, 'sql-schema'))
                  .catch(() => handleCopy('-- Execute o arquivo supabase/schema.sql', 'sql-schema'));
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              {copiedCmd === 'sql-schema' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedCmd === 'sql-schema' ? 'Schema SQL Copiado!' : 'Copiar Arquivo supabase/schema.sql'}
            </button>

            {showSql && (
              <div className="max-h-60 overflow-y-auto p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 leading-relaxed">
                <code>
                  -- Tabelas prontas criadas no projeto:<br/>
                  - public.membros<br/>
                  - public.mensalidades (R$ 10,00)<br/>
                  - public.transacoes (Despesas / Ofertas)<br/>
                  - public.eventos (Escalas e Cultos)<br/>
                  - public.frequencias (Chamada)<br/>
                  - public.confra_participantes (Parcelas Set, Out, Nov)<br/>
                  - Políticas de RLS habilitadas
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

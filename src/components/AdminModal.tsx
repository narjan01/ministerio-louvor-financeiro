import React, { useState } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import { getSupabase, getSupabaseConfig } from '../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const supabaseConfigured = getSupabaseConfig().isConfigured;

  if (!isOpen) return null;

  const handleEntrar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro('');

    if (!senha.trim()) {
      setErro('Informe a senha.');
      return;
    }

    setLoading(true);
    try {
      const client = getSupabase();

      if (client) {
        if (!email.trim()) {
          setErro('Informe o e-mail do usuário administrador.');
          return;
        }

        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

        if (error || !data.user) {
          setErro(error?.message || 'Não foi possível autenticar.');
          return;
        }

        const isAdmin = data.user.app_metadata?.role === 'admin';
        if (!isAdmin) {
          await client.auth.signOut();
          setErro('Este usuário não possui permissão administrativa.');
          return;
        }

        onSuccess();
        onClose();
        setEmail('');
        setSenha('');
        return;
      }

      // Fallback apenas para o preview local. Nunca é aceito em produção.
      if (import.meta.env.DEV && senha === 'admin123') {
        onSuccess();
        onClose();
        setSenha('');
        return;
      }

      setErro('Configure o Supabase Auth para acessar o modo administrativo.');
    } catch (error: any) {
      setErro(error?.message || 'Erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
          aria-label="Fechar acesso administrativo"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 mb-3 border border-purple-500/20">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Acesso Administrativo</h3>
        <p className="text-xs text-zinc-400 mb-4">
          {supabaseConfigured
            ? 'Entre com um usuário do Supabase Auth que tenha a role admin.'
            : 'O modo local permite apenas uma demonstração; em produção configure o Supabase Auth.'}
        </p>

        <form onSubmit={handleEntrar} className="space-y-3">
          {supabaseConfigured && (
            <div className="text-left">
              <label htmlFor="admin-email" className="text-xs font-medium text-zinc-400 block mb-1">E-mail</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                placeholder="admin@exemplo.com"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setErro(''); }}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div className="text-left">
            <label htmlFor="admin-password" className="text-xs font-medium text-zinc-400 block mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                autoFocus={!supabaseConfigured}
                required
                placeholder="Senha de administrador"
                value={senha}
                onChange={(event) => { setSenha(event.target.value); setErro(''); }}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            {erro && <p className="text-xs text-rose-400 mt-1.5 font-medium">{erro}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition"
          >
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>
      </div>
    </div>
  );
};

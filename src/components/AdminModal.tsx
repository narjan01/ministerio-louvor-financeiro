import React, { useState } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  if (!isOpen) return null;

  const handleEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha compatível com a do Google Apps Script ('admin123')
    if (senha === 'admin123' || senha === 'admin') {
      onSuccess();
      onClose();
      setSenha('');
      setErro(false);
    } else {
      setErro(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 mb-3 border border-purple-500/20">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Acesso Administrativo</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Digite a senha master para liberar baixas manuais e edição.
        </p>

        <form onSubmit={handleEntrar} className="space-y-3">
          <div>
            <input
              type="password"
              autoFocus
              placeholder="Senha de administrador..."
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro(false);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-center text-sm focus:outline-none focus:border-purple-500"
            />
            {erro && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium">Senha incorreta! Dica: admin123</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
          >
            Acessar Painel
          </button>
        </form>
      </div>
    </div>
  );
};

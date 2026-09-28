import React, { useState } from 'react';
import { X, Send, Copy, Check } from 'lucide-react';

interface RelatorioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  conteudo: string;
}

export const RelatorioModal: React.FC<RelatorioModalProps> = ({ isOpen, onClose, title, conteudo }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(conteudo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    handleCopy();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(conteudo)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          📲 {title}
        </h3>

        <div className="mb-4">
          <textarea
            readOnly
            rows={12}
            value={conteudo}
            className="w-full bg-zinc-950 text-zinc-200 text-xs font-mono p-3.5 rounded-xl border border-zinc-800 focus:outline-none resize-none leading-relaxed select-all"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center gap-2 text-sm transition shadow-lg shadow-emerald-950/40"
          >
            <Send className="w-4 h-4" />
            Enviar para WhatsApp
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center justify-center gap-2 text-xs transition border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado para a Área de Transferência!' : 'Apenas Copiar Texto'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition text-center"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

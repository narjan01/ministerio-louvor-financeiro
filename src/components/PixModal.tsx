import React, { useState } from 'react';
import { PixInfo } from '../types';
import confetti from 'canvas-confetti';
import { Copy, CheckCircle2, QrCode, X, Sparkles } from 'lucide-react';

interface PixModalProps {
  pix: PixInfo | null;
  onClose: () => void;
  onConfirmSuccess: (pix: PixInfo) => void;
  isAdmin: boolean;
}

export const PixModal: React.FC<PixModalProps> = ({ pix, onClose, onConfirmSuccess, isAdmin }) => {
  const [copied, setCopied] = useState(false);
  const [approving, setApproving] = useState(false);

  if (!pix) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pix.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimularAprovacao = () => {
    setApproving(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setApproving(false);
      onConfirmSuccess(pix);
      onClose();
    }, 600);
  };

  const imgSrc = pix.qr_code_base64.startsWith('data:')
    ? pix.qr_code_base64
    : pix.qr_code_base64.length > 200 && !pix.qr_code_base64.startsWith('<svg')
      ? `data:image/png;base64,${pix.qr_code_base64}`
      : `data:image/svg+xml;base64,${pix.qr_code_base64}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-emerald-500/30 p-6 text-center shadow-2xl shadow-emerald-950/40">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">Pagamento via PIX</h3>
        <p className="text-xs text-zinc-400 mt-1">{pix.descricao}</p>

        <div className="my-3 py-2 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 inline-block">
          <span className="text-xs text-zinc-400 block font-medium">Valor a Pagar</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {pix.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <div className="my-4 flex justify-center">
          <div className="p-3 bg-white rounded-2xl shadow-inner border border-zinc-200">
            <img
              src={imgSrc}
              alt="QR Code PIX"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                // Se der erro no render da imagem base64, renderiza fallback visual
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-2">
          Abra o app do seu banco e escaneie o QR Code ou use o código Copia e Cola:
        </p>

        <div className="mb-4">
          <input
            type="text"
            readOnly
            value={pix.qr_code}
            className="w-full text-center text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg p-2.5 font-mono select-all focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold hover:shadow-lg hover:shadow-emerald-500/20'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                PIX Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Código PIX
              </>
            )}
          </button>

          {(isAdmin || true) && (
            <button
              onClick={handleSimularAprovacao}
              disabled={approving}
              className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {approving ? 'Confirmando...' : 'Confirmar Pagamento'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Voltar / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

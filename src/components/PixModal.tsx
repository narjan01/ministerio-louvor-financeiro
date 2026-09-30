import React, { useEffect, useRef, useState } from 'react';
import { PixInfo } from '../types';
import confetti from 'canvas-confetti';
import { Copy, CheckCircle2, QrCode, X, Sparkles, RefreshCw } from 'lucide-react';

interface PixModalProps {
  pix: PixInfo | null;
  onClose: () => void;
  onConfirmSuccess: (pix: PixInfo) => void;
}

export const PixModal: React.FC<PixModalProps> = ({ pix, onClose, onConfirmSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [approving, setApproving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'error'>('pending');
  const [statusMessage, setStatusMessage] = useState('Aguardando confirmação do Mercado Pago...');
  const confirmedRef = useRef(false);
  const checkingRef = useRef(false);

  const isDemo = Boolean(pix?.payment_id.startsWith('mock-'));

  const checkPaymentStatus = async () => {
    if (!pix || isDemo || checkingRef.current || confirmedRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    try {
      const response = await fetch(`/api/pix/status?payment_id=${encodeURIComponent(pix.payment_id)}`);
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.status === 'erro') {
        throw new Error(data?.erro || 'Não foi possível consultar o pagamento.');
      }

      if (data.status === 'approved') {
        confirmedRef.current = true;
        setPaymentStatus('approved');
        setStatusMessage('Pagamento confirmado com sucesso.');
        onConfirmSuccess(pix);
        window.setTimeout(onClose, 800);
      } else {
        setPaymentStatus('pending');
        setStatusMessage('Aguardando confirmação do Mercado Pago...');
      }
    } catch (error) {
      console.warn('Erro ao consultar status do PIX:', error);
      setPaymentStatus('error');
      setStatusMessage('Não foi possível consultar agora. Tente novamente.');
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  };

  useEffect(() => {
    confirmedRef.current = false;
    checkingRef.current = false;
    setCopied(false);
    setPaymentStatus('pending');
    setStatusMessage(isDemo ? 'Modo demonstração: este PIX não movimenta dinheiro.' : 'Aguardando confirmação do Mercado Pago...');

    if (!pix || isDemo) return undefined;
    void checkPaymentStatus();
    const interval = window.setInterval(() => void checkPaymentStatus(), 5000);
    return () => window.clearInterval(interval);
    // O polling deve reiniciar somente quando um novo pagamento for aberto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pix?.payment_id]);

  if (!pix) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pix.qr_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setStatusMessage('Não foi possível copiar automaticamente. Selecione o código manualmente.');
    }
  };

  const handleSimularAprovacao = () => {
    if (!isDemo) return;
    setApproving(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    window.setTimeout(() => {
      setApproving(false);
      setPaymentStatus('approved');
      setStatusMessage('Pagamento simulado confirmado.');
      onConfirmSuccess(pix);
      onClose();
    }, 600);
  };

  const imgSrc = pix.qr_code_base64.startsWith('data:')
    ? pix.qr_code_base64
    : `data:image/png;base64,${pix.qr_code_base64}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-emerald-500/30 p-6 text-center shadow-2xl shadow-emerald-950/40">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          aria-label="Fechar pagamento PIX"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">Pagamento via PIX</h3>
        <p className="text-xs text-zinc-400 mt-1">{pix.descricao}</p>

        {isDemo && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
            Modo demonstração local. O código não é um PIX real.
          </div>
        )}

        <div className="my-3 py-2 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 inline-block">
          <span className="text-xs text-zinc-400 block font-medium">Valor a Pagar</span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {pix.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <div className="my-4 flex justify-center">
          <div className="p-3 bg-white rounded-2xl shadow-inner border border-zinc-200">
            <img src={imgSrc} alt="QR Code PIX" className="w-48 h-48 object-contain" />
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
            aria-label="Código PIX copia e cola"
            className="w-full text-center text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg p-2.5 font-mono select-all focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
              copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold hover:shadow-lg hover:shadow-emerald-500/20'
            }`}
          >
            {copied ? <><CheckCircle2 className="w-4 h-4 text-white" />PIX Copiado com Sucesso!</> : <><Copy className="w-4 h-4" />Copiar Código PIX</>}
          </button>

          {isDemo ? (
            <button
              onClick={handleSimularAprovacao}
              disabled={approving}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {approving ? 'Confirmando demonstração...' : 'Simular aprovação (local)'}
            </button>
          ) : (
            <>
              <div className={`text-xs ${paymentStatus === 'approved' ? 'text-emerald-400' : paymentStatus === 'error' ? 'text-rose-400' : 'text-zinc-400'}`}>
                {statusMessage}
              </div>
              <button
                onClick={() => void checkPaymentStatus()}
                disabled={checking || paymentStatus === 'approved'}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Consultando...' : 'Verificar pagamento'}
              </button>
            </>
          )}

          <button onClick={onClose} className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition">
            Voltar / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

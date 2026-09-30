import React, { useState, useEffect } from 'react';
import { FinanceiroTab } from './components/FinanceiroTab';
import { ConfraTab } from './components/ConfraTab';
import { AgendaTab } from './components/AgendaTab';
import { GitHubTab } from './components/GitHubTab';
import { PortalAdminTab } from './components/PortalAdminTab';
import { ChurchLandingPage } from './components/ChurchLandingPage';
import { PixModal } from './components/PixModal';
import { RelatorioModal } from './components/RelatorioModal';
import { AdminModal } from './components/AdminModal';
import { PixInfo } from './types';
import { DataStore } from './lib/dataStore';
import { 
  Music, 
  Receipt, 
  PartyPopper, 
  CalendarDays, 
  GitBranch, 
  Shield, 
  ShieldCheck, 
  ExternalLink,
  Church,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'church' | 'louvor'>('louvor');
  const [activeTab, setActiveTab] = useState<'financeiro' | 'confra' | 'agenda' | 'admin' | 'github'>('financeiro');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPix, setCurrentPix] = useState<PixInfo | null>(null);
  const [relatorioModal, setRelatorioModal] = useState<{ open: boolean; title: string; conteudo: string }>({
    open: false,
    title: '',
    conteudo: '',
  });
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    // Detectar automaticamente se o usuário está acessando pelo domínio raiz (novaliancaesperancajp.com.br ou www)
    const hostname = window.location.hostname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');

    if (viewParam === 'igreja' || viewParam === 'church') {
      setViewMode('church');
    } else if (viewParam === 'louvor') {
      setViewMode('louvor');
    } else if (
      hostname === 'novaliancaesperancajp.com.br' || 
      hostname === 'www.novaliancaesperancajp.com.br'
    ) {
      setViewMode('church');
    } else {
      // Se for louvor.novaliancaesperancajp.com.br ou ambiente de preview/dev
      setViewMode('louvor');
    }
  }, []);

  if (viewMode === 'church') {
    return <ChurchLandingPage onGoToLouvorPortal={() => setViewMode('louvor')} />;
  }

  const handleConfirmPix = (pix: PixInfo) => {
    if (pix.tipo === 'mensal' && pix.membro_id && pix.mes) {
      const mesNum = typeof pix.mes === 'number' ? pix.mes : pix.mes[0];
      DataStore.setStatusMensalidade(pix.membro_id, mesNum, 'Pago');
    } else if (pix.tipo === 'confra' && pix.membro_id) {
      // Baixa na confraternização
      DataStore.updateConfraStatus(pix.membro_id, 'set', 'Pago');
    }
  };

  const openRelatorio = (title: string, conteudo: string) => {
    setRelatorioModal({ open: true, title, conteudo });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-950/50 text-white">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Portal Louvor
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  INA Esperança
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">Controle Financeiro, PIX & Escalas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://novaliancaesperancajp.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Acessar o site principal da igreja (novaliancaesperancajp.com.br)"
            >
              <Church className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Página da Igreja</span>
              <span className="sm:hidden">Igreja</span>
              <ExternalLink className="w-3 h-3 text-purple-400/80 ml-0.5" />
            </a>

            {isAdmin ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Ativo</span>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="text-zinc-500 hover:text-zinc-300 ml-1 text-[11px]"
                  title="Sair do modo Admin"
                >
                  (Sair)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sou Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 border-t border-zinc-800/60 py-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'financeiro'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Recibo Financeiro
            </button>

            <button
              onClick={() => setActiveTab('confra')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'confra'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <PartyPopper className="w-4 h-4" />
              Confraternização
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-950/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Agenda & Escalas
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                  : isAdmin
                  ? 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/30 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Portal Admin
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ml-auto ${
                activeTab === 'github'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 border border-purple-500/20'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              GitHub & Cloudflare
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'financeiro' && (
          <FinanceiroTab
            isAdmin={isAdmin}
            onOpenPix={(pix) => setCurrentPix(pix)}
            onOpenRelatorio={openRelatorio}
          />
        )}

        {activeTab === 'confra' && (
          <ConfraTab
            isAdmin={isAdmin}
            onOpenPix={(pix) => setCurrentPix(pix)}
            onOpenRelatorio={openRelatorio}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab
            isAdmin={isAdmin}
            onOpenRelatorio={openRelatorio}
          />
        )}

        {activeTab === 'admin' && (
          <PortalAdminTab
            isAdmin={isAdmin}
            onRequestLogin={() => setShowAdminModal(true)}
          />
        )}

        {activeTab === 'github' && (
          <GitHubTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <p>Portal do Ministério de Louvor &copy; 2026 — INA Esperança</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Hospedado na Cloudflare com Supabase PostgreSQL e Pagamentos via Mercado Pago
        </p>
      </footer>

      {/* Modais Globais */}
      <PixModal
        pix={currentPix}
        onClose={() => setCurrentPix(null)}
        onConfirmSuccess={handleConfirmPix}
        isAdmin={isAdmin}
      />

      <RelatorioModal
        isOpen={relatorioModal.open}
        onClose={() => setRelatorioModal({ open: false, title: '', conteudo: '' })}
        title={relatorioModal.title}
        conteudo={relatorioModal.conteudo}
      />

      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}

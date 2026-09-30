import React from 'react';
import { 
  Church, 
  Music, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  HeartHandshake, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  Phone,
  Instagram,
  Youtube
} from 'lucide-react';

interface ChurchLandingPageProps {
  onGoToLouvorPortal?: () => void;
}

export const ChurchLandingPage: React.FC<ChurchLandingPageProps> = ({ onGoToLouvorPortal }) => {
  const handlePortalLouvor = () => {
    if (onGoToLouvorPortal) {
      onGoToLouvorPortal();
    } else {
      window.location.href = 'https://louvor.novaliancaesperancajp.com.br';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/80 bg-zinc-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-950/40 text-white">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-tight">
                Igreja Nova Aliança
              </span>
              <span className="text-[11px] font-semibold text-purple-400">
                Esperança — João Pessoa / PB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePortalLouvor}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              <Music className="w-4 h-4" />
              <span>Portal do Louvor</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-zinc-800/60 bg-gradient-to-b from-purple-950/20 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bem-vindo à nossa família de fé</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Uma igreja acolhedora para você e toda a sua família crescerem em Deus.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Igreja Nova Aliança Esperança. Conectando corações através do louvor, comunhão, estudo da Palavra e amor ao próximo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handlePortalLouvor}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-purple-950/50 flex items-center gap-2.5 transition cursor-pointer"
            >
              <Music className="w-4 h-4 text-purple-200" />
              <span>Acessar Portal do Louvor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#cultos"
              className="px-6 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-sm font-bold transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Horários dos Cultos</span>
            </a>
          </div>
        </div>
      </section>

      {/* Programação dos Cultos */}
      <section id="cultos" className="py-16 sm:py-20 border-b border-zinc-800/80 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">
            Venha nos visitar
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Programação Semanal & Cultos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Nossas portas e braços estão abertos para você celebrar a Deus conosco.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card Domingo Manhã */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-purple-500/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Domingo Manhã</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Escola Bíblica & Celebração</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 py-1.5 px-3 rounded-xl border border-amber-500/20 w-fit">
              <Clock className="w-3.5 h-3.5" />
              <span>09:00h às 11:30h</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Momento de aprofundamento bíblico, oração, classes infantis e ministração da Palavra.
            </p>
          </div>

          {/* Card Domingo Noite */}
          <div className="bg-zinc-900/90 border border-purple-500/30 rounded-3xl p-6 space-y-4 relative shadow-lg shadow-purple-950/20">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
              Culto Principal
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Domingo Noite</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Culto da Família & Louvor</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/15 py-1.5 px-3 rounded-xl border border-purple-500/30 w-fit">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>18:30h</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Grande celebração com louvor ao vivo pela banda da igreja, comunhão e mensagem edificante.
            </p>
          </div>

          {/* Card Quarta-feira */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Quarta-feira</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Culto de Oração & Ensino</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 py-1.5 px-3 rounded-xl border border-indigo-500/20 w-fit">
              <Clock className="w-3.5 h-3.5" />
              <span>19:30h</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Noite dedicada à oração intercessória, clamor pelas famílias e estudo expositivo das escrituras.
            </p>
          </div>
        </div>
      </section>

      {/* Destaque Portal do Louvor */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-zinc-900 border border-purple-500/30 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              <Music className="w-3.5 h-3.5" />
              <span>Ministério de Louvor da Igreja</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Área Exclusiva de Músicos & Equipe
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Acesso às escalas de cultos sincronizadas com Google Agenda, recibos de mensalidades, fundo de confraternização e controle de presenças.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handlePortalLouvor}
              className="py-3.5 px-6 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 transition cursor-pointer"
            >
              <Music className="w-4 h-4 text-purple-600" />
              <span>Ir para louvor.novaliancaesperancajp.com.br</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Localização & Contato */}
      <section className="py-12 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Onde Estamos</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Igreja Nova Aliança — Esperança
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              João Pessoa — Paraíba, Brasil.<br/>
              Um ambiente de paz, restauração e adoração para toda a sua família.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Cultos Presenciais & Online</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              Canais Oficiais
            </h4>
            <div className="space-y-3 text-xs text-zinc-400">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-300 font-medium">Domínio Principal:</span>
                <span className="text-purple-400 font-mono">novaliancaesperancajp.com.br</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-300 font-medium">Portal de Louvor:</span>
                <span className="text-emerald-400 font-mono">louvor.novaliancaesperancajp.com.br</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <p>Igreja Nova Aliança Esperança &copy; {new Date().getFullYear()} — João Pessoa / PB</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

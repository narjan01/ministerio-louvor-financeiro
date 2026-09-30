import React, { useState } from 'react';
import { ParticipanteConfra, PixInfo, Membro } from '../types';
import { DataStore } from '../lib/dataStore';
import { formatarRelatorioConfra, gerarPix } from '../lib/services';
import { PartyPopper, UserPlus, Share2, Search, QrCode, Check, X } from 'lucide-react';

interface ConfraTabProps {
  isAdmin: boolean;
  onOpenPix: (pix: PixInfo) => void;
  onOpenRelatorio: (titulo: string, texto: string) => void;
}

export const ConfraTab: React.FC<ConfraTabProps> = ({
  isAdmin,
  onOpenPix,
  onOpenRelatorio,
}) => {
  const [filtro, setFiltro] = useState('');
  const [selectedChecks, setSelectedChecks] = useState<Record<string, { set: boolean; out: boolean; nov: boolean }>>({});
  const [showAddConvidadoModal, setShowAddConvidadoModal] = useState(false);
  const [gerandoPixId, setGerandoPixId] = useState<string | null>(null);
  const [erroPix, setErroPix] = useState('');

  // Form convidado
  const [nomeConvidado, setNomeConvidado] = useState('');
  const [membroResponsavel, setMembroResponsavel] = useState('');
  const [parentesco, setParentesco] = useState('');

  const participantes = DataStore.getConfra();
  const membros = DataStore.getMembros();

  // Calcula total apurado
  let totalApurado = 0;
  participantes.forEach(p => {
    if (p.set === 'Pago') totalApurado += 15;
    if (p.out === 'Pago') totalApurado += 15;
    if (p.nov === 'Pago') totalApurado += 15;
  });

  const participantesFiltrados = participantes.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.convidadoPor && p.convidadoPor.toLowerCase().includes(filtro.toLowerCase()))
  );

  const handleCheckboxToggle = (pId: string, parcela: 'set' | 'out' | 'nov') => {
    setSelectedChecks(prev => {
      const current = prev[pId] || { set: false, out: false, nov: false };
      return {
        ...prev,
        [pId]: {
          ...current,
          [parcela]: !current[parcela],
        },
      };
    });
  };

  const handleIniciarPixConfra = async (p: ParticipanteConfra) => {
    const checks = selectedChecks[p.id] || { set: false, out: false, nov: false };
    const parcelasSelecionadas: ('set' | 'out' | 'nov')[] = [];

    if (checks.set && p.set !== 'Pago') parcelasSelecionadas.push('set');
    if (checks.out && p.out !== 'Pago') parcelasSelecionadas.push('out');
    if (checks.nov && p.nov !== 'Pago') parcelasSelecionadas.push('nov');

    if (parcelasSelecionadas.length === 0) {
      if (p.set !== 'Pago') parcelasSelecionadas.push('set');
      else if (p.out !== 'Pago') parcelasSelecionadas.push('out');
      else if (p.nov !== 'Pago') parcelasSelecionadas.push('nov');
    }

    if (parcelasSelecionadas.length === 0) return;

    setGerandoPixId(p.id);
    setErroPix('');
    try {
      const valor = parcelasSelecionadas.length * 15.00;
      const nomesParcelas = parcelasSelecionadas.map(pr => pr === 'set' ? 'Set' : pr === 'out' ? 'Out' : 'Nov').join(' + ');
      const pix = await gerarPix({
        nome: p.nome,
        valor,
        descricao: `Confraternização (${nomesParcelas}) - ${p.nome}`,
        tipo: 'confra',
        membro_id: p.id,
        parcelas: parcelasSelecionadas,
      });
      onOpenPix(pix);
    } catch (error: any) {
      setErroPix(error?.message || 'Não foi possível gerar o PIX.');
    } finally {
      setGerandoPixId(null);
    }
  };

  const handleSalvarConvidado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeConvidado.trim() || !membroResponsavel.trim() || !parentesco.trim()) return;
    DataStore.addConvidado(nomeConvidado, membroResponsavel, parentesco);
    setNomeConvidado('');
    setMembroResponsavel('');
    setParentesco('');
    setShowAddConvidadoModal(false);
  };

  const handleAdminSalvarManual = (p: ParticipanteConfra, parcela: 'set' | 'out' | 'nov') => {
    const statusAtual = p[parcela];
    const novo = statusAtual === 'Pago' ? 'Pendente' : 'Pago';
    DataStore.updateConfraStatus(p.id, parcela, novo);
    setFiltro(f => f);
  };

  const handleExportarWpp = () => {
    const texto = formatarRelatorioConfra(participantes, totalApurado);
    onOpenRelatorio('Relatório da Confraternização', texto);
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
              <PartyPopper className="w-3.5 h-3.5" /> Fundo de Confraternização
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Investimento: R$ 45,00 por Pessoa
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg">
              Dividido em 3 parcelas facilitadas de R$ 15,00 nos meses de Setembro, Outubro e Novembro.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl shrink-0">
            <span className="text-xs text-zinc-400 font-medium">Total Geral Apurado</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {fmt(totalApurado)}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5">
              {participantes.length ? Math.round((totalApurado / (participantes.length * 45)) * 100) : 0}% da meta estimada
            </span>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar participante ou convidado..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddConvidadoModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Convidado
          </button>

          <button
            onClick={handleExportarWpp}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Exportar WPP
          </button>
        </div>
      </div>

      {erroPix && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          <span>{erroPix}</span>
          <button onClick={() => setErroPix('')} className="text-rose-200 hover:text-white" aria-label="Fechar erro do PIX">×</button>
        </div>
      )}

      {/* Lista de Participantes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="font-bold text-white text-sm">Lista de Participantes ({participantes.length})</div>
          <span className="text-[11px] text-zinc-400">Marque a parcela para gerar o PIX</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/60 text-zinc-400 text-xs font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Participante</th>
                <th className="py-3 px-4 text-center">Set (R$ 15)</th>
                <th className="py-3 px-4 text-center">Out (R$ 15)</th>
                <th className="py-3 px-4 text-center">Nov (R$ 15)</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {participantesFiltrados.map((p) => {
                const checks = selectedChecks[p.id] || { set: false, out: false, nov: false };
                const countPendentes = [
                  checks.set && p.set !== 'Pago',
                  checks.out && p.out !== 'Pago',
                  checks.nov && p.nov !== 'Pago',
                ].filter(Boolean).length;

                const valorCalculadoPix = countPendentes > 0 ? countPendentes * 15 : 15;
                const allQuitado = p.set === 'Pago' && p.out === 'Pago' && p.nov === 'Pago';

                return (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.nome}</div>
                      {p.convidadoPor && (
                        <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-0.5">
                          <span>👤 Convidado por {p.convidadoPor} ({p.parentesco})</span>
                        </div>
                      )}
                    </td>

                    {/* Setembro */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {p.set === 'Pago' ? (
                          <span
                            onClick={() => isAdmin && handleAdminSalvarManual(p, 'set')}
                            className={`px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                            title={isAdmin ? 'Clique para alternar' : 'Pago'}
                          >
                            Pago ✔️
                          </span>
                        ) : (
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checks.set}
                              onChange={() => handleCheckboxToggle(p.id, 'set')}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer"
                            />
                            <span className="text-xs text-zinc-400">R$ 15</span>
                          </label>
                        )}
                      </div>
                    </td>

                    {/* Outubro */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {p.out === 'Pago' ? (
                          <span
                            onClick={() => isAdmin && handleAdminSalvarManual(p, 'out')}
                            className={`px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                            title={isAdmin ? 'Clique para alternar' : 'Pago'}
                          >
                            Pago ✔️
                          </span>
                        ) : (
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checks.out}
                              onChange={() => handleCheckboxToggle(p.id, 'out')}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer"
                            />
                            <span className="text-xs text-zinc-400">R$ 15</span>
                          </label>
                        )}
                      </div>
                    </td>

                    {/* Novembro */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {p.nov === 'Pago' ? (
                          <span
                            onClick={() => isAdmin && handleAdminSalvarManual(p, 'nov')}
                            className={`px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${isAdmin ? 'cursor-pointer hover:bg-rose-500/20' : ''}`}
                            title={isAdmin ? 'Clique para alternar' : 'Pago'}
                          >
                            Pago ✔️
                          </span>
                        ) : (
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checks.nov}
                              onChange={() => handleCheckboxToggle(p.id, 'nov')}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer"
                            />
                            <span className="text-xs text-zinc-400">R$ 15</span>
                          </label>
                        )}
                      </div>
                    </td>

                    {/* Ação */}
                    <td className="py-3.5 px-4 text-right">
                      {allQuitado ? (
                        <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold py-1 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" /> Quitado Total
                        </div>
                      ) : (
                        <button
                          onClick={() => void handleIniciarPixConfra(p)}
                          disabled={gerandoPixId === p.id}
                          className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-50 font-bold text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" /> {gerandoPixId === p.id ? 'Gerando...' : `PIX R$ ${valorCalculadoPix}`}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Convidado */}
      {showAddConvidadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-amber-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddConvidadoModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Cadastrar Convidado</h3>
            <p className="text-xs text-zinc-400 mb-4">Vincule o convidado a um membro do ministério</p>

            <form onSubmit={handleSalvarConvidado} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Nome do Convidado</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={nomeConvidado}
                  onChange={(e) => setNomeConvidado(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Membro Responsável</label>
                <select
                  required
                  value={membroResponsavel}
                  onChange={(e) => setMembroResponsavel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecione o membro...</option>
                  {membros.map(m => (
                    <option key={m.id} value={m.nome}>{m.nome} ({m.funcao})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Grau de Parentesco / Relação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Esposa, Marido, Filho(a), Amigo"
                  value={parentesco}
                  onChange={(e) => setParentesco(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition"
                >
                  Cadastrar Convidado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

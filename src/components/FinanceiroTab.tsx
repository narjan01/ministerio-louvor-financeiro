import React, { useState } from 'react';
import { Membro, Mensalidade, Transacao, PixInfo } from '../types';
import { DataStore } from '../lib/dataStore';
import { MESES_NOMES, formatarRelatorioFinanceiro, gerarPix } from '../lib/services';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  Search, 
  Plus, 
  QrCode, 
  Check, 
  X, 
  Trash2, 
  Share2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface FinanceiroTabProps {
  isAdmin: boolean;
  onOpenPix: (pix: PixInfo) => void;
  onOpenRelatorio: (titulo: string, texto: string) => void;
}

export const FinanceiroTab: React.FC<FinanceiroTabProps> = ({
  isAdmin,
  onOpenPix,
  onOpenRelatorio,
}) => {
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth() + 1);
  const [anoAtual] = useState<number>(2026);
  const [filtro, setFiltro] = useState<string>('');
  
  // Modais de detalhamento
  const [showReceitasModal, setShowReceitasModal] = useState(false);
  const [showDespesasModal, setShowDespesasModal] = useState(false);
  const [showAddMembroModal, setShowAddMembroModal] = useState(false);
  const [showAddTransacaoModal, setShowAddTransacaoModal] = useState(false);

  // Formulários
  const [novoNome, setNovoNome] = useState('');
  const [novaFuncao, setNovaFuncao] = useState('');
  const [tipoTransacao, setTipoTransacao] = useState<'DESPESA' | 'OFERTA'>('DESPESA');
  const [descricaoTransacao, setDescricaoTransacao] = useState('');
  const [valorTransacao, setValorTransacao] = useState('');

  // Carrega dados
  const membros = DataStore.getMembros();
  const mensalidades = DataStore.getMensalidades(mesAtual, anoAtual);
  const transacoes = DataStore.getTransacoes(mesAtual, anoAtual);
  const consolidadoOficial = DataStore.getHistoricoConsolidado(mesAtual);

  // Cálculos financeiros
  const quitados = membros.filter(m => mensalidades[m.id]?.status === 'Pago');
  const isentos = membros.filter(m => mensalidades[m.id]?.status === 'Isento');
  const pendentes = membros.filter(m => !mensalidades[m.id] || mensalidades[m.id]?.status === 'Pendente');

  const totalMensalidades = quitados.length * 10;
  const ofertas = transacoes.filter(t => t.tipo === 'OFERTA').reduce((acc, t) => acc + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => acc + t.valor, 0);
  const totalReceitas = totalMensalidades + ofertas;
  const saldoConta = consolidadoOficial ? consolidadoOficial.valorConta : (totalReceitas - despesas);
  const saldoMes = consolidadoOficial ? consolidadoOficial.valorRestante : (totalReceitas - despesas);
  const sobraMesAnterior = consolidadoOficial ? consolidadoOficial.sobraAnterior : 0;
  const taxaFrequencia = consolidadoOficial 
    ? consolidadoOficial.percentual 
    : (membros.length > 0 ? Math.round(((quitados.length + isentos.length) / membros.length) * 100) : 0);

  const membrosFiltrados = membros.filter(m => 
    m.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    m.funcao.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleBaixaManual = (membro: Membro) => {
    DataStore.setStatusMensalidade(membro.id, mesAtual, 'Pago', anoAtual);
    // Força re-render
    setFiltro(f => f);
  };

  const handleToggleIsento = (membro: Membro) => {
    const statusAtual = mensalidades[membro.id]?.status;
    const novoStatus = statusAtual === 'Isento' ? 'Pendente' : 'Isento';
    DataStore.setStatusMensalidade(membro.id, mesAtual, novoStatus, anoAtual);
    setFiltro(f => f);
  };

  const handleIniciarPix = async (membro: Membro) => {
    const pix = await gerarPix({
      nome: membro.nome,
      valor: 10.00,
      descricao: `Mensalidade ${MESES_NOMES[mesAtual - 1]} - ${membro.nome}`,
      tipo: 'mensal',
      membro_id: membro.id,
      mes: mesAtual,
    });
    onOpenPix(pix);
  };

  const handleSalvarNovoMembro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novaFuncao.trim()) return;
    DataStore.addMembro(novoNome, novaFuncao);
    setNovoNome('');
    setNovaFuncao('');
    setShowAddMembroModal(false);
  };

  const handleSalvarTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorTransacao.replace(',', '.'));
    if (!descricaoTransacao.trim() || isNaN(val) || val <= 0) return;
    DataStore.addTransacao({
      tipo: tipoTransacao,
      descricao: descricaoTransacao.trim(),
      valor: val,
      mes: mesAtual,
      ano: anoAtual,
    });
    setDescricaoTransacao('');
    setValorTransacao('');
    setShowAddTransacaoModal(false);
  };

  const handleExportarWpp = () => {
    const texto = formatarRelatorioFinanceiro({
      mes: mesAtual,
      ano: anoAtual,
      membros,
      statusMap: mensalidades,
      receitas: totalReceitas,
      despesas,
      saldo: saldoConta,
    });
    onOpenRelatorio(`Relatório Financeiro - ${MESES_NOMES[mesAtual - 1]}`, texto);
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Banner Oficial do Saldo Atual da Planilha */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-zinc-900 border border-purple-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Saldo Atual Geral da Conta</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sincronizado
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              R$ 158,33
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-300 bg-zinc-950/60 px-4 py-2.5 rounded-xl border border-zinc-800">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Mensalidade</span>
            <span className="font-semibold text-white">R$ 10,00</span>
          </div>
          <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Membros Ativos</span>
            <span className="font-semibold text-purple-300">{membros.length} integrantes</span>
          </div>
          <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Confraternização</span>
            <span className="font-semibold text-amber-300">Dez/2026</span>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={mesAtual}
            onChange={(e) => setMesAtual(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-500 transition cursor-pointer shadow-sm"
          >
            {MESES_NOMES.map((nome, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {nome} {anoAtual}
              </option>
            ))}
          </select>
          {isAdmin && (
            <button
              onClick={() => setShowAddTransacaoModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition"
              title="Adicionar Despesa ou Oferta"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              Lançamento
            </button>
          )}
        </div>

        <button
          onClick={handleExportarWpp}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/30"
        >
          <Share2 className="w-3.5 h-3.5" />
          Exportar WhatsApp
        </button>
      </div>

      {/* Cards Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Receitas */}
        <div
          onClick={() => setShowReceitasModal(true)}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Receitas</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{fmt(totalReceitas)}</div>
          <span className="text-[11px] text-purple-400 mt-1 inline-flex items-center gap-1 group-hover:underline">
            Ver detalhes ({quitados.length} pagos)
          </span>
        </div>

        {/* Despesas */}
        <div
          onClick={() => setShowDespesasModal(true)}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Despesas</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{fmt(despesas)}</div>
          <span className="text-[11px] text-rose-400 mt-1 inline-flex items-center gap-1 group-hover:underline">
            Ver detalhes ({transacoes.filter(t => t.tipo === 'DESPESA').length} itens)
          </span>
        </div>

        {/* Saldo da Conta */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Valor na Conta</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${saldoConta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmt(saldoConta)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex flex-col gap-0.5">
            <span>Sobra ant.: <strong className="text-zinc-300">{fmt(sobraMesAnterior)}</strong></span>
            <span>Saldo mês: <strong className={saldoMes >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{fmt(saldoMes)}</strong></span>
          </div>
        </div>

        {/* Frequência de Pagamentos */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Contribuintes</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-400 tracking-tight">
            {taxaFrequencia}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {quitados.length + isentos.length} de {membros.length} membros
          </span>
        </div>
      </div>

      {/* Tabela de Membros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Status das Mensalidades</h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
              R$ 10,00 / membro
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome ou função..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddMembroModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Membro
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/60 text-zinc-400 text-xs font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Membro / Função</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação / PIX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {membrosFiltrados.map((membro) => {
                const mens = mensalidades[membro.id];
                const status = mens?.status || 'Pendente';
                const isPago = status === 'Pago';
                const isIsento = status === 'Isento';

                return (
                  <tr key={membro.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{membro.nome}</div>
                      <div className="text-xs text-zinc-400">{membro.funcao}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPago
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isIsento
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isPago && 'Pago ✅'}
                        {isIsento && 'Isento ✔️'}
                        {!isPago && !isIsento && 'Pendente ❌'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPago ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold py-1.5 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" /> Quitado
                          </div>
                        ) : isIsento ? (
                          <div className="text-sky-400 text-xs font-semibold py-1.5 px-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                            Isento
                          </div>
                        ) : (
                          <button
                            onClick={() => handleIniciarPix(membro)}
                            className="px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                          >
                            <QrCode className="w-3.5 h-3.5" /> PIX R$ 10
                          </button>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            {!isPago && (
                              <button
                                onClick={() => handleBaixaManual(membro)}
                                className="px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs transition"
                                title="Dar Baixa Manual"
                              >
                                Baixa
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleIsento(membro)}
                              className="px-2 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-[11px] transition"
                              title="Marcar como Isento"
                            >
                              {isIsento ? 'Desisentar' : 'Isentar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {membrosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-zinc-500 text-xs">
                    Nenhum membro encontrado com o termo digitado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhes de Receitas */}
      {showReceitasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-purple-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowReceitasModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Detalhamento de Receitas</h3>
            <p className="text-xs text-zinc-400 mb-4">{MESES_NOMES[mesAtual - 1]} {anoAtual}</p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mensalidades Pagas ({quitados.length})</div>
              {quitados.map(m => (
                <div key={m.id} className="flex justify-between items-center text-xs py-1.5 border-b border-zinc-800 text-zinc-300">
                  <span>{m.nome}</span>
                  <span className="font-semibold text-emerald-400 font-mono">R$ 10,00</span>
                </div>
              ))}

              {ofertas > 0 && (
                <>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Ofertas & Doações</div>
                  {transacoes.filter(t => t.tipo === 'OFERTA').map(t => (
                    <div key={t.id} className="flex justify-between items-center text-xs py-1.5 border-b border-zinc-800 text-zinc-300">
                      <span>{t.descricao}</span>
                      <span className="font-semibold text-purple-400 font-mono">{fmt(t.valor)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center font-bold text-sm text-white">
              <span>Total Receitas:</span>
              <span className="text-purple-400 font-mono text-base">{fmt(totalReceitas)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes de Despesas */}
      {showDespesasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-rose-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowDespesasModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Detalhamento de Despesas</h3>
            <p className="text-xs text-zinc-400 mb-4">{MESES_NOMES[mesAtual - 1]} {anoAtual}</p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {transacoes.filter(t => t.tipo === 'DESPESA').map(t => (
                <div key={t.id} className="flex justify-between items-center text-xs py-2 border-b border-zinc-800 text-zinc-300">
                  <span>{t.descricao}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rose-400 font-mono">{fmt(t.valor)}</span>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          DataStore.deleteTransacao(t.id);
                          setFiltro(f => f);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Excluir despesa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {transacoes.filter(t => t.tipo === 'DESPESA').length === 0 && (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma despesa lançada neste mês.</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center font-bold text-sm text-white">
              <span>Total Despesas:</span>
              <span className="text-rose-400 font-mono text-base">{fmt(despesas)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Novo Membro */}
      {showAddMembroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddMembroModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-3">Cadastrar Novo Membro</h3>

            <form onSubmit={handleSalvarNovoMembro} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriel Martins"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Função / Instrumento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teclado, Bateria, Voz"
                  value={novaFuncao}
                  onChange={(e) => setNovaFuncao(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Salvar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançamento Transação (Despesa / Oferta) */}
      {showAddTransacaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddTransacaoModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-3">Novo Lançamento Financeiro</h3>

            <form onSubmit={handleSalvarTransacao} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoTransacao('DESPESA')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      tipoTransacao === 'DESPESA'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTransacao('OFERTA')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      tipoTransacao === 'OFERTA'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'
                    }`}
                  >
                    Oferta / Entrada
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cordas de violão, Pilhas, Oferta Culto"
                  value={descricaoTransacao}
                  onChange={(e) => setDescricaoTransacao(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={valorTransacao}
                  onChange={(e) => setValorTransacao(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

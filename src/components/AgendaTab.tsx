import React, { useState, useEffect } from 'react';
import { EventoAgenda, ItemFrequencia, CategoriaEvento, Membro } from '../types';
import { DataStore } from '../lib/dataStore';
import { MESES_NOMES, formatarRelatorioPresenca, fetchLouveAppEscalas } from '../lib/services';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Share2, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Users, 
  Edit2, 
  Trash2, 
  DownloadCloud,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';

interface AgendaTabProps {
  isAdmin: boolean;
  onOpenRelatorio: (titulo: string, texto: string) => void;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({
  isAdmin,
  onOpenRelatorio,
}) => {
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth() + 1);
  const [anoAtual] = useState<number>(new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(5); // default dia 5 para exibir o primeiro evento
  
  // Eventos e Presença
  const [eventos, setEventos] = useState<EventoAgenda[]>(DataStore.getEventos(mesAtual));
  const [frequenciaData, setFrequenciaData] = useState<ItemFrequencia[]>([]);
  const [filtroChamada, setFiltroChamada] = useState('');
  const [temAlteracoesChamada, setTemAlteracoesChamada] = useState(false);
  const [syncingLouveApp, setSyncingLouveApp] = useState(false);

  // Modais
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoAgenda | null>(null);

  // Form Evento
  const [tituloEvento, setTituloEvento] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [categoriaEvento, setCategoriaEvento] = useState<CategoriaEvento>('Reunião Geral');
  const [escaladosEvento, setEscaladosEvento] = useState<string[]>([]);

  const membros = DataStore.getMembros();

  useEffect(() => {
    setEventos(DataStore.getEventos(mesAtual));
  }, [mesAtual]);

  // Carrega frequência quando dia muda
  useEffect(() => {
    if (!diaSelecionado) {
      setFrequenciaData([]);
      return;
    }

    const evs = eventos.filter(e => e.mes === mesAtual && e.dia === diaSelecionado);
    if (evs.length === 0) {
      setFrequenciaData([]);
      return;
    }

    const evAlvo = evs[0];
    const dataFormatada = `${('0' + diaSelecionado).slice(-2)}/${('0' + mesAtual).slice(-2)}/${anoAtual}`;
    const freq = DataStore.getFrequencia(dataFormatada, evAlvo.escalados);
    setFrequenciaData(freq);
    setTemAlteracoesChamada(false);
  }, [diaSelecionado, mesAtual, eventos]);

  // Cálculos do Calendário
  const primeiroDiaSemana = new Date(anoAtual, mesAtual - 1, 1).getDay(); // 0 = Dom
  const totalDiasMes = new Date(anoAtual, mesAtual, 0).getDate();

  const handlePrevMes = () => {
    if (mesAtual > 1) {
      setMesAtual(mesAtual - 1);
      setDiaSelecionado(null);
    }
  };

  const handleNextMes = () => {
    if (mesAtual < 12) {
      setMesAtual(mesAtual + 1);
      setDiaSelecionado(null);
    }
  };

  const handleSincronizarLouveApp = async () => {
    setSyncingLouveApp(true);
    try {
      const escalas = await fetchLouveAppEscalas(mesAtual, anoAtual);
      if (escalas.length > 0) {
        escalas.forEach(esc => {
          DataStore.saveEvento({
            titulo: esc.titulo,
            data: esc.data,
            categoria: 'Escala LouveApp',
            escalados: esc.escalados,
            isApi: true,
            origem_id: esc.origem_id,
          });
        });
        setEventos(DataStore.getEventos(mesAtual));
        alert(`Sincronização concluída! ${escalas.length} escalas sincronizadas.`);
      } else {
        alert('Nenhuma nova escala retornada pela API LouveApp no momento.');
      }
    } catch (err) {
      alert('Não foi possível conectar à API LouveApp.');
    } finally {
      setSyncingLouveApp(false);
    }
  };

  const handleMarcarPresenca = (membroId: string, status: 'Presente' | 'Falta') => {
    setFrequenciaData(prev =>
      prev.map(item =>
        item.membro_id === membroId ? { ...item, status, modificado: true } : item
      )
    );
    setTemAlteracoesChamada(true);
  };

  const handleSalvarChamadaLote = () => {
    if (!diaSelecionado) return;
    const dataFormatada = `${('0' + diaSelecionado).slice(-2)}/${('0' + mesAtual).slice(-2)}/${anoAtual}`;
    const evAlvo = eventos.find(e => e.mes === mesAtual && e.dia === diaSelecionado);
    DataStore.saveFrequencia(dataFormatada, frequenciaData, evAlvo?.id);
    setTemAlteracoesChamada(false);
    alert(`Chamada salva com sucesso para o dia ${dataFormatada}!`);
  };

  const handleExportarChamadaWpp = () => {
    if (!diaSelecionado || frequenciaData.length === 0) return;
    const dataFormatada = `${('0' + diaSelecionado).slice(-2)}/${('0' + mesAtual).slice(-2)}/${anoAtual}`;
    const evs = eventos.filter(e => e.mes === mesAtual && e.dia === diaSelecionado);
    const titulo = evs.length > 0 ? evs[0].titulo : 'Ensaio / Reunião';
    const texto = formatarRelatorioPresenca(dataFormatada, frequenciaData, titulo);
    onOpenRelatorio(`Chamada - ${dataFormatada}`, texto);
  };

  const handleOpenAddEvento = () => {
    setEditingEvento(null);
    setTituloEvento('');
    setDataEvento(`${anoAtual}-${('0' + mesAtual).slice(-2)}-${('0' + (diaSelecionado || 1)).slice(-2)}`);
    setCategoriaEvento('Reunião Geral');
    setEscaladosEvento([]);
    setShowEventoModal(true);
  };

  const handleOpenEditEvento = (ev: EventoAgenda) => {
    setEditingEvento(ev);
    setTituloEvento(ev.titulo);
    setDataEvento(ev.data);
    setCategoriaEvento(ev.categoria);
    setEscaladosEvento(ev.escalados ? ev.escalados.split(',').map(s => s.trim()) : []);
    setShowEventoModal(true);
  };

  const handleDeleteEvento = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      DataStore.deleteEvento(id);
      setEventos(DataStore.getEventos(mesAtual));
    }
  };

  const handleSalvarEventoForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloEvento.trim() || !dataEvento) return;

    DataStore.saveEvento({
      id: editingEvento ? editingEvento.id : undefined,
      titulo: tituloEvento.trim(),
      data: dataEvento,
      categoria: categoriaEvento,
      escalados: escaladosEvento.join(', '),
    });

    setEventos(DataStore.getEventos(mesAtual));
    setShowEventoModal(false);
  };

  const eventosDiaSelecionado = diaSelecionado
    ? eventos.filter(e => e.mes === mesAtual && e.dia === diaSelecionado)
    : [];

  const precisaChamada = eventosDiaSelecionado.some(e =>
    ['Reunião Geral', 'Reunião', 'Ensaio', 'Comunhão', 'Confraternização'].includes(e.categoria)
  );

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMes}
              disabled={mesAtual <= 1}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-white min-w-32 text-center">
              {MESES_NOMES[mesAtual - 1]} {anoAtual}
            </span>
            <button
              onClick={handleNextMes}
              disabled={mesAtual >= 12}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSincronizarLouveApp}
            disabled={!isAdmin || syncingLouveApp}
            className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
            title="Importar escalas do LouveApp API (administrador)"
          >
            <DownloadCloud className={`w-3.5 h-3.5 ${syncingLouveApp ? 'animate-bounce' : ''}`} />
            {syncingLouveApp ? 'Sincronizando...' : 'LouveApp API'}
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddEvento}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            + Novo Evento / Ensaio
          </button>
        )}
      </div>

      {/* Grid Principal: Calendário + Painel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendário Mensal */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((diaSem, i) => (
              <div key={i} className="text-xs font-semibold text-zinc-500 py-1">
                {diaSem}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Espaços vazios no início */}
            {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-zinc-950/20" />
            ))}

            {/* Dias do Mês */}
            {Array.from({ length: totalDiasMes }).map((_, i) => {
              const dia = i + 1;
              const evs = eventos.filter(e => e.mes === mesAtual && e.dia === dia);
              const hasEvents = evs.length > 0;
              const isSelected = diaSelecionado === dia;

              const isSpecial = evs.some(e => ['Confraternização', 'Comunhão'].includes(e.categoria));
              const isEnsaio = evs.some(e => e.categoria === 'Ensaio');
              const isApi = evs.some(e => e.isApi);

              return (
                <button
                  key={dia}
                  onClick={() => setDiaSelecionado(dia)}
                  className={`h-14 sm:h-16 rounded-xl p-1.5 flex flex-col justify-between text-left transition relative border ${
                    isSelected
                      ? 'border-purple-400 bg-purple-500/20 shadow-md shadow-purple-950/40 ring-2 ring-purple-500/40'
                      : hasEvents
                      ? isSpecial
                        ? 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500'
                        : isEnsaio
                        ? 'border-purple-500/40 bg-purple-500/10 hover:border-purple-500'
                        : isApi
                        ? 'border-sky-500/40 bg-sky-500/10 hover:border-sky-500'
                        : 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500'
                      : 'border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-800/60'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelected
                        ? 'text-white'
                        : hasEvents
                        ? 'text-zinc-100 font-extrabold'
                        : 'text-zinc-400'
                    }`}
                  >
                    {dia}
                  </span>

                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {evs.map((e, idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            e.categoria === 'Confraternização' || e.categoria === 'Comunhão'
                              ? 'bg-amber-400'
                              : e.categoria === 'Ensaio'
                              ? 'bg-purple-400'
                              : e.isApi
                              ? 'bg-sky-400'
                              : 'bg-emerald-400'
                          }`}
                          title={e.titulo}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>Ensaio / Reunião</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Culto Geral</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Comunhão / Confra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>LouveApp</span>
            </div>
          </div>
        </div>

        {/* Detalhes do Dia Selecionado */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                {diaSelecionado
                  ? `Programação do dia ${('0' + diaSelecionado).slice(-2)}/${('0' + mesAtual).slice(-2)}`
                  : 'Selecione um dia'}
              </h3>
            </div>

            <div className="py-3 space-y-3">
              {eventosDiaSelecionado.length > 0 ? (
                eventosDiaSelecionado.map((ev) => {
                  const linkGcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    `${ev.titulo} - Ministério de Louvor`
                  )}&dates=${ev.gcal || ''}`;

                  const msgWpp = `📅 *${ev.titulo}* do Ministério de Louvor!\n📆 Data: ${ev.dataFormatada}\nCategoria: ${ev.categoria}\nAdicione à sua agenda: ${linkGcal}`;

                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {ev.categoria}
                          </span>
                          <h4 className="font-bold text-white text-base mt-1">{ev.titulo}</h4>
                        </div>

                        {isAdmin && !ev.isApi && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditEvento(ev)}
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                              title="Editar Evento"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvento(ev.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition"
                              title="Excluir Evento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {ev.escalados && (
                        <div className="text-xs text-zinc-400 flex items-start gap-1.5 pt-1">
                          <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-zinc-300">Escalados:</strong> {ev.escalados}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href={linkGcal}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition border border-zinc-700"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-400" />
                          Google Agenda
                        </a>

                        <button
                          onClick={() => {
                            window.open(
                              `https://api.whatsapp.com/send?text=${encodeURIComponent(msgWpp)}`,
                              '_blank'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                        >
                          <Share2 className="w-3 h-3" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  Nenhuma programação agendada para esta data.
                </p>
              )}
            </div>
          </div>

          {/* Chamada de Presença (quando o evento pede frequência) */}
          {precisaChamada && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Chamada / Frequência</h3>
                  <span className="text-xs text-zinc-400">
                    {frequenciaData.filter(f => f.status === 'Presente').length} presentes de {frequenciaData.length}
                  </span>
                </div>

                <button
                  onClick={handleExportarChamadaWpp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WPP
                </button>
              </div>

              <input
                type="text"
                placeholder="Buscar membro na chamada..."
                value={filtroChamada}
                onChange={(e) => setFiltroChamada(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {frequenciaData
                  .filter(f => f.nome.toLowerCase().includes(filtroChamada.toLowerCase()))
                  .map((item) => {
                    const isPresente = item.status === 'Presente';
                    const isFalta = item.status === 'Falta';

                    return (
                      <div
                        key={item.membro_id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.nome}</div>
                          <div className="text-[11px] text-zinc-500">{item.funcao}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => handleMarcarPresenca(item.membro_id, 'Presente')}
                                className={`px-2 py-1 rounded-lg font-bold text-xs transition border ${
                                  isPresente
                                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                                }`}
                              >
                                ✔️ P
                              </button>
                              <button
                                onClick={() => handleMarcarPresenca(item.membro_id, 'Falta')}
                                className={`px-2 py-1 rounded-lg font-bold text-xs transition border ${
                                  isFalta
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                                }`}
                              >
                                ❌ F
                              </button>
                            </>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isPresente
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : isFalta
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {isPresente ? '🟢 Presente' : isFalta ? '🔴 Falta' : '⚪ Pendente'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {isAdmin && temAlteracoesChamada && (
                <button
                  onClick={handleSalvarChamadaLote}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/40"
                >
                  <Check className="w-4 h-4" />
                  Salvar Alterações da Chamada
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar / Editar Evento */}
      {showEventoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-purple-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowEventoModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">
              {editingEvento ? 'Editar Evento' : 'Novo Evento da Agenda'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">Cadastre reuniões, cultos ou escalas de ensaio</p>

            <form onSubmit={handleSalvarEventoForm} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ensaio de Vozes, Culto Domingo"
                  value={tituloEvento}
                  onChange={(e) => setTituloEvento(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={dataEvento}
                    onChange={(e) => setDataEvento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Categoria</label>
                  <select
                    value={categoriaEvento}
                    onChange={(e) => setCategoriaEvento(e.target.value as CategoriaEvento)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Reunião Geral">Reunião Geral</option>
                    <option value="Ensaio">Ensaio</option>
                    <option value="Culto">Culto</option>
                    <option value="Comunhão">Comunhão</option>
                    <option value="Confraternização">Confraternização</option>
                  </select>
                </div>
              </div>

              {/* Seletor de Escalados para Ensaios */}
              {(categoriaEvento === 'Ensaio' || categoriaEvento === 'Reunião') && (
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                    Membros Escalados (Opcional - deixe vazio para todos)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                    {membros.map(m => {
                      const isEsc = escaladosEvento.includes(m.nome);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition ${
                            isEsc ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isEsc}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEscaladosEvento([...escaladosEvento, m.nome]);
                              } else {
                                setEscaladosEvento(escaladosEvento.filter(nm => nm !== m.nome));
                              }
                            }}
                            className="rounded text-purple-500 focus:ring-0 bg-zinc-800"
                          />
                          <span className="truncate">{m.nome}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  {editingEvento ? 'Atualizar Evento' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

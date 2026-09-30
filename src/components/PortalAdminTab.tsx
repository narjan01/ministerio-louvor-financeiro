import React, { useState } from 'react';
import { DataStore } from '../lib/dataStore';
import { Transacao, UsuarioAdmin } from '../types';
import { MESES_NOMES } from '../lib/services';
import { 
  ShieldCheck, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Search, 
  Mail, 
  Shield, 
  AlertTriangle,
  Receipt,
  ArrowRight
} from 'lucide-react';

interface PortalAdminTabProps {
  isAdmin: boolean;
  onRequestLogin: () => void;
}

export const PortalAdminTab: React.FC<PortalAdminTabProps> = ({ isAdmin, onRequestLogin }) => {
  const [subTab, setSubTab] = useState<'admins' | 'despesas' | 'receitas'>('despesas');
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [anoSelecionado] = useState<number>(2026);
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Modais de Transações (Despesas / Receitas)
  const [showTransacaoModal, setShowTransacaoModal] = useState<boolean>(false);
  const [editandoTransacao, setEditandoTransacao] = useState<Transacao | null>(null);
  const [tipoModalTransacao, setTipoModalTransacao] = useState<'DESPESA' | 'OFERTA'>('DESPESA');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formValor, setFormValor] = useState<string>('');
  const [formMes, setFormMes] = useState<number>(mesSelecionado);

  // Modais de Usuários Admin
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [editandoAdmin, setEditandoAdmin] = useState<UsuarioAdmin | null>(null);
  const [adminNome, setAdminNome] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminCargo, setAdminCargo] = useState<string>('Líder de Louvor');
  const [adminAtivo, setAdminAtivo] = useState<boolean>(true);

  // Feedback e confirmação de exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState<{ tipo: 'transacao' | 'admin'; id: string; titulo: string; mes?: number } | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const dispararMensagem = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(null), 3500);
  };

  // Carregar dados
  const transacoesMes = DataStore.getTransacoes(mesSelecionado, anoSelecionado);
  const admins = DataStore.getAdmins();

  const despesas = transacoesMes.filter(t => t.tipo === 'DESPESA');
  const receitas = transacoesMes.filter(t => t.tipo === 'OFERTA');

  const totalDespesas = despesas.reduce((acc, cur) => acc + cur.valor, 0);
  const totalReceitas = receitas.reduce((acc, cur) => acc + cur.valor, 0);

  const fmtMoeda = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Funções de Transação (Cadastrar / Editar)
  const handleOpenNovaTransacao = (tipo: 'DESPESA' | 'OFERTA') => {
    setEditandoTransacao(null);
    setTipoModalTransacao(tipo);
    setFormDescricao('');
    setFormValor('');
    setFormMes(mesSelecionado);
    setShowTransacaoModal(true);
  };

  const handleOpenEditarTransacao = (t: Transacao) => {
    setEditandoTransacao(t);
    setTipoModalTransacao(t.tipo);
    setFormDescricao(t.descricao);
    setFormValor(t.valor.toString().replace('.', ','));
    setFormMes(t.mes);
    setShowTransacaoModal(true);
  };

  const handleSalvarTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    const valNumerico = parseFloat(formValor.replace(/\./g, '').replace(',', '.'));
    if (!formDescricao.trim() || isNaN(valNumerico) || valNumerico <= 0) {
      alert('Preencha a descrição e um valor numérico válido maior que zero.');
      return;
    }

    if (editandoTransacao) {
      DataStore.updateTransacao({
        ...editandoTransacao,
        tipo: tipoModalTransacao,
        descricao: formDescricao.trim(),
        valor: valNumerico,
        mes: formMes,
        ano: anoSelecionado,
      });
      dispararMensagem(`✅ ${tipoModalTransacao === 'DESPESA' ? 'Despesa' : 'Receita'} atualizada com sucesso!`);
    } else {
      DataStore.addTransacao({
        tipo: tipoModalTransacao,
        descricao: formDescricao.trim(),
        valor: valNumerico,
        mes: formMes,
        ano: anoSelecionado,
      });
      dispararMensagem(`✅ Nova ${tipoModalTransacao === 'DESPESA' ? 'despesa' : 'receita'} cadastrada com sucesso!`);
    }

    setShowTransacaoModal(false);
  };

  // Funções de Usuário Admin (Cadastrar / Editar)
  const handleOpenNovoAdmin = () => {
    setEditandoAdmin(null);
    setAdminNome('');
    setAdminEmail('');
    setAdminCargo('Líder de Louvor');
    setAdminAtivo(true);
    setShowAdminModal(true);
  };

  const handleOpenEditarAdmin = (adm: UsuarioAdmin) => {
    setEditandoAdmin(adm);
    setAdminNome(adm.nome);
    setAdminEmail(adm.email);
    setAdminCargo(adm.cargo);
    setAdminAtivo(adm.ativo);
    setShowAdminModal(true);
  };

  const handleSalvarAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNome.trim() || !adminEmail.trim()) {
      alert('Nome e e-mail são obrigatórios.');
      return;
    }

    if (editandoAdmin) {
      DataStore.updateAdmin({
        ...editandoAdmin,
        nome: adminNome.trim(),
        email: adminEmail.trim(),
        cargo: adminCargo.trim(),
        ativo: adminAtivo,
      });
      dispararMensagem('✅ Usuário administrador atualizado com sucesso!');
    } else {
      DataStore.addAdmin({
        nome: adminNome.trim(),
        email: adminEmail.trim(),
        cargo: adminCargo.trim(),
        ativo: adminAtivo,
      });
      dispararMensagem('✅ Novo administrador adicionado com sucesso!');
    }

    setShowAdminModal(false);
  };

  // Exclusão Unificada
  const confirmarExclusao = () => {
    if (!itemParaExcluir) return;

    if (itemParaExcluir.tipo === 'transacao') {
      DataStore.deleteTransacao(itemParaExcluir.id, itemParaExcluir.mes || mesSelecionado, anoSelecionado);
      dispararMensagem('🗑️ Registro excluído com sucesso!');
    } else if (itemParaExcluir.tipo === 'admin') {
      DataStore.deleteAdmin(itemParaExcluir.id);
      dispararMensagem('🗑️ Usuário administrador removido com sucesso!');
    }

    setItemParaExcluir(null);
  };

  // Se não estiver logado como admin, exibe tela de bloqueio com botão de login
  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito ao Portal Admin</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          O Portal Admin permite gerenciar usuários com permissões de acesso, cadastrar, editar e excluir despesas e receitas financeiras do ministério.
        </p>
        <button
          onClick={onRequestLogin}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-purple-950/40"
        >
          <ShieldCheck className="w-4 h-4" />
          Fazer Login como Administrador
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Mensagem Toast Flutuante */}
      {mensagemSucesso && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {mensagemSucesso}
        </div>
      )}

      {/* Header do Portal Admin */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border border-purple-500/30 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Portal Administrativo</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Modo Admin Ativo
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Gerencie administradores autorizados, controle detalhado de receitas, despesas e lançamentos financeiros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {subTab === 'despesas' && (
              <button
                onClick={() => handleOpenNovaTransacao('DESPESA')}
                className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Despesa
              </button>
            )}
            {subTab === 'receitas' && (
              <button
                onClick={() => handleOpenNovaTransacao('OFERTA')}
                className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Receita / Oferta
              </button>
            )}
            {subTab === 'admins' && (
              <button
                onClick={handleOpenNovoAdmin}
                className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Usuário Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Secundária do Portal Admin */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubTab('despesas')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'despesas'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-400" />
            Gerenciar Despesas ({despesas.length})
          </button>

          <button
            onClick={() => setSubTab('receitas')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'receitas'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Gerenciar Receitas ({receitas.length})
          </button>

          <button
            onClick={() => setSubTab('admins')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'admins'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Usuários Admin ({admins.length})
          </button>
        </div>

        {/* Seletor de Mês (para receitas e despesas) */}
        {subTab !== 'admins' && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-zinc-400 font-medium">Mês:</span>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
            >
              {MESES_NOMES.map((nome, idx) => (
                <option key={idx} value={idx + 1}>
                  {nome} / {anoSelecionado}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ABA 1: GERENCIAR DESPESAS */}
      {subTab === 'despesas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Total de Despesas ({MESES_NOMES[mesSelecionado - 1]})</span>
              <p className="text-xl font-bold text-rose-400 font-mono mt-1">{fmtMoeda(totalDespesas)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Quantidade de Lançamentos</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{despesas.length} itens</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Ações Rápidas</span>
                <p className="text-xs text-zinc-300 font-semibold mt-1">Lançar nova despesa</p>
              </div>
              <button
                onClick={() => handleOpenNovaTransacao('DESPESA')}
                className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabela de Despesas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar despesa..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <span className="text-xs text-zinc-500">Mês de {MESES_NOMES[mesSelecionado - 1]}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-400">
                    <th className="py-3 px-4">Descrição da Despesa</th>
                    <th className="py-3 px-4">Mês/Ano</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
                  {despesas
                    .filter(d => d.descricao.toLowerCase().includes(termoBusca.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                          {item.descricao}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          {MESES_NOMES[item.mes - 1]} / {item.ano}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                          {fmtMoeda(item.valor)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditarTransacao(item)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition border border-zinc-700"
                              title="Editar despesa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemParaExcluir({ tipo: 'transacao', id: item.id, titulo: item.descricao, mes: item.mes })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition border border-rose-500/30"
                              title="Excluir despesa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {despesas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-500">
                        Nenhuma despesa cadastrada para o mês de {MESES_NOMES[mesSelecionado - 1]}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GERENCIAR RECEITAS */}
      {subTab === 'receitas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Total de Ofertas & Outros ({MESES_NOMES[mesSelecionado - 1]})</span>
              <p className="text-xl font-bold text-purple-400 font-mono mt-1">{fmtMoeda(totalReceitas)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Quantidade de Lançamentos</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{receitas.length} itens</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Ações Rápidas</span>
                <p className="text-xs text-zinc-300 font-semibold mt-1">Lançar nova receita</p>
              </div>
              <button
                onClick={() => handleOpenNovaTransacao('OFERTA')}
                className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabela de Receitas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar receita..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <span className="text-xs text-zinc-500">Mês de {MESES_NOMES[mesSelecionado - 1]}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-400">
                    <th className="py-3 px-4">Descrição da Receita / Oferta</th>
                    <th className="py-3 px-4">Mês/Ano</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
                  {receitas
                    .filter(r => r.descricao.toLowerCase().includes(termoBusca.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                          {item.descricao}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          {MESES_NOMES[item.mes - 1]} / {item.ano}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-400 text-sm">
                          {fmtMoeda(item.valor)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditarTransacao(item)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition border border-zinc-700"
                              title="Editar receita"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemParaExcluir({ tipo: 'transacao', id: item.id, titulo: item.descricao, mes: item.mes })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition border border-rose-500/30"
                              title="Excluir receita"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {receitas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-500">
                        Nenhuma receita/oferta lançada para o mês de {MESES_NOMES[mesSelecionado - 1]}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: GERENCIAR USUÁRIOS ADMIN */}
      {subTab === 'admins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Total de Administradores</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{admins.length} cadastrados</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Status Ativos</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {admins.filter(a => a.ativo).length} ativos
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Novo Acesso</span>
                <p className="text-xs text-zinc-300 font-semibold mt-1">Adicionar líder ou tesoureiro</p>
              </div>
              <button
                onClick={handleOpenNovoAdmin}
                className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabela de Usuários Admin */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar admin por nome ou e-mail..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-400">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail / Login</th>
                    <th className="py-3 px-4">Cargo / Função</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
                  {admins
                    .filter(a => 
                      a.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
                      a.email.toLowerCase().includes(termoBusca.toLowerCase())
                    )
                    .map((adm) => (
                      <tr key={adm.id} className="hover:bg-zinc-800/30 transition">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {adm.nome}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            {adm.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
                            {adm.cargo}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {adm.ativo ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-zinc-500 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditarAdmin(adm)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition border border-zinc-700"
                              title="Editar admin"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemParaExcluir({ tipo: 'admin', id: adm.id, titulo: adm.nome })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition border border-rose-500/30"
                              title="Excluir admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR TRANSAÇÃO (DESPESA OU RECEITA) */}
      {showTransacaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <button
              onClick={() => setShowTransacaoModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editandoTransacao ? 'Editar Lançamento' : tipoModalTransacao === 'DESPESA' ? 'Cadastrar Despesa' : 'Cadastrar Receita'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Preencha os dados do lançamento financeiro para registro oficial.
            </p>

            <form onSubmit={handleSalvarTransacao} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Tipo do Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoModalTransacao('DESPESA')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      tipoModalTransacao === 'DESPESA'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoModalTransacao('OFERTA')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      tipoModalTransacao === 'OFERTA'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Receita / Oferta
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Mês de Referência</label>
                <select
                  value={formMes}
                  onChange={(e) => setFormMes(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                >
                  {MESES_NOMES.map((nome, idx) => (
                    <option key={idx} value={idx + 1}>
                      {nome} / {anoSelecionado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Louve App, Moisés VS, Pilhas..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Valor (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 34,99 ou 120,00"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransacaoModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition ${
                    tipoModalTransacao === 'DESPESA'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  {editandoTransacao ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR USUÁRIO ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-indigo-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editandoAdmin ? 'Editar Administrador' : 'Cadastrar Novo Administrador'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Defina os dados de acesso e autorizações deste membro.
            </p>

            <form onSubmit={handleSalvarAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={adminNome}
                  onChange={(e) => setAdminNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">E-mail do Administrador</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: email@igreja.com.br"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Cargo / Papel</label>
                <select
                  value={adminCargo}
                  onChange={(e) => setAdminCargo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Líder de Louvor">Líder de Louvor</option>
                  <option value="Vice-Líder">Vice-Líder</option>
                  <option value="Tesoureiro">Tesoureiro</option>
                  <option value="Secretário / Escalas">Secretário / Escalas</option>
                  <option value="Administrador Geral">Administrador Geral</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adminAtivoCheck"
                  checked={adminAtivo}
                  onChange={(e) => setAdminAtivo(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="adminAtivoCheck" className="text-xs text-zinc-300 font-medium cursor-pointer">
                  Acesso ativo no sistema
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  {editandoAdmin ? 'Salvar Alterações' : 'Criar Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {itemParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-rose-500/40 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-3 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Confirmar Exclusão</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Tem certeza que deseja remover <strong className="text-white">"{itemParaExcluir.titulo}"</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setItemParaExcluir(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

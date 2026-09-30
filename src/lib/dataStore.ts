import { Membro, Mensalidade, Transacao, EventoAgenda, ParticipanteConfra, ItemFrequencia, UsuarioAdmin } from '../types';
import { 
  OFICIAL_MEMBROS, 
  OFICIAL_HISTORICO_MESES, 
  OFICIAL_PAGAMENTOS_MATRIZ, 
  OFICIAL_EVENTOS, 
  OFICIAL_CONFRA, 
  OFICIAL_FREQUENCIAS_MATRIZ 
} from './dadosOficiaisPlanilha';

// Administradores Padrão do Sistema
const DEFAULT_ADMINS: UsuarioAdmin[] = [
  {
    id: 'adm_1',
    nome: 'Liderança de Louvor (Master)',
    email: 'louvor@novaliancaesperancajp.com.br',
    cargo: 'Líder Geral',
    ativo: true,
    criadoEm: '01/01/2026',
  },
  {
    id: 'adm_2',
    nome: 'Narjan Trugilho',
    email: 'narjan.trugilho@gmail.com',
    cargo: 'Administrador Financeiro',
    ativo: true,
    criadoEm: '15/01/2026',
  },
];

// Versão de controle para forçar atualização do cache local
const DATA_VERSION_KEY = 'louvor_data_version_v3';

export class DataStore {
  // Inicialização ou reset caso os dados estejam desatualizados
  private static ensureLatestData() {
    const currentVersion = localStorage.getItem(DATA_VERSION_KEY);
    if (currentVersion !== '2026_oficial_v3') {
      localStorage.setItem('louvor_membros', JSON.stringify(OFICIAL_MEMBROS));
      localStorage.setItem('louvor_eventos', JSON.stringify(OFICIAL_EVENTOS));
      localStorage.setItem('louvor_confra', JSON.stringify(OFICIAL_CONFRA));

      // Limpa chaves antigas de mensalidades para recarregar as oficiais
      for (let m = 1; m <= 12; m++) {
        localStorage.removeItem(`louvor_mensalidades_2026_${m}`);
      }
      localStorage.removeItem('louvor_transacoes');

      localStorage.setItem(DATA_VERSION_KEY, '2026_oficial_v3');
    }
  }

  // MEMBROS
  static getMembros(): Membro[] {
    this.ensureLatestData();
    const data = localStorage.getItem('louvor_membros');
    if (!data) {
      localStorage.setItem('louvor_membros', JSON.stringify(OFICIAL_MEMBROS));
      return OFICIAL_MEMBROS;
    }
    return JSON.parse(data);
  }

  static addMembro(nome: string, funcao: string): Membro {
    const membros = this.getMembros();
    const novo: Membro = { id: `m_${Date.now()}`, nome: nome.trim(), funcao: funcao.trim(), ativo: true };
    membros.push(novo);
    localStorage.setItem('louvor_membros', JSON.stringify(membros));
    return novo;
  }

  static removeMembro(id: string) {
    const membros = this.getMembros().filter(m => m.id !== id);
    localStorage.setItem('louvor_membros', JSON.stringify(membros));
  }

  // MENSALIDADES
  static getMensalidades(mes: number, ano: number = 2026): Record<string, Mensalidade> {
    this.ensureLatestData();
    const key = `louvor_mensalidades_${ano}_${mes}`;
    const data = localStorage.getItem(key);
    if (!data) {
      const membros = this.getMembros();
      const initial: Record<string, Mensalidade> = {};

      membros.forEach(m => {
        const mesesPagos = OFICIAL_PAGAMENTOS_MATRIZ[m.nome] || [];
        const isPago = mesesPagos.includes(mes);

        initial[m.id] = {
          id: `mens_${m.id}_${mes}`,
          membro_id: m.id,
          mes,
          ano,
          status: isPago ? 'Pago' : 'Pendente',
          valor: 10.00,
          data_pagamento: isPago ? '2026-09-01' : undefined,
        };
      });

      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static setStatusMensalidade(membroId: string, mes: number, status: 'Pendente' | 'Pago' | 'Isento', ano: number = 2026) {
    const mensalidades = this.getMensalidades(mes, ano);
    mensalidades[membroId] = {
      id: `mens_${membroId}_${mes}`,
      membro_id: membroId,
      mes,
      ano,
      status,
      valor: 10.00,
      data_pagamento: status === 'Pago' ? new Date().toISOString() : undefined,
    };
    localStorage.setItem(`louvor_mensalidades_${ano}_${mes}`, JSON.stringify(mensalidades));
  }

  // TRANSAÇÕES & DESPESAS CONSOLIDADAS
  static getTransacoes(mes: number, ano: number = 2026): Transacao[] {
    this.ensureLatestData();
    const key = `louvor_transacoes_${ano}_${mes}`;
    const data = localStorage.getItem(key);

    if (!data) {
      const oficial = OFICIAL_HISTORICO_MESES[mes];
      const lista: Transacao[] = [];

      if (oficial) {
        // Oferta ou outros do mês
        if (oficial.ofertaOutros > 0) {
          lista.push({
            id: `of_${mes}`,
            tipo: 'OFERTA',
            descricao: mes === 1 ? 'Oferta / Juros Conta Janeiro' : 
                       mes === 3 ? 'Oferta Everton Bruno / Saldo' : 
                       mes === 4 ? 'Oferta / Entradas Abril' : 'Oferta / Adiantamento / Juros',
            valor: oficial.ofertaOutros,
            mes,
            ano,
          });
        }

        // Despesas do mês
        oficial.despesasDetalhadas.forEach((d, idx) => {
          lista.push({
            id: `desp_${mes}_${idx}`,
            tipo: 'DESPESA',
            descricao: d.descricao,
            valor: d.valor,
            mes,
            ano,
          });
        });
      }

      localStorage.setItem(key, JSON.stringify(lista));
      return lista;
    }

    return JSON.parse(data);
  }

  static addTransacao(t: Omit<Transacao, 'id'>): Transacao {
    const key = `louvor_transacoes_${t.ano}_${t.mes}`;
    const transacoes = this.getTransacoes(t.mes, t.ano);
    const nova: Transacao = { ...t, id: `t_${Date.now()}` };
    transacoes.push(nova);
    localStorage.setItem(key, JSON.stringify(transacoes));
    return nova;
  }

  static updateTransacao(t: Transacao): void {
    const key = `louvor_transacoes_${t.ano}_${t.mes}`;
    const transacoes = this.getTransacoes(t.mes, t.ano);
    const idx = transacoes.findIndex(item => item.id === t.id);
    if (idx !== -1) {
      transacoes[idx] = t;
      localStorage.setItem(key, JSON.stringify(transacoes));
    }
  }

  static deleteTransacao(id: string, mes: number, ano: number = 2026) {
    const key = `louvor_transacoes_${ano}_${mes}`;
    const transacoes = this.getTransacoes(mes, ano).filter(t => t.id !== id);
    localStorage.setItem(key, JSON.stringify(transacoes));
  }

  // GERENCIAR USUÁRIOS ADMIN
  static getAdmins(): UsuarioAdmin[] {
    const data = localStorage.getItem('louvor_admins');
    if (!data) {
      localStorage.setItem('louvor_admins', JSON.stringify(DEFAULT_ADMINS));
      return DEFAULT_ADMINS;
    }
    return JSON.parse(data);
  }

  static addAdmin(admin: Omit<UsuarioAdmin, 'id' | 'criadoEm'>): UsuarioAdmin {
    const admins = this.getAdmins();
    const novo: UsuarioAdmin = {
      ...admin,
      id: `adm_${Date.now()}`,
      criadoEm: new Date().toLocaleDateString('pt-BR'),
    };
    admins.push(novo);
    localStorage.setItem('louvor_admins', JSON.stringify(admins));
    return novo;
  }

  static updateAdmin(admin: UsuarioAdmin): void {
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.id === admin.id);
    if (idx !== -1) {
      admins[idx] = admin;
      localStorage.setItem('louvor_admins', JSON.stringify(admins));
    }
  }

  static deleteAdmin(id: string): void {
    const admins = this.getAdmins().filter(a => a.id !== id);
    localStorage.setItem('louvor_admins', JSON.stringify(admins));
  }

  // Retorna os dados oficiais do consolidado da planilha para aquele mês
  static getHistoricoConsolidado(mes: number) {
    return OFICIAL_HISTORICO_MESES[mes] || null;
  }

  // EVENTOS / AGENDA
  static getEventos(mes?: number): EventoAgenda[] {
    this.ensureLatestData();
    const data = localStorage.getItem('louvor_eventos');
    const all: EventoAgenda[] = data ? JSON.parse(data) : OFICIAL_EVENTOS;
    if (!data) {
      localStorage.setItem('louvor_eventos', JSON.stringify(OFICIAL_EVENTOS));
    }
    if (mes) {
      return all.filter(e => e.mes === mes);
    }
    return all;
  }

  static saveEvento(evento: Omit<EventoAgenda, 'id' | 'dia' | 'mes' | 'dataFormatada'> & { id?: string; mes?: number }): EventoAgenda {
    const all = this.getEventos();
    const partes = evento.data.split('-');
    const y = partes[0];
    const m = parseInt(partes[1], 10);
    const d = parseInt(partes[2], 10);
    const dataFormatada = `${('0' + d).slice(-2)}/${('0' + m).slice(-2)}/${y}`;

    const dt = new Date(Number(y), m - 1, d);
    dt.setDate(dt.getDate() + 1);
    const gcal = `${y}${partes[1]}${('0' + d).slice(-2)}/${dt.getFullYear()}${('0' + (dt.getMonth() + 1)).slice(-2)}${('0' + dt.getDate()).slice(-2)}`;

    if (evento.id && evento.id !== '0') {
      const idx = all.findIndex(e => e.id === evento.id);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          ...evento,
          id: evento.id,
          dia: d,
          mes: m,
          dataFormatada,
          gcal,
        };
        localStorage.setItem('louvor_eventos', JSON.stringify(all));
        return all[idx];
      }
    }

    const novo: EventoAgenda = {
      ...evento,
      id: `ev_${Date.now()}`,
      dia: d,
      mes: m,
      dataFormatada,
      gcal,
    };
    all.push(novo);
    localStorage.setItem('louvor_eventos', JSON.stringify(all));
    return novo;
  }

  static deleteEvento(id: string) {
    const all = this.getEventos().filter(e => e.id !== id);
    localStorage.setItem('louvor_eventos', JSON.stringify(all));
  }

  // FREQUÊNCIA
  static getFrequencia(dataStr: string, escaladosStr?: string): ItemFrequencia[] {
    this.ensureLatestData();
    const key = `louvor_freq_${dataStr.replace(/\//g, '_')}`;
    const saved = localStorage.getItem(key);

    // Se não tiver registro salvo, verifica se temos dados históricos do PDF (ex: 04/08/2026, 01/09/2026, 07/07/2026)
    let savedMap: Record<string, 'Presente' | 'Falta' | 'Pendente'> = saved ? JSON.parse(saved) : {};
    
    if (!saved && OFICIAL_FREQUENCIAS_MATRIZ[dataStr]) {
      const matriz = OFICIAL_FREQUENCIAS_MATRIZ[dataStr];
      const membros = this.getMembros();
      membros.forEach(m => {
        if (matriz[m.nome]) {
          savedMap[m.id] = matriz[m.nome];
        }
      });
      localStorage.setItem(key, JSON.stringify(savedMap));
    }

    const membros = this.getMembros();
    const isRestricted = Boolean(escaladosStr && escaladosStr.trim().length > 0);
    const escaladosList = isRestricted
      ? escaladosStr!.split(',').map(s => s.trim().toLowerCase())
      : [];

    return membros
      .filter(m => !isRestricted || escaladosList.includes(m.nome.toLowerCase()))
      .map(m => ({
        membro_id: m.id,
        nome: m.nome,
        funcao: m.funcao,
        status: savedMap[m.id] || 'Pendente',
      }));
  }

  static saveFrequencia(dataStr: string, itens: ItemFrequencia[]) {
    const key = `louvor_freq_${dataStr.replace(/\//g, '_')}`;
    const map: Record<string, string> = {};
    itens.forEach(item => {
      map[item.membro_id] = item.status;
    });
    localStorage.setItem(key, JSON.stringify(map));
  }

  // CONFRATERNIZAÇÃO
  static getConfra(): ParticipanteConfra[] {
    this.ensureLatestData();
    const data = localStorage.getItem('louvor_confra');
    if (!data) {
      localStorage.setItem('louvor_confra', JSON.stringify(OFICIAL_CONFRA));
      return OFICIAL_CONFRA;
    }
    return JSON.parse(data);
  }

  static addConvidado(nome: string, convidadoPor: string, parentesco: string): ParticipanteConfra {
    const confra = this.getConfra();
    const novo: ParticipanteConfra = {
      id: `c_${Date.now()}`,
      nome: nome.trim(),
      convidadoPor,
      parentesco,
      set: 'Pendente',
      out: 'Pendente',
      nov: 'Pendente',
    };
    confra.push(novo);
    localStorage.setItem('louvor_confra', JSON.stringify(confra));
    return novo;
  }

  static updateConfraStatus(id: string, parcela: 'set' | 'out' | 'nov', status: 'Pago' | 'Pendente') {
    const confra = this.getConfra();
    const item = confra.find(c => c.id === id);
    if (item) {
      item[parcela] = status;
      localStorage.setItem('louvor_confra', JSON.stringify(confra));
    }
  }

  static updateConfraManual(id: string, setVal: 'Pago' | 'Pendente', outVal: 'Pago' | 'Pendente', novVal: 'Pago' | 'Pendente') {
    const confra = this.getConfra();
    const item = confra.find(c => c.id === id);
    if (item) {
      item.set = setVal;
      item.out = outVal;
      item.nov = novVal;
      localStorage.setItem('louvor_confra', JSON.stringify(confra));
    }
  }
}

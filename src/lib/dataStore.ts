import { Membro, Mensalidade, Transacao, EventoAgenda, ParticipanteConfra, ItemFrequencia } from '../types';
import { getSupabase } from './supabase';

const INITIAL_MEMBROS: Membro[] = [
  { id: '1', nome: 'Narjan Trugilho', funcao: 'Líder / Violão', ativo: true },
  { id: '2', nome: 'Lucas Silva', funcao: 'Teclado', ativo: true },
  { id: '3', nome: 'Matheus Santos', funcao: 'Bateria', ativo: true },
  { id: '4', nome: 'Gabriel Oliveira', funcao: 'Baixo', ativo: true },
  { id: '5', nome: 'Beatriz Costa', funcao: 'Voz Principal', ativo: true },
  { id: '6', nome: 'Camila Ferreira', funcao: 'Backing Vocal', ativo: true },
  { id: '7', nome: 'Daniel Almeida', funcao: 'Guitarra', ativo: true },
  { id: '8', nome: 'Priscila Rocha', funcao: 'Voz / Ministração', ativo: true },
  { id: '9', nome: 'Thiago Martins', funcao: 'Técnico de Som', ativo: true },
];

const INITIAL_TRANSACOES: Transacao[] = [
  { id: 't1', tipo: 'DESPESA', descricao: 'Cabos Santo Angelo P10', valor: 85.00, mes: 9, ano: 2026 },
  { id: 't2', tipo: 'DESPESA', descricao: 'Pilhas Recarregáveis Microfones', valor: 45.00, mes: 9, ano: 2026 },
  { id: 't3', tipo: 'OFERTA', descricao: 'Oferta Voluntária Culto Especial', valor: 150.00, mes: 9, ano: 2026 },
];

const INITIAL_EVENTOS: EventoAgenda[] = [
  {
    id: 'e1',
    titulo: 'Ensaio Geral Banda',
    data: '2026-09-05',
    dataFormatada: '05/09/2026',
    mes: 9,
    dia: 5,
    categoria: 'Ensaio',
    escalados: 'Narjan Trugilho, Lucas Silva, Matheus Santos, Gabriel Oliveira, Beatriz Costa',
    gcal: '20260905/20260906',
  },
  {
    id: 'e2',
    titulo: 'Culto de Celebração',
    data: '2026-09-06',
    dataFormatada: '06/09/2026',
    mes: 9,
    dia: 6,
    categoria: 'Culto',
    escalados: 'Narjan Trugilho, Camila Ferreira, Daniel Almeida',
    gcal: '20260906/20260907',
  },
  {
    id: 'e3',
    titulo: 'Reunião de Alinhamento e Oração',
    data: '2026-09-12',
    dataFormatada: '12/09/2026',
    mes: 9,
    dia: 12,
    categoria: 'Reunião Geral',
    escalados: '',
    gcal: '20260912/20260913',
  },
  {
    id: 'e4',
    titulo: 'Noite de Comunhão & Louvor',
    data: '2026-09-19',
    dataFormatada: '19/09/2026',
    mes: 9,
    dia: 19,
    categoria: 'Comunhão',
    escalados: '',
    gcal: '20260919/20260920',
  },
];

const INITIAL_CONFRA: ParticipanteConfra[] = [
  { id: 'c1', nome: 'Narjan Trugilho', set: 'Pago', out: 'Pago', nov: 'Pago' },
  { id: 'c2', nome: 'Lucas Silva', set: 'Pago', out: 'Pendente', nov: 'Pendente' },
  { id: 'c3', nome: 'Matheus Santos', set: 'Pago', out: 'Pago', nov: 'Pendente' },
  { id: 'c4', nome: 'Beatriz Costa', set: 'Pendente', out: 'Pendente', nov: 'Pendente' },
  { id: 'c5', nome: 'Juliana Costa', convidadoPor: 'Beatriz Costa', parentesco: 'Irmã', set: 'Pendente', out: 'Pendente', nov: 'Pendente' },
  { id: 'c6', nome: 'Gabriel Oliveira', set: 'Pago', out: 'Pendente', nov: 'Pendente' },
];

export class DataStore {
  // MEMBROS
  static getMembros(): Membro[] {
    const data = localStorage.getItem('louvor_membros');
    if (!data) {
      localStorage.setItem('louvor_membros', JSON.stringify(INITIAL_MEMBROS));
      return INITIAL_MEMBROS;
    }
    return JSON.parse(data);
  }

  static addMembro(nome: string, funcao: string): Membro {
    const membros = this.getMembros();
    const novo: Membro = { id: String(Date.now()), nome: nome.trim(), funcao: funcao.trim(), ativo: true };
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
    const key = `louvor_mensalidades_${ano}_${mes}`;
    const data = localStorage.getItem(key);
    if (!data) {
      // Seed inicial para o mês atual
      const membros = this.getMembros();
      const initial: Record<string, Mensalidade> = {};
      membros.forEach((m, idx) => {
        initial[m.id] = {
          id: `mens_${m.id}_${mes}`,
          membro_id: m.id,
          mes,
          ano,
          status: idx < 2 ? 'Pago' : (idx === 2 ? 'Isento' : 'Pendente'),
          valor: 10.00,
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

  // TRANSAÇÕES
  static getTransacoes(mes: number, ano: number = 2026): Transacao[] {
    const data = localStorage.getItem('louvor_transacoes');
    const all: Transacao[] = data ? JSON.parse(data) : INITIAL_TRANSACOES;
    if (!data) {
      localStorage.setItem('louvor_transacoes', JSON.stringify(INITIAL_TRANSACOES));
    }
    return all.filter(t => t.mes === mes && t.ano === ano);
  }

  static addTransacao(t: Omit<Transacao, 'id'>): Transacao {
    const data = localStorage.getItem('louvor_transacoes');
    const all: Transacao[] = data ? JSON.parse(data) : INITIAL_TRANSACOES;
    const nova: Transacao = { ...t, id: `t_${Date.now()}` };
    all.push(nova);
    localStorage.setItem('louvor_transacoes', JSON.stringify(all));
    return nova;
  }

  static deleteTransacao(id: string) {
    const data = localStorage.getItem('louvor_transacoes');
    if (!data) return;
    const all: Transacao[] = JSON.parse(data);
    localStorage.setItem('louvor_transacoes', JSON.stringify(all.filter(t => t.id !== id)));
  }

  // EVENTOS / AGENDA
  static getEventos(mes?: number): EventoAgenda[] {
    const data = localStorage.getItem('louvor_eventos');
    const all: EventoAgenda[] = data ? JSON.parse(data) : INITIAL_EVENTOS;
    if (!data) {
      localStorage.setItem('louvor_eventos', JSON.stringify(INITIAL_EVENTOS));
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
    const key = `louvor_freq_${dataStr.replace(/\//g, '_')}`;
    const saved = localStorage.getItem(key);
    const savedMap: Record<string, 'Presente' | 'Falta' | 'Pendente'> = saved ? JSON.parse(saved) : {};

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
    const data = localStorage.getItem('louvor_confra');
    if (!data) {
      localStorage.setItem('louvor_confra', JSON.stringify(INITIAL_CONFRA));
      return INITIAL_CONFRA;
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

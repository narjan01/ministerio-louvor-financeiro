import {
  Membro,
  Mensalidade,
  Transacao,
  EventoAgenda,
  ParticipanteConfra,
  ItemFrequencia,
  StatusPagamento,
  StatusFrequencia,
} from '../types';
import { getSupabase } from './supabase';

const DEFAULT_YEAR = new Date().getFullYear();
const MONTHLY_VALUE = 10;

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
  { id: 't1', tipo: 'DESPESA', descricao: 'Cabos Santo Angelo P10', valor: 85.00, mes: 9, ano: DEFAULT_YEAR },
  { id: 't2', tipo: 'DESPESA', descricao: 'Pilhas Recarregáveis Microfones', valor: 45.00, mes: 9, ano: DEFAULT_YEAR },
  { id: 't3', tipo: 'OFERTA', descricao: 'Oferta Voluntária Culto Especial', valor: 150.00, mes: 9, ano: DEFAULT_YEAR },
];

const INITIAL_EVENTOS: EventoAgenda[] = [
  {
    id: 'e1',
    titulo: 'Ensaio Geral Banda',
    data: `${DEFAULT_YEAR}-09-05`,
    dataFormatada: `05/09/${DEFAULT_YEAR}`,
    mes: 9,
    dia: 5,
    categoria: 'Ensaio',
    escalados: 'Narjan Trugilho, Lucas Silva, Matheus Santos, Gabriel Oliveira, Beatriz Costa',
    gcal: `${DEFAULT_YEAR}0905/${DEFAULT_YEAR}0906`,
  },
  {
    id: 'e2',
    titulo: 'Culto de Celebração',
    data: `${DEFAULT_YEAR}-09-06`,
    dataFormatada: `06/09/${DEFAULT_YEAR}`,
    mes: 9,
    dia: 6,
    categoria: 'Culto',
    escalados: 'Narjan Trugilho, Camila Ferreira, Daniel Almeida',
    gcal: `${DEFAULT_YEAR}0906/${DEFAULT_YEAR}0907`,
  },
  {
    id: 'e3',
    titulo: 'Reunião de Alinhamento e Oração',
    data: `${DEFAULT_YEAR}-09-12`,
    dataFormatada: `12/09/${DEFAULT_YEAR}`,
    mes: 9,
    dia: 12,
    categoria: 'Reunião Geral',
    escalados: '',
    gcal: `${DEFAULT_YEAR}0912/${DEFAULT_YEAR}0913`,
  },
  {
    id: 'e4',
    titulo: 'Noite de Comunhão & Louvor',
    data: `${DEFAULT_YEAR}-09-19`,
    dataFormatada: `19/09/${DEFAULT_YEAR}`,
    mes: 9,
    dia: 19,
    categoria: 'Comunhão',
    escalados: '',
    gcal: `${DEFAULT_YEAR}0919/${DEFAULT_YEAR}0920`,
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

type RemoteEventPayload = {
  titulo: string;
  data: string;
  categoria: string;
  escalados: string[];
  is_api: boolean;
  origem_id?: string | null;
};

const isUuid = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value));

const readLocal = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : fallback;
  } catch (error) {
    console.warn(`Dados locais inválidos em ${key}; usando valores padrão.`, error);
    return fallback;
  }
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const formatDate = (date: string): { year: number; month: number; day: number; formatted: string; gcal: string } => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error('A data do evento deve estar no formato YYYY-MM-DD.');

  const [, year, month, day] = match;
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  const parsed = new Date(parsedYear, parsedMonth - 1, parsedDay);

  if (
    parsed.getFullYear() !== parsedYear ||
    parsed.getMonth() !== parsedMonth - 1 ||
    parsed.getDate() !== parsedDay
  ) {
    throw new Error('A data do evento é inválida.');
  }

  parsed.setDate(parsed.getDate() + 1);
  const nextDay = `${parsed.getFullYear()}${String(parsed.getMonth() + 1).padStart(2, '0')}${String(parsed.getDate()).padStart(2, '0')}`;

  return {
    year: parsedYear,
    month: parsedMonth,
    day: parsedDay,
    formatted: `${String(parsedDay).padStart(2, '0')}/${String(parsedMonth).padStart(2, '0')}/${parsedYear}`,
    gcal: `${year}${month}${day}/${nextDay}`,
  };
};

const eventFromRemote = (row: any): EventoAgenda | null => {
  if (!row?.data) return null;
  const date = String(row.data).slice(0, 10);
  try {
    const parsed = formatDate(date);
    return {
      id: String(row.id),
      titulo: String(row.titulo || 'Evento'),
      data: date,
      dataFormatada: parsed.formatted,
      mes: parsed.month,
      dia: parsed.day,
      categoria: row.categoria,
      escalados: Array.isArray(row.escalados) ? row.escalados.join(', ') : String(row.escalados || ''),
      gcal: parsed.gcal,
      isApi: Boolean(row.is_api),
      origem_id: row.origem_id ? String(row.origem_id) : undefined,
    };
  } catch {
    return null;
  }
};

export class DataStore {
  private static initialization?: Promise<void>;

  private static runRemote(operation: (client: NonNullable<ReturnType<typeof getSupabase>>) => PromiseLike<unknown> | unknown) {
    const client = getSupabase();
    if (!client) return;
    void Promise.resolve(operation(client)).catch(error => {
      console.warn('Não foi possível sincronizar a alteração com o Supabase.', error);
    });
  }

  /**
   * Carrega o Supabase para o cache local. O cache continua sendo usado como
   * fallback offline, mas o banco passa a ser a fonte oficial quando configurado.
   */
  static async initialize(): Promise<void> {
    const client = getSupabase();
    if (!client) return;
    if (this.initialization) return this.initialization;

    const load = async () => {
      await Promise.all([
        client.from('membros').select('*').then(({ data, error }) => {
          if (error) throw error;
          localStorage.setItem('louvor_membros', JSON.stringify((data || []).map(row => ({
            id: String(row.id),
            nome: row.nome,
            funcao: row.funcao,
            ativo: row.ativo !== false,
            telefone: row.telefone || undefined,
          }))));
        }),
        client.from('mensalidades').select('*').then(({ data, error }) => {
          if (error) throw error;
          Object.keys(localStorage)
            .filter(key => key.startsWith('louvor_mensalidades_'))
            .forEach(key => localStorage.removeItem(key));

          const grouped: Record<string, Record<string, Mensalidade>> = {};
          (data || []).forEach(row => {
            const ano = Number(row.ano);
            const mes = Number(row.mes);
            const key = `louvor_mensalidades_${ano}_${mes}`;
            grouped[key] ||= {};
            grouped[key][String(row.membro_id)] = {
              id: String(row.id),
              membro_id: String(row.membro_id),
              mes,
              ano,
              status: row.status,
              valor: Number(row.valor || MONTHLY_VALUE),
              payment_id: row.payment_id || undefined,
              data_pagamento: row.data_pagamento || undefined,
            };
          });
          Object.entries(grouped).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
        }),
        client.from('transacoes').select('*').then(({ data, error }) => {
          if (error) throw error;
          localStorage.setItem('louvor_transacoes', JSON.stringify((data || []).map(row => ({
            id: String(row.id),
            tipo: row.tipo,
            descricao: row.descricao,
            valor: Number(row.valor),
            mes: Number(row.mes),
            ano: Number(row.ano),
            created_at: row.created_at,
          }))));
        }),
        client.from('eventos').select('*').then(({ data, error }) => {
          if (error) throw error;
          const eventos = (data || []).map(eventFromRemote).filter(Boolean) as EventoAgenda[];
          localStorage.setItem('louvor_eventos', JSON.stringify(eventos));
        }),
        client.from('frequencias').select('*').then(({ data, error }) => {
          if (error) throw error;
          const grouped: Record<string, Record<string, string>> = {};
          (data || []).forEach(row => {
            const date = String(row.data).slice(0, 10);
            const [year, month, day] = date.split('-');
            const key = `louvor_freq_${day}_${month}_${year}`;
            grouped[key] ||= {};
            grouped[key][String(row.membro_id)] = row.status;
          });
          Object.entries(grouped).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
        }),
        client.from('confra_participantes').select('*').then(({ data, error }) => {
          if (error) throw error;
          localStorage.setItem('louvor_confra', JSON.stringify((data || []).map(row => ({
            id: String(row.id),
            nome: row.nome,
            convidadoPor: row.convidado_por || undefined,
            parentesco: row.parentesco || undefined,
            set: row.setembro_status,
            out: row.outubro_status,
            nov: row.novembro_status,
          }))));
        }),
      ]).catch(error => {
        // O portal continua em modo local se alguma tabela ainda não existir.
        console.warn('Supabase não pôde ser carregado completamente; mantendo cache local.', error);
      });
    };

    this.initialization = load();
    return this.initialization;
  }

  static resetInitialization() {
    this.initialization = undefined;
  }

  // MEMBROS
  static getMembros(): Membro[] {
    const existing = localStorage.getItem('louvor_membros');
    if (!existing) {
      const initial = clone(INITIAL_MEMBROS);
      localStorage.setItem('louvor_membros', JSON.stringify(initial));
      return initial;
    }
    return readLocal<Membro[]>('louvor_membros', []);
  }

  static addMembro(nome: string, funcao: string): Membro {
    const membros = this.getMembros();
    const novo: Membro = { id: `local-${Date.now()}`, nome: nome.trim(), funcao: funcao.trim(), ativo: true };
    membros.push(novo);
    localStorage.setItem('louvor_membros', JSON.stringify(membros));

    this.runRemote(async client => {
      const { data, error } = await client.from('membros').insert({ nome: novo.nome, funcao: novo.funcao, ativo: true }).select().single();
      if (error) throw error;
      if (data?.id) {
        const current = this.getMembros().map(item => item.id === novo.id ? { ...item, id: String(data.id) } : item);
        localStorage.setItem('louvor_membros', JSON.stringify(current));
      }
    });
    return novo;
  }

  static removeMembro(id: string) {
    const membros = this.getMembros().filter(m => m.id !== id);
    localStorage.setItem('louvor_membros', JSON.stringify(membros));
    if (isUuid(id)) this.runRemote(client => client.from('membros').delete().eq('id', id));
  }

  // MENSALIDADES
  static getMensalidades(mes: number, ano: number = DEFAULT_YEAR): Record<string, Mensalidade> {
    const key = `louvor_mensalidades_${ano}_${mes}`;
    const existing = localStorage.getItem(key);
    if (!existing) {
      const membros = this.getMembros();
      const initial: Record<string, Mensalidade> = {};
      membros.forEach((membro, index) => {
        initial[membro.id] = {
          id: `mens_${membro.id}_${mes}_${ano}`,
          membro_id: membro.id,
          mes,
          ano,
          status: index < 2 ? 'Pago' : index === 2 ? 'Isento' : 'Pendente',
          valor: MONTHLY_VALUE,
        };
      });
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return readLocal<Record<string, Mensalidade>>(key, {});
  }

  static setStatusMensalidade(
    membroId: string,
    mes: number,
    status: StatusPagamento,
    ano: number = DEFAULT_YEAR,
    paymentId?: string,
  ) {
    const mensalidades = this.getMensalidades(mes, ano);
    const previous = mensalidades[membroId];
    mensalidades[membroId] = {
      id: previous?.id || `mens_${membroId}_${mes}_${ano}`,
      membro_id: membroId,
      mes,
      ano,
      status,
      valor: previous?.valor || MONTHLY_VALUE,
      payment_id: paymentId || previous?.payment_id,
      data_pagamento: status === 'Pago' ? previous?.data_pagamento || new Date().toISOString() : undefined,
    };
    localStorage.setItem(`louvor_mensalidades_${ano}_${mes}`, JSON.stringify(mensalidades));

    if (isUuid(membroId)) {
      this.runRemote(client => client.from('mensalidades').upsert({
        membro_id: membroId,
        mes,
        ano,
        status,
        valor: mensalidades[membroId].valor,
        payment_id: paymentId || previous?.payment_id || null,
        data_pagamento: status === 'Pago' ? mensalidades[membroId].data_pagamento : null,
      }, { onConflict: 'membro_id,mes,ano' }));
    }
  }

  // TRANSAÇÕES
  static getTransacoes(mes: number, ano: number = DEFAULT_YEAR): Transacao[] {
    const existing = localStorage.getItem('louvor_transacoes');
    if (!existing) {
      localStorage.setItem('louvor_transacoes', JSON.stringify(clone(INITIAL_TRANSACOES)));
    }
    return readLocal<Transacao[]>('louvor_transacoes', []).filter(t => t.mes === mes && t.ano === ano);
  }

  static addTransacao(t: Omit<Transacao, 'id'>): Transacao {
    const all = readLocal<Transacao[]>('louvor_transacoes', clone(INITIAL_TRANSACOES));
    const nova: Transacao = { ...t, id: `local-${Date.now()}` };
    all.push(nova);
    localStorage.setItem('louvor_transacoes', JSON.stringify(all));

    this.runRemote(async client => {
      const { data, error } = await client.from('transacoes').insert({
        tipo: nova.tipo,
        descricao: nova.descricao,
        valor: nova.valor,
        mes: nova.mes,
        ano: nova.ano,
      }).select().single();
      if (error) throw error;
      if (data?.id) {
        const current = readLocal<Transacao[]>('louvor_transacoes', []).map(item => item.id === nova.id ? { ...item, id: String(data.id) } : item);
        localStorage.setItem('louvor_transacoes', JSON.stringify(current));
      }
    });
    return nova;
  }

  static deleteTransacao(id: string) {
    const all = readLocal<Transacao[]>('louvor_transacoes', []);
    localStorage.setItem('louvor_transacoes', JSON.stringify(all.filter(t => t.id !== id)));
    if (isUuid(id)) this.runRemote(client => client.from('transacoes').delete().eq('id', id));
  }

  // EVENTOS / AGENDA
  static getEventos(mes?: number): EventoAgenda[] {
    const existing = localStorage.getItem('louvor_eventos');
    if (!existing) localStorage.setItem('louvor_eventos', JSON.stringify(clone(INITIAL_EVENTOS)));
    const all = readLocal<EventoAgenda[]>('louvor_eventos', []);
    return typeof mes === 'number' ? all.filter(evento => evento.mes === mes) : all;
  }

  static saveEvento(
    evento: Omit<EventoAgenda, 'id' | 'dia' | 'mes' | 'dataFormatada'> & { id?: string; mes?: number },
  ): EventoAgenda {
    const all = this.getEventos();
    const parsed = formatDate(evento.data);
    const base: EventoAgenda = {
      ...evento,
      id: evento.id || `local-${Date.now()}`,
      dia: parsed.day,
      mes: parsed.month,
      dataFormatada: parsed.formatted,
      gcal: parsed.gcal,
      isApi: Boolean(evento.isApi),
    };

    const existingIndex = all.findIndex(item =>
      (evento.id && item.id === evento.id) ||
      (evento.origem_id && item.origem_id === evento.origem_id)
    );

    if (existingIndex >= 0) {
      base.id = all[existingIndex].id;
      all[existingIndex] = { ...all[existingIndex], ...base };
    } else {
      all.push(base);
    }
    localStorage.setItem('louvor_eventos', JSON.stringify(all));

    const payload: RemoteEventPayload = {
      titulo: base.titulo,
      data: base.data,
      categoria: base.categoria,
      escalados: base.escalados ? base.escalados.split(',').map(item => item.trim()).filter(Boolean) : [],
      is_api: Boolean(base.isApi),
      origem_id: base.origem_id || null,
    };

    this.runRemote(async client => {
      if (isUuid(base.id)) {
        const { error } = await client.from('eventos').update(payload).eq('id', base.id);
        if (error) throw error;
      } else {
        const { data, error } = await client.from('eventos').insert(payload).select().single();
        if (error) throw error;
        if (data?.id) {
          const current = this.getEventos().map(item => item.id === base.id ? { ...item, id: String(data.id) } : item);
          localStorage.setItem('louvor_eventos', JSON.stringify(current));
        }
      }
    });

    return base;
  }

  static deleteEvento(id: string) {
    localStorage.setItem('louvor_eventos', JSON.stringify(this.getEventos().filter(evento => evento.id !== id)));
    if (isUuid(id)) this.runRemote(client => client.from('eventos').delete().eq('id', id));
  }

  // FREQUÊNCIA
  private static frequencyKey(dataStr: string, eventoId?: string) {
    return `louvor_freq_${eventoId || dataStr.replace(/\//g, '_')}`;
  }

  static getFrequencia(dataStr: string, escaladosStr?: string, eventoId?: string): ItemFrequencia[] {
    const key = this.frequencyKey(dataStr, eventoId);
    const legacyKey = this.frequencyKey(dataStr);
    const savedKey = localStorage.getItem(key) ? key : legacyKey;
    const savedMap: Record<string, StatusFrequencia> = localStorage.getItem(savedKey)
      ? readLocal<Record<string, StatusFrequencia>>(savedKey, {})
      : {};
    const membros = this.getMembros();
    const isRestricted = Boolean(escaladosStr && escaladosStr.trim().length > 0);
    const escaladosList = isRestricted ? escaladosStr!.split(',').map(item => item.trim().toLowerCase()) : [];

    return membros
      .filter(membro => membro.ativo !== false && (!isRestricted || escaladosList.includes(membro.nome.toLowerCase())))
      .map(membro => ({
        membro_id: membro.id,
        nome: membro.nome,
        funcao: membro.funcao,
        status: savedMap[membro.id] || 'Pendente',
      }));
  }

  static saveFrequencia(dataStr: string, itens: ItemFrequencia[], eventoId?: string) {
    const key = this.frequencyKey(dataStr, eventoId);
    const map: Record<string, StatusFrequencia> = {};
    itens.forEach(item => { map[item.membro_id] = item.status; });
    localStorage.setItem(key, JSON.stringify(map));

    const dateParts = dataStr.split('/');
    const isoDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : null;
    this.runRemote(async client => {
      let remoteEventId = isUuid(eventoId) ? eventoId : undefined;
      if (!remoteEventId && isoDate) {
        const { data, error } = await client.from('eventos').select('id').eq('data', isoDate).limit(1).maybeSingle();
        if (error) throw error;
        remoteEventId = data?.id;
      }
      if (!remoteEventId) return;

      const rows = itens
        .filter(item => isUuid(item.membro_id))
        .map(item => ({ evento_id: remoteEventId, membro_id: item.membro_id, data: isoDate, status: item.status }));
      if (rows.length) {
        const { error } = await client.from('frequencias').upsert(rows, { onConflict: 'evento_id,membro_id' });
        if (error) throw error;
      }
    });
  }

  // CONFRATERNIZAÇÃO
  static getConfra(): ParticipanteConfra[] {
    const existing = localStorage.getItem('louvor_confra');
    if (!existing) localStorage.setItem('louvor_confra', JSON.stringify(clone(INITIAL_CONFRA)));
    return readLocal<ParticipanteConfra[]>('louvor_confra', []);
  }

  static addConvidado(nome: string, convidadoPor: string, parentesco: string): ParticipanteConfra {
    const confra = this.getConfra();
    const novo: ParticipanteConfra = {
      id: `local-${Date.now()}`,
      nome: nome.trim(),
      convidadoPor: convidadoPor.trim(),
      parentesco: parentesco.trim(),
      set: 'Pendente',
      out: 'Pendente',
      nov: 'Pendente',
    };
    confra.push(novo);
    localStorage.setItem('louvor_confra', JSON.stringify(confra));

    this.runRemote(async client => {
      const { data, error } = await client.from('confra_participantes').insert({
        nome: novo.nome,
        is_convidado: true,
        convidado_por: novo.convidadoPor,
        parentesco: novo.parentesco,
      }).select().single();
      if (error) throw error;
      if (data?.id) {
        const current = this.getConfra().map(item => item.id === novo.id ? { ...item, id: String(data.id) } : item);
        localStorage.setItem('louvor_confra', JSON.stringify(current));
      }
    });
    return novo;
  }

  static updateConfraStatus(id: string, parcela: 'set' | 'out' | 'nov', status: 'Pago' | 'Pendente') {
    const confra = this.getConfra();
    const item = confra.find(participante => participante.id === id);
    if (!item) return;
    item[parcela] = status;
    localStorage.setItem('louvor_confra', JSON.stringify(confra));

    const column = { set: 'setembro_status', out: 'outubro_status', nov: 'novembro_status' }[parcela];
    if (isUuid(id)) this.runRemote(client => client.from('confra_participantes').update({ [column]: status }).eq('id', id));
  }

  static updateConfraManual(id: string, setVal: 'Pago' | 'Pendente', outVal: 'Pago' | 'Pendente', novVal: 'Pago' | 'Pendente') {
    const confra = this.getConfra();
    const item = confra.find(participante => participante.id === id);
    if (!item) return;
    item.set = setVal;
    item.out = outVal;
    item.nov = novVal;
    localStorage.setItem('louvor_confra', JSON.stringify(confra));

    if (isUuid(id)) {
      this.runRemote(client => client.from('confra_participantes').update({
        setembro_status: setVal,
        outubro_status: outVal,
        novembro_status: novVal,
      }).eq('id', id));
    }
  }
}

export type StatusPagamento = 'Pendente' | 'Pago' | 'Isento';
export type StatusFrequencia = 'Pendente' | 'Presente' | 'Falta';
export type CategoriaEvento = 'Reunião Geral' | 'Reunião' | 'Ensaio' | 'Comunhão' | 'Culto' | 'Confraternização' | 'Escala LouveApp';

export interface Membro {
  id: string;
  nome: string;
  funcao: string;
  ativo?: boolean;
  telefone?: string;
  statusMes?: StatusPagamento;
}

export interface Mensalidade {
  id: string;
  membro_id: string;
  mes: number;
  ano: number;
  status: StatusPagamento;
  valor: number;
  data_pagamento?: string;
}

export interface Transacao {
  id: string;
  tipo: 'DESPESA' | 'OFERTA';
  descricao: string;
  valor: number;
  mes: number;
  ano: number;
  created_at?: string;
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  dataFormatada: string; // DD/MM/YYYY
  mes: number;
  dia: number;
  categoria: CategoriaEvento;
  escalados?: string; // Nomes separados por vírgula
  gcal?: string;
  isApi?: boolean;
}

export interface ItemFrequencia {
  membro_id: string;
  nome: string;
  funcao?: string;
  status: StatusFrequencia;
  modificado?: boolean;
}

export interface ParticipanteConfra {
  id: string;
  nome: string;
  convidadoPor?: string;
  parentesco?: string;
  set: StatusPagamento;
  out: StatusPagamento;
  nov: StatusPagamento;
}

export interface PixInfo {
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
  valor: number;
  nome: string;
  descricao: string;
  mes?: number | number[];
  tipo: 'mensal' | 'confra';
  membro_id?: string;
}

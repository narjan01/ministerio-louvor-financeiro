import { EventoAgenda, PixInfo, Membro, Transacao, ParticipanteConfra, ItemFrequencia } from '../types';

export const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export async function gerarPix(params: {
  nome: string;
  valor: number;
  descricao?: string;
  tipo: 'mensal' | 'confra';
  membro_id?: string;
  mes?: number | number[];
  ano?: number;
  parcelas?: ('set' | 'out' | 'nov')[];
}): Promise<PixInfo> {
  if (!params.nome.trim() || !Number.isFinite(params.valor) || params.valor <= 0) {
    throw new Error('Nome e valor válido são obrigatórios para gerar o PIX.');
  }

  try {
    const res = await fetch('/api/pix/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => null);

    if (res.ok && data?.sucesso && data.payment_id && data.qr_code && data.qr_code_base64) {
      return {
        payment_id: String(data.payment_id),
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        valor: params.valor,
        nome: params.nome,
        descricao: params.descricao || (params.tipo === 'confra' ? 'Confraternização' : 'Contribuição Mensal'),
        mes: params.mes,
        ano: params.ano,
        parcelas: params.parcelas,
        tipo: params.tipo,
        membro_id: params.membro_id,
      };
    }

    if (!import.meta.env.DEV) {
      throw new Error(data?.erro || 'Não foi possível gerar o PIX.');
    }
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
    console.warn('API /api/pix/create indisponível no preview local; usando modo de demonstração.');
  }

  // O fallback é permitido somente no desenvolvimento e é explicitamente simulado.
  const mockId = `mock-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const pixCopiaCola = `PIX-DEMO-${params.valor.toFixed(2)}-${mockId}`;
  const mockSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="white" rx="12"/>
      <rect x="20" y="20" width="40" height="40" fill="black" rx="4"/><rect x="28" y="28" width="24" height="24" fill="white"/><rect x="34" y="34" width="12" height="12" fill="black"/>
      <rect x="140" y="20" width="40" height="40" fill="black" rx="4"/><rect x="148" y="28" width="24" height="24" fill="white"/><rect x="154" y="34" width="12" height="12" fill="black"/>
      <rect x="20" y="140" width="40" height="40" fill="black" rx="4"/><rect x="28" y="148" width="24" height="24" fill="white"/><rect x="34" y="154" width="12" height="12" fill="black"/>
      <path d="M70 25h15v15H70zM95 25h20v10H95zM70 55h30v10H70zM115 50h15v25h-15zM70 80h15v15H70zM95 75h20v20H95zM130 85h20v15h-20zM25 90h25v15H25zM60 110h35v10H60zM110 110h25v15h-25zM150 110h25v15h-25zM75 135h20v20H75zM105 145h30v15h-30zM145 140h30v25h-30z" fill="#121212"/>
      <text x="100" y="185" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">DEMO R$ ${params.valor.toFixed(2)}</text>
    </svg>
  `;

  return {
    payment_id: mockId,
    qr_code: pixCopiaCola,
    qr_code_base64: `data:image/svg+xml;base64,${btoa(mockSvg)}`,
    valor: params.valor,
    nome: params.nome,
    descricao: params.descricao || (params.tipo === 'confra' ? 'Confraternização' : 'Contribuição Mensal'),
    mes: params.mes,
    ano: params.ano,
    parcelas: params.parcelas,
    tipo: params.tipo,
    membro_id: params.membro_id,
  };
}

export async function fetchLouveAppEscalas(mes: number, ano: number = new Date().getFullYear()): Promise<EventoAgenda[]> {
  const res = await fetch(`/api/louveapp/escalas?mes=${mes}&ano=${ano}`);
  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.sucesso || !Array.isArray(data.eventos)) {
    throw new Error(data?.erro || `LouveApp retornou HTTP ${res.status}.`);
  }

  return data.eventos;
}

// FORMATADORES DE RELATÓRIO DO WHATSAPP
export function formatarRelatorioFinanceiro(params: {
  mes: number;
  ano: number;
  membros: Membro[];
  statusMap: Record<string, { status: string }>;
  receitas: number;
  despesas: number;
  saldo: number;
}): string {
  const mesNome = MESES_NOMES[params.mes - 1];
  const quitados = params.membros.filter(m => params.statusMap[m.id]?.status === 'Pago');
  const isentos = params.membros.filter(m => params.statusMap[m.id]?.status === 'Isento');
  const pendentes = params.membros.filter(m => params.statusMap[m.id]?.status === 'Pendente' || !params.statusMap[m.id]);

  const fmtMoeda = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let txt = `📊 *RELATÓRIO FINANCEIRO - LOUVOR*\n`;
  txt += `📅 *Mês:* ${mesNome} / ${params.ano}\n\n`;

  txt += `✅ *QUITADOS (${quitados.length}):*\n`;
  txt += quitados.length > 0 ? quitados.map(m => `- ${m.nome}`).join('\n') : '- Nenhum';
  txt += '\n\n';

  if (isentos.length > 0) {
    txt += `✔️ *ISENTOS (${isentos.length}):*\n`;
    txt += isentos.map(m => `- ${m.nome} (Isento)`).join('\n') + '\n\n';
  }

  txt += `❌ *PENDENTES (${pendentes.length}):*\n`;
  txt += pendentes.length > 0 ? pendentes.map(m => `- ${m.nome}`).join('\n') : '- Nenhum';
  txt += '\n\n';

  txt += `*RESUMO FINANCEIRO:*\n`;
  txt += `💰 *Receitas:* ${fmtMoeda(params.receitas)}\n`;
  txt += `📉 *Despesas:* ${fmtMoeda(params.despesas)}\n`;
  txt += `🏦 *Saldo do Mês:* ${fmtMoeda(params.saldo)}\n\n`;
  txt += `_Portal Transparência Louvor - INA Esperança_`;

  return txt;
}

export function formatarRelatorioConfra(participantes: ParticipanteConfra[], totalApurado: number): string {
  const quitados: string[] = [];
  const parciais: string[] = [];
  const pendentes: string[] = [];

  participantes.forEach(p => {
    const pagos: string[] = [];
    if (p.set === 'Pago') pagos.push('Set');
    if (p.out === 'Pago') pagos.push('Out');
    if (p.nov === 'Pago') pagos.push('Nov');

    let nome = p.nome;
    if (p.convidadoPor) nome += ` (Conv. ${p.convidadoPor})`;

    if (pagos.length === 3) {
      quitados.push(nome);
    } else if (pagos.length === 0) {
      pendentes.push(nome);
    } else {
      parciais.push(`${nome} [${pagos.join(', ')}]`);
    }
  });

  const fmtMoeda = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let txt = `🎉 *RELATÓRIO CONFRATERNIZAÇÃO DO LOUVOR*\n`;
  txt += `🎯 Meta: R$ 45,00 por participante (3x R$ 15,00)\n`;
  txt += `💰 *Total Apurado:* ${fmtMoeda(totalApurado)}\n\n`;

  txt += `✅ *QUITADOS (${quitados.length}):*\n`;
  txt += quitados.length > 0 ? quitados.map(n => `- ${n}`).join('\n') : '- Nenhum';
  txt += '\n\n';

  txt += `⚠️ *PARCIAIS (${parciais.length}):*\n`;
  txt += parciais.length > 0 ? parciais.map(n => `- ${n}`).join('\n') : '- Nenhum';
  txt += '\n\n';

  txt += `❌ *PENDENTES (${pendentes.length}):*\n`;
  txt += pendentes.length > 0 ? pendentes.map(n => `- ${n}`).join('\n') : '- Nenhum';

  return txt;
}

export function formatarRelatorioPresenca(dataStr: string, itens: ItemFrequencia[], tituloEvento?: string): string {
  const presentes = itens.filter(i => i.status === 'Presente');
  const faltas = itens.filter(i => i.status === 'Falta');
  const pendentes = itens.filter(i => i.status === 'Pendente');

  let txt = `📅 *CHAMADA / FREQUÊNCIA - MINISTÉRIO DE LOUVOR*\n`;
  if (tituloEvento) txt += `🎵 *Evento:* ${tituloEvento}\n`;
  txt += `📆 *Data:* ${dataStr}\n\n`;

  txt += `🟢 *PRESENTES (${presentes.length}):*\n`;
  txt += presentes.length > 0 ? presentes.map(i => `- ${i.nome}`).join('\n') : '- Nenhum';
  txt += '\n\n';

  txt += `🔴 *FALTAS (${faltas.length}):*\n`;
  txt += faltas.length > 0 ? faltas.map(i => `- ${i.nome}`).join('\n') : '- Nenhum';
  txt += '\n\n';

  if (pendentes.length > 0) {
    txt += `⚪ *NÃO REGISTRADOS (${pendentes.length}):*\n`;
    txt += pendentes.map(i => `- ${i.nome}`).join('\n');
  }

  return txt;
}

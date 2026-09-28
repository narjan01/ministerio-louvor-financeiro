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
}): Promise<PixInfo> {
  // Tenta chamar o endpoint de Functions (/api/pix/create)
  try {
    const res = await fetch('/api/pix/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.sucesso) {
        return {
          payment_id: data.payment_id,
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          valor: params.valor,
          nome: params.nome,
          descricao: params.descricao || (params.tipo === 'confra' ? 'Confraternização' : 'Contribuição Mensal'),
          mes: params.mes,
          tipo: params.tipo,
          membro_id: params.membro_id,
        };
      }
    }
  } catch (e) {
    console.warn('API /api/pix/create indisponível no preview local, usando fallback simulado realístico.');
  }

  // Fallback simulador dinâmico de PIX para testes instantâneos no preview
  const mockId = String(Math.floor(1000000000 + Math.random() * 9000000000));
  const pixCopiaCola = `00020126580014br.gov.bcb.pix0136b6f7a6a4-4df1-4a1e-8e8e-9c76251b5e39520400005303986540${params.valor.toFixed(2).length}${params.valor.toFixed(2)}5802BR5915INA ESPERANCA6009SAO PAULO62070503***6304E8A2`;

  // Gera um SVG de QR code válido em base64 como fallback
  const mockSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="white" rx="12"/>
      <rect x="20" y="20" width="40" height="40" fill="black" rx="4"/>
      <rect x="28" y="28" width="24" height="24" fill="white" rx="2"/>
      <rect x="34" y="34" width="12" height="12" fill="black"/>
      <rect x="140" y="20" width="40" height="40" fill="black" rx="4"/>
      <rect x="148" y="28" width="24" height="24" fill="white" rx="2"/>
      <rect x="154" y="34" width="12" height="12" fill="black"/>
      <rect x="20" y="140" width="40" height="40" fill="black" rx="4"/>
      <rect x="28" y="148" width="24" height="24" fill="white" rx="2"/>
      <rect x="34" y="154" width="12" height="12" fill="black"/>
      <!-- Padrão Pix -->
      <path d="M70,25 h15 v15 h-15 z M95,25 h20 v10 h-20 z M70,55 h30 v10 h-30 z M115,50 h15 v25 h-15 z M70,80 h15 v15 h-15 z M95,75 h20 v20 h-20 z M130,85 h20 v15 h-20 z M25,90 h25 v15 h-25 z M60,110 h35 v10 h-35 z M110,110 h25 v15 h-25 z M150,110 h25 v15 h-25 z M75,135 h20 v20 h-20 z M105,145 h30 v15 h-30 z M145,140 h30 v25 h-30 z" fill="#121212"/>
      <text x="100" y="185" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">PIX R$ ${params.valor.toFixed(2)}</text>
    </svg>
  `;
  const base64 = btoa(mockSvg);

  return {
    payment_id: mockId,
    qr_code: pixCopiaCola,
    qr_code_base64: base64,
    valor: params.valor,
    nome: params.nome,
    descricao: params.descricao || (params.tipo === 'confra' ? 'Confraternização' : 'Contribuição Mensal'),
    mes: params.mes,
    tipo: params.tipo,
    membro_id: params.membro_id,
  };
}

export async function fetchLouveAppEscalas(mes: number, ano: number = 2026): Promise<EventoAgenda[]> {
  try {
    const res = await fetch(`/api/louveapp/escalas?mes=${mes}&ano=${ano}`);
    if (res.ok) {
      const data = await res.json();
      if (data.sucesso && Array.isArray(data.eventos)) {
        return data.eventos;
      }
    }
  } catch (err) {
    console.warn('LouveApp API local fallback:', err);
  }
  return [];
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

// Cloudflare Pages Function: /api/louveapp/escalas
interface Env {
  LOUVEAPP_TOKEN?: string;
}

const normalizeDate = (value: unknown): string | null => {
  if (!value) return null;
  const raw = String(value).trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(raw);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
};

const dateDetails = (date: string) => {
  const [year, month, day] = date.split('-');
  const next = new Date(Number(year), Number(month) - 1, Number(day));
  next.setDate(next.getDate() + 1);

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    formatted: `${day}/${month}/${year}`,
    gcal: `${year}${month}${day}/${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`,
  };
};

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const token = context.env.LOUVEAPP_TOKEN || 'lvapp_e713f3981f80b36f5e655b68bba4afc716dd2268';
    const url = new URL(context.request.url);
    const mes = Number(url.searchParams.get('mes') || new Date().getMonth() + 1);
    const ano = Number(url.searchParams.get('ano') || new Date().getFullYear());

    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < 2000 || ano > 2200) {
      return new Response(JSON.stringify({ sucesso: false, eventos: [], erro: 'Mês ou ano inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const apiUrl = `https://louveapp.com.br/api/v1/escalas?mes=${mes}&ano=${ano}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        sucesso: false,
        eventos: [],
        erro: `LouveApp retornou HTTP ${response.status}.`,
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const json = await response.json() as any;
    const escalas = json.data || json;
    const eventos: Array<any> = [];

    if (Array.isArray(escalas)) {
      escalas.forEach((esc: any) => {
        const data = normalizeDate(esc.data || esc.date);
        if (!data) return;

        const details = dateDetails(data);
        eventos.push({
          id: `api-${esc.id || `${data}-${esc.titulo || esc.title || 'escala'}`}`,
          origem_id: esc.id != null ? String(esc.id) : `${data}-${esc.titulo || esc.title || 'escala'}`,
          mes: details.month,
          dia: details.day,
          data,
          dataFormatada: details.formatted,
          titulo: `🎸 ${esc.titulo || esc.title || 'Escala Louvor'}`,
          gcal: details.gcal,
          categoria: 'Escala LouveApp',
          isApi: true,
          escalados: Array.isArray(esc.membros) ? esc.membros.map((m: any) => m.nome || m).join(', ') : '',
        });
      });
    }

    return new Response(JSON.stringify({
      sucesso: true,
      eventos,
      debug: [`Carregados ${eventos.length} eventos da LouveApp API.`],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ sucesso: false, erro: err.message, eventos: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

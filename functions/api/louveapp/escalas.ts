// Cloudflare Pages Function: /api/louveapp/escalas
interface Env {
  LOUVEAPP_TOKEN?: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const token = context.env.LOUVEAPP_TOKEN || 'lvapp_e713f3981f80b36f5e655b68bba4afc716dd2268';
    const url = new URL(context.request.url);
    const mes = url.searchParams.get('mes') || String(new Date().getMonth() + 1);
    const ano = url.searchParams.get('ano') || '2026';

    const apiUrl = `https://louveapp.com.br/api/v1/escalas?mes=${mes}&ano=${ano}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        sucesso: false,
        eventos: [],
        debug: [`HTTP Status: ${response.status}`, `Erro ao consultar API LouveApp`],
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
        const dataStr = esc.data || esc.date;
        if (dataStr) {
          const partes = dataStr.split('-');
          if (partes.length === 3) {
            const y = partes[0];
            const m = parseInt(partes[1], 10);
            const d = parseInt(partes[2].substring(0, 2), 10);
            const dataFormatada = `${('0' + d).slice(-2)}/${('0' + m).slice(-2)}/${y}`;
            const dt = new Date(Number(y), m - 1, d);
            dt.setDate(dt.getDate() + 1);
            const gcal = `${y}${partes[1]}${('0' + d).slice(-2)}/${dt.getFullYear()}${('0' + (dt.getMonth() + 1)).slice(-2)}${('0' + dt.getDate()).slice(-2)}`;

            eventos.push({
              id: `api-${esc.id || Math.random()}`,
              mes: m,
              dia: d,
              data: dataFormatada,
              titulo: `🎸 ${esc.titulo || esc.title || 'Escala Louvor'}`,
              gcal,
              categoria: 'Escala LouveApp',
              isApi: true,
              escalados: Array.isArray(esc.membros) ? esc.membros.map((m: any) => m.nome || m).join(', ') : '',
            });
          }
        }
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

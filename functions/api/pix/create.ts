// Cloudflare Pages Function: /api/pix/create
interface Env {
  MP_ACCESS_TOKEN?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const token = context.env.MP_ACCESS_TOKEN || 'APP_USR-257552080642721-072914-38a3d8757f07af7c456e0761e2fb5caa-70957177';
    const body = await context.request.json() as {
      nome: string;
      valor: number;
      descricao?: string;
      email?: string;
      tipo?: string;
      referencia?: string;
    };

    if (!body.nome || !body.valor) {
      return new Response(JSON.stringify({ sucesso: false, erro: 'Nome e valor são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const payload = {
      transaction_amount: Number(body.valor),
      payment_method_id: 'pix',
      description: body.descricao || (body.tipo === 'confra' ? `Confraternizacao - ${body.nome}` : `Contribuicao Louvor - ${body.nome}`),
      payer: {
        email: body.email || 'ministerio@louvor.com',
        first_name: body.nome.split(' ')[0] || body.nome,
        last_name: body.nome.split(' ').slice(1).join(' ') || 'Membro',
      },
    };

    const idempotencyKey = crypto.randomUUID();

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await mpResponse.json() as any;

    if (data.id && data.point_of_interaction) {
      return new Response(JSON.stringify({
        sucesso: true,
        payment_id: String(data.id),
        qr_code: data.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
        status: data.status,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      sucesso: false,
      erro: data.message || 'Erro ao comunicar com a API do Mercado Pago.',
      detalhes: data,
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ sucesso: false, erro: err.message || 'Erro interno no servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

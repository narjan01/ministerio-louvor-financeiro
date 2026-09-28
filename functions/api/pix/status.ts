// Cloudflare Pages Function: /api/pix/status
interface Env {
  MP_ACCESS_TOKEN?: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const token = context.env.MP_ACCESS_TOKEN || 'APP_USR-257552080642721-072914-38a3d8757f07af7c456e0761e2fb5caa-70957177';
    const url = new URL(context.request.url);
    const paymentId = url.searchParams.get('payment_id');

    if (!paymentId) {
      return new Response(JSON.stringify({ status: 'erro', erro: 'payment_id é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json() as any;

    return new Response(JSON.stringify({
      status: data.status || 'pending',
      status_detail: data.status_detail,
      date_approved: data.date_approved,
      id: data.id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'erro', erro: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

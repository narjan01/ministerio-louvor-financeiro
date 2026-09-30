// Cloudflare Pages Function: /api/pix/status
interface Env {
  MP_ACCESS_TOKEN?: string;
}

const responseJson = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const token = context.env.MP_ACCESS_TOKEN || 'APP_USR-257552080642721-072914-38a3d8757f07af7c456e0761e2fb5caa-70957177';
    const url = new URL(context.request.url);
    const paymentId = url.searchParams.get('payment_id')?.trim() || '';

    if (!/^\d{1,30}$/.test(paymentId)) {
      return responseJson({ status: 'erro', erro: 'payment_id inválido.' }, 400);
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => null) as any;

    if (!response.ok) {
      return responseJson({
        status: 'erro',
        erro: data?.message || `Mercado Pago retornou HTTP ${response.status}.`,
      }, response.status);
    }

    return responseJson({
      status: data?.status || 'pending',
      status_detail: data?.status_detail,
      date_approved: data?.date_approved,
      id: data?.id,
    });
  } catch (err: any) {
    return responseJson({ status: 'erro', erro: err.message || 'Erro interno no servidor.' }, 500);
  }
};

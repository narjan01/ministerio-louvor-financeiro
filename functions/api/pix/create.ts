// Cloudflare Pages Function: /api/pix/create
interface Env {
  MP_ACCESS_TOKEN?: string;
}

type PixRequest = {
  nome?: unknown;
  valor?: unknown;
  descricao?: unknown;
  email?: unknown;
  tipo?: unknown;
  membro_id?: unknown;
  mes?: unknown;
  ano?: unknown;
  parcelas?: unknown;
  referencia?: unknown;
};

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const responseJson = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: jsonHeaders,
});

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const token = context.env.MP_ACCESS_TOKEN || 'APP_USR-257552080642721-072914-38a3d8757f07af7c456e0761e2fb5caa-70957177';
    const body = await context.request.json() as PixRequest;
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const valor = typeof body.valor === 'number' ? body.valor : Number(body.valor);
    const descricao = typeof body.descricao === 'string' ? body.descricao.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const tipo = body.tipo === 'confra' ? 'confra' : 'mensal';

    if (!nome || nome.length > 120 || !Number.isFinite(valor) || valor <= 0 || valor > 100000) {
      return responseJson({ sucesso: false, erro: 'Nome e valor válido são obrigatórios.' }, 400);
    }

    const payerEmail = email || 'ministerio@louvor.com';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return responseJson({ sucesso: false, erro: 'E-mail do pagador inválido.' }, 400);
    }

    const externalReference = typeof body.referencia === 'string' && body.referencia.trim()
      ? body.referencia.trim().slice(0, 255)
      : `${tipo}:${String(body.membro_id || 'sem-membro')}:${String(body.mes || '')}:${String(body.ano || new Date().getFullYear())}:${crypto.randomUUID()}`;

    const payload = {
      transaction_amount: Number(valor.toFixed(2)),
      payment_method_id: 'pix',
      description: descricao || (tipo === 'confra' ? `Confraternização - ${nome}` : `Contribuição Louvor - ${nome}`),
      external_reference: externalReference,
      metadata: {
        tipo,
        membro_id: body.membro_id || null,
        mes: body.mes || null,
        ano: body.ano || new Date().getFullYear(),
        parcelas: Array.isArray(body.parcelas) ? body.parcelas : [],
      },
      payer: {
        email: payerEmail,
        first_name: nome.split(/\s+/)[0] || nome,
        last_name: nome.split(/\s+/).slice(1).join(' ') || 'Membro',
      },
    };

    const idempotencyKey = context.request.headers.get('X-Idempotency-Key') || crypto.randomUUID();
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await mpResponse.json().catch(() => null) as any;

    if (!mpResponse.ok || !data?.id || !data?.point_of_interaction?.transaction_data) {
      return responseJson({
        sucesso: false,
        erro: data?.message || 'Erro ao comunicar com a API do Mercado Pago.',
      }, mpResponse.ok ? 502 : mpResponse.status);
    }

    return responseJson({
      sucesso: true,
      payment_id: String(data.id),
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
      status: data.status,
      external_reference: externalReference,
    });
  } catch (err: any) {
    return responseJson({ sucesso: false, erro: err.message || 'Erro interno no servidor.' }, 500);
  }
};

export const onRequestOptions = async () => new Response(null, {
  status: 204,
  headers: {
    ...jsonHeaders,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
  },
});

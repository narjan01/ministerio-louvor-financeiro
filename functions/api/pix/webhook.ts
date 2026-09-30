// Cloudflare Pages Function: /api/pix/webhook
// Configure esta URL no painel do Mercado Pago e mantenha a service_role key
// somente como secret da Function. Ela nunca deve ser exposta ao frontend.
interface Env {
  MP_ACCESS_TOKEN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const jsonHeaders = { 'Content-Type': 'application/json' };
const responseJson = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: jsonHeaders,
});

const isUuid = (value: unknown) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value);

const dbHeaders = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
});

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const body = await context.request.json().catch(() => null) as any;
    const paymentId = String(body?.data?.id || body?.id || '').trim();

    if (!/^\d{1,30}$/.test(paymentId)) {
      return responseJson({ sucesso: false, erro: 'Identificador de pagamento inválido.' }, 400);
    }

    const mpToken = context.env.MP_ACCESS_TOKEN || 'APP_USR-257552080642721-072914-38a3d8757f07af7c456e0761e2fb5caa-70957177';
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });
    const payment = await paymentResponse.json().catch(() => null) as any;

    if (!paymentResponse.ok) {
      return responseJson({ sucesso: false, erro: payment?.message || 'Não foi possível validar o pagamento.' }, 502);
    }

    // Eventos pendentes também são reconhecidos para evitar reprocessamento inútil.
    if (payment.status !== 'approved') {
      return responseJson({ sucesso: true, processado: false, status: payment.status || 'pending' });
    }

    const supabaseUrl = context.env.SUPABASE_URL?.replace(/\/$/, '');
    const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return responseJson({ sucesso: false, erro: 'Supabase da Function não configurado.' }, 500);
    }

    const metadata = payment.metadata || {};
    const tipo = metadata.tipo;
    const membroId = String(metadata.membro_id || '');
    const dataPagamento = payment.date_approved || new Date().toISOString();

    if (tipo === 'mensal') {
      const mes = Number(metadata.mes);
      const ano = Number(metadata.ano || new Date().getFullYear());
      if (!isUuid(membroId) || !Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano)) {
        return responseJson({ sucesso: false, erro: 'Metadados da mensalidade inválidos.' }, 422);
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/mensalidades?on_conflict=membro_id,mes,ano`, {
        method: 'POST',
        headers: {
          ...dbHeaders(serviceRoleKey),
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify([{
          membro_id: membroId,
          mes,
          ano,
          status: 'Pago',
          valor: Number(payment.transaction_amount || 10),
          payment_id: String(payment.id),
          data_pagamento: dataPagamento,
        }]),
      });

      if (!response.ok) {
        return responseJson({ sucesso: false, erro: 'Não foi possível atualizar a mensalidade.' }, 502);
      }

      return responseJson({ sucesso: true, processado: true, tipo, payment_id: String(payment.id) });
    }

    if (tipo === 'confra') {
      if (!isUuid(membroId)) {
        return responseJson({ sucesso: false, erro: 'Participante da confraternização inválido.' }, 422);
      }

      const parcelas = Array.isArray(metadata.parcelas)
        ? metadata.parcelas.filter((parcela: unknown) => ['set', 'out', 'nov'].includes(String(parcela)))
        : [];
      const campos = {
        set: 'setembro_status',
        out: 'outubro_status',
        nov: 'novembro_status',
      } as const;

      for (const parcela of parcelas) {
        const response = await fetch(`${supabaseUrl}/rest/v1/confra_participantes?id=eq.${encodeURIComponent(membroId)}`, {
          method: 'PATCH',
          headers: { ...dbHeaders(serviceRoleKey), Prefer: 'return=minimal' },
          body: JSON.stringify({ [campos[parcela as keyof typeof campos]]: 'Pago' }),
        });
        if (!response.ok) {
          return responseJson({ sucesso: false, erro: 'Não foi possível atualizar a parcela da confraternização.' }, 502);
        }
      }

      return responseJson({ sucesso: true, processado: true, tipo, parcelas, payment_id: String(payment.id) });
    }

    return responseJson({ sucesso: true, processado: false, status: payment.status, motivo: 'Tipo de pagamento desconhecido.' });
  } catch (error: any) {
    return responseJson({ sucesso: false, erro: error?.message || 'Erro interno no webhook.' }, 500);
  }
};

export const onRequestOptions = async () => new Response(null, {
  status: 204,
  headers: {
    ...jsonHeaders,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
});

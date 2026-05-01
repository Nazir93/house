type BitrixLeadPayload = {
  name: string;
  phone: string;
  email?: string | null;
  service?: string | null;
  source?: string | null;
  pageUrl?: string | null;
  calcData?: unknown;
};

export async function sendBitrixLead(payload: BitrixLeadPayload) {
  const webhook = process.env.BITRIX_LEAD_WEBHOOK_URL?.trim();
  if (!webhook) return { skipped: true };

  const comments = [
    payload.service ? `Услуга: ${payload.service}` : null,
    payload.source ? `Источник: ${payload.source}` : null,
    payload.pageUrl ? `Страница: ${payload.pageUrl}` : null,
    payload.calcData ? `Данные расчета: ${JSON.stringify(payload.calcData)}` : null,
  ].filter(Boolean).join("\n");

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        TITLE: `Заявка с сайта: ${payload.name}`,
        NAME: payload.name,
        PHONE: [{ VALUE: payload.phone, VALUE_TYPE: "WORK" }],
        ...(payload.email ? { EMAIL: [{ VALUE: payload.email, VALUE_TYPE: "WORK" }] } : {}),
        COMMENTS: comments,
        SOURCE_ID: "WEB",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Bitrix lead webhook failed: ${res.status}`);
  }

  return { skipped: false };
}

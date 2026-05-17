import { formatDocumentSignedAtRu } from "@/lib/client-document-signed-date";
import type { ClientDocumentSignatureMethod } from "@prisma/client";

/** П. 8 ТЗ: уведомление админу при подписании клиентом по ЭП (пока выключено). */
export const ADMIN_NOTIFY_ON_CLIENT_ES_SIGN = false;

export function buildAdminDocumentClientSignedNotification(input: {
  filename: string;
  signedAt: Date;
}): { title: string; body: string } {
  const when = formatDocumentSignedAtRu(input.signedAt, { withTime: true });
  return {
    title: "Клиент подписал документ",
    body: `Клиент подписал документ: ${input.filename}. Дата подписания: ${when}.`,
  };
}

/** При ручном подписании в офисе админу уведомление не отправляется. */
export function shouldNotifyAdminOnClientDocumentSign(
  method: ClientDocumentSignatureMethod | null | undefined
): boolean {
  return method === "ES" && ADMIN_NOTIFY_ON_CLIENT_ES_SIGN;
}

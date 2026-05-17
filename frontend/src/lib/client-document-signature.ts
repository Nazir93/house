import type { ClientDocumentSignatureStatus } from "@prisma/client";
import { formatDocumentSignedAtRu } from "@/lib/client-document-signed-date";

export function documentSignatureLabel(status: ClientDocumentSignatureStatus): string {
  switch (status) {
    case "AWAITING_SIGNATURE":
      return "Ожидает подписания";
    case "SIGNED":
      return "Подписан";
    default:
      return "Ожидает ознакомления";
  }
}

/** Строка статуса в списке ЛК: «Подписан 15.05.2026» или «Ожидает подписания». */
export function formatDocumentClientStatusLine(
  status: ClientDocumentSignatureStatus,
  signedAt: Date | string | null | undefined
): string {
  if (status === "SIGNED" && signedAt) {
    return `Подписан ${formatDocumentSignedAtRu(signedAt)}`;
  }
  return documentSignatureLabel(status);
}

export function isDocumentSigned(status: ClientDocumentSignatureStatus): boolean {
  return status === "SIGNED";
}

/** После скачивания: «Ожидает ознакомления» → «Ожидает подписания». */
export function signatureStatusAfterClientDownload(
  status: ClientDocumentSignatureStatus
): ClientDocumentSignatureStatus | null {
  if (status === "AWAITING_REVIEW") return "AWAITING_SIGNATURE";
  return null;
}

export function documentSigningHint(status: ClientDocumentSignatureStatus): string {
  switch (status) {
    case "SIGNED":
      return "Документ подписан в офисе компании.";
    case "AWAITING_SIGNATURE":
      return "Ознакомьтесь с документом и подпишите его в офисе компании. После подписания администратор обновит статус в личном кабинете.";
    default:
      return "Скачайте документ и ознакомьтесь с ним. После скачивания статус изменится на «Ожидает подписания».";
  }
}

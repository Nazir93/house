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

export function documentSignatureBadgeClass(status: ClientDocumentSignatureStatus): string {
  const base = "inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-tight";
  switch (status) {
    case "SIGNED":
      return `${base} border-emerald-500/45 bg-emerald-500/15 text-emerald-300`;
    case "AWAITING_SIGNATURE":
      return `${base} border-amber-500/40 bg-amber-500/12 text-amber-200`;
    default:
      return `${base} border-white/15 bg-white/[0.06] text-white/65`;
  }
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

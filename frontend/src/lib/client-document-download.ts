import type { ClientDocumentSignatureStatus, Prisma } from "@prisma/client";
import { signatureStatusAfterClientDownload } from "@/lib/client-document-signature";

export type DocForDownload = {
  id: string;
  signatureStatus: ClientDocumentSignatureStatus;
  downloadedAt: Date | null;
};

/** Обновляет статус при первом скачивании клиентом (только AWAITING_REVIEW → AWAITING_SIGNATURE). */
export function clientDocumentDownloadUpdate(
  doc: DocForDownload,
  now: Date = new Date()
): Prisma.ClientDocumentUpdateInput | null {
  const nextStatus = signatureStatusAfterClientDownload(doc.signatureStatus);
  if (!nextStatus) return null;
  return {
    signatureStatus: nextStatus,
    downloadedAt: doc.downloadedAt ?? now,
  };
}

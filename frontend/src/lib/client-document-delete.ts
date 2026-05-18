import type { ClientNotificationType, Prisma } from "@prisma/client";
import type { DocumentNotificationPayload } from "@/lib/client-notification-messages";
import type { DocumentSignatureAnchor } from "@/lib/client-document-signature-sync";

export function documentRowMatchesDeleteAnchor(
  row: { url: string; filename: string; order: number },
  anchor: DocumentSignatureAnchor
): boolean {
  if (row.url === anchor.url) return true;
  return row.filename === anchor.filename && row.order === anchor.order;
}

export function parseDocumentNotificationPayload(payload: unknown): DocumentNotificationPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (p.kind !== "document" || typeof p.filename !== "string") return null;
  return {
    kind: "document",
    filename: p.filename,
    url: typeof p.url === "string" ? p.url : undefined,
    signingMode: p.signingMode === "es" ? "es" : "manual",
  };
}

/** Уведомление о документе, который админ удалил из кабинета. */
export function documentNotificationMatchesDeletedDoc(
  payload: unknown,
  anchor: { url: string; filename: string }
): boolean {
  const p = parseDocumentNotificationPayload(payload);
  if (!p) return false;
  if (p.url && p.url === anchor.url) return true;
  return p.filename.trim().toLowerCase() === anchor.filename.trim().toLowerCase();
}

export function selectDocumentIdsToDelete(
  rows: Array<{ id: string; url: string; filename: string; order: number }>,
  anchor: DocumentSignatureAnchor
): string[] {
  return rows.filter((r) => documentRowMatchesDeleteAnchor(r, anchor)).map((r) => r.id);
}

export function selectDocumentNotificationIdsToDelete(
  rows: Array<{ id: string; payload: unknown }>,
  anchor: { url: string; filename: string }
): string[] {
  return rows
    .filter((n) => documentNotificationMatchesDeletedDoc(n.payload, anchor))
    .map((n) => n.id);
}

type NotificationRow = {
  id: string;
  type: ClientNotificationType;
  payload: unknown;
};

/** Скрывает уведомления о документах, которых уже нет в опубликованном кабинете (п. 10 ТЗ). */
export function filterActiveClientNotifications<T extends NotificationRow>(
  notifications: T[],
  publishedDocuments: Array<{ url: string; filename: string }>
): T[] {
  const urls = new Set(publishedDocuments.map((d) => d.url));
  const filenames = new Set(publishedDocuments.map((d) => d.filename.trim().toLowerCase()));

  return notifications.filter((n) => {
    if (n.type !== "DOCUMENT_NEW") return true;
    const p = parseDocumentNotificationPayload(n.payload);
    if (!p) return false;
    if (p.url) return urls.has(p.url);
    return filenames.has(p.filename.trim().toLowerCase());
  });
}

type DocumentDeleteDb = Pick<Prisma.TransactionClient, "clientDocument" | "clientNotification">;

export async function deleteClientDocumentsByAnchor(
  db: DocumentDeleteDb,
  projectId: string,
  anchor: DocumentSignatureAnchor
): Promise<number> {
  const rows = await db.clientDocument.findMany({
    where: { projectId },
    select: { id: true, url: true, filename: true, order: true },
  });
  const ids = selectDocumentIdsToDelete(rows, anchor);
  if (ids.length === 0) return 0;
  await db.clientDocument.deleteMany({ where: { id: { in: ids } } });
  return ids.length;
}

export async function deleteDocumentNotificationsByAnchor(
  db: DocumentDeleteDb,
  projectId: string,
  anchor: { url: string; filename: string }
): Promise<number> {
  const rows = await db.clientNotification.findMany({
    where: { projectId, type: "DOCUMENT_NEW" },
    select: { id: true, payload: true },
  });
  const ids = selectDocumentNotificationIdsToDelete(rows, anchor);
  if (ids.length === 0) return 0;
  await db.clientNotification.deleteMany({ where: { id: { in: ids } } });
  return ids.length;
}

export async function deleteClientDocumentWithNotifications(
  db: DocumentDeleteDb,
  projectId: string,
  anchor: DocumentSignatureAnchor
): Promise<{ documentsDeleted: number; notificationsDeleted: number }> {
  const documentsDeleted = await deleteClientDocumentsByAnchor(db, projectId, anchor);
  const notificationsDeleted = await deleteDocumentNotificationsByAnchor(db, projectId, anchor);
  return { documentsDeleted, notificationsDeleted };
}

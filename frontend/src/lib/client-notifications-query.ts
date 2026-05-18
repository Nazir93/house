import { prisma } from "@/lib/db";
import { filterActiveClientNotifications } from "@/lib/client-document-delete";
import { publishedDocumentWhere } from "@/lib/client-portal-order";

/** Уведомления ЛК без «осиротевших» DOCUMENT_NEW (п. 10 ТЗ). */
export async function listClientNotificationsForCabinet(projectId: string, take = 100) {
  const [items, publishedDocuments] = await Promise.all([
    prisma.clientNotification.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.clientDocument.findMany({
      where: { projectId, ...publishedDocumentWhere },
      select: { url: true, filename: true },
    }),
  ]);

  const active = filterActiveClientNotifications(items, publishedDocuments);
  const unreadCount = active.filter((n) => n.readAt === null).length;

  return { items: active, unreadCount };
}

export async function countActiveUnreadNotifications(projectId: string): Promise<number> {
  const [unread, publishedDocuments] = await Promise.all([
    prisma.clientNotification.findMany({
      where: { projectId, readAt: null },
      select: { id: true, type: true, payload: true },
    }),
    prisma.clientDocument.findMany({
      where: { projectId, ...publishedDocumentWhere },
      select: { url: true, filename: true },
    }),
  ]);
  return filterActiveClientNotifications(unread, publishedDocuments).length;
}

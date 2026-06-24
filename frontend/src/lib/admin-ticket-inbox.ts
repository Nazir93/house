import type { ClientSupportTicketStatus, ClientTicketAuthorType } from "@prisma/client";

export type TicketMessageRow = {
  id: string;
  authorType: ClientTicketAuthorType | string;
  body: string;
  createdAt: Date | string;
};

export type AdminTicketRow = {
  id: string;
  subject: string;
  status: ClientSupportTicketStatus | string;
  staffLastReadAt: Date | string | null;
  updatedAt: Date | string;
  messages: TicketMessageRow[];
};

/** Последнее сообщение в тикете (хронологически). */
export function lastTicketMessage(messages: TicketMessageRow[]): TicketMessageRow | null {
  if (messages.length === 0) return null;
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[messages.length - 1];
}

/** Нужен ли ответ сотрудника: последнее сообщение от клиента и тикет не закрыт. */
export function ticketNeedsStaffReply(ticket: AdminTicketRow): boolean {
  if (ticket.status === "CLOSED") return false;
  const last = lastTicketMessage(ticket.messages);
  if (!last || last.authorType !== "CLIENT") return false;
  if (!ticket.staffLastReadAt) return true;
  return new Date(last.createdAt).getTime() > new Date(ticket.staffLastReadAt).getTime();
}

export function countTicketsNeedingStaffReply(tickets: AdminTicketRow[]): number {
  return tickets.filter(ticketNeedsStaffReply).length;
}

/** SQL COUNT — без загрузки сообщений (для polling админки). */
export async function countTicketsNeedingStaffReplyDb(): Promise<number> {
  const { prisma } = await import("@/lib/db");
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM "ClientSupportTicket" t
    WHERE t.status <> 'CLOSED'
      AND EXISTS (
        SELECT 1
        FROM "ClientSupportTicketMessage" m
        WHERE m."ticketId" = t.id
          AND m."authorType" = 'CLIENT'
          AND m."createdAt" = (
            SELECT MAX(m2."createdAt")
            FROM "ClientSupportTicketMessage" m2
            WHERE m2."ticketId" = t.id
          )
          AND (t."staffLastReadAt" IS NULL OR m."createdAt" > t."staffLastReadAt")
      )
  `;
  return rows[0]?.count ?? 0;
}

export function previewTicketBody(body: string, max = 120): string {
  const oneLine = body.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1)}…`;
}

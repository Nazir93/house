import type { ClientSupportTicketStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createClientNotifications } from "@/lib/client-notifications";
import { previewTicketBody } from "@/lib/admin-ticket-inbox";

export function parseAdminTicketStatus(v: unknown): ClientSupportTicketStatus | undefined {
  if (v === "OPEN" || v === "IN_PROGRESS" || v === "CLOSED") return v;
  return undefined;
}

export async function adminReplyToClientTicket(input: {
  projectId: string;
  ticketId: string;
  body: string;
  status?: ClientSupportTicketStatus;
}) {
  const ticket = await prisma.clientSupportTicket.findFirst({
    where: { id: input.ticketId, projectId: input.projectId },
  });
  if (!ticket) return { ok: false as const, error: "Обращение не найдено" };

  const text = input.body.trim();
  if (!text) return { ok: false as const, error: "Введите текст ответа" };

  const status: ClientSupportTicketStatus =
    input.status ?? (ticket.status === "CLOSED" ? "CLOSED" : "IN_PROGRESS");

  await prisma.$transaction(async (tx) => {
    await tx.clientTicketMessage.create({
      data: {
        ticketId: input.ticketId,
        authorType: "STAFF",
        body: text.slice(0, 8000),
      },
    });
    await tx.clientSupportTicket.update({
      where: { id: input.ticketId },
      data: {
        status,
        updatedAt: new Date(),
        staffLastReadAt: new Date(),
      },
    });
    await createClientNotifications(tx, input.projectId, [
      {
        type: "TICKET_REPLY",
        title: "Ответ по вашему обращению",
        body: previewTicketBody(text, 240),
        payload: { ticketId: input.ticketId, subject: ticket.subject },
      },
    ]);
  });

  const updated = await prisma.clientSupportTicket.findFirst({
    where: { id: input.ticketId, projectId: input.projectId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return { ok: true as const, ticket: updated };
}

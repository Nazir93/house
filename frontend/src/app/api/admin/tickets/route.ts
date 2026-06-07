import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { lastTicketMessage, previewTicketBody, ticketNeedsStaffReply } from "@/lib/admin-ticket-inbox";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const tickets = await prisma.clientSupportTicket.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        project: {
          select: {
            id: true,
            contractNumber: true,
            clientName: true,
            title: true,
          },
        },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => {
        const last = lastTicketMessage(t.messages);
        return {
          id: t.id,
          subject: t.subject,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          staffLastReadAt: t.staffLastReadAt?.toISOString() ?? null,
          needsStaffReply: ticketNeedsStaffReply(t),
          project: {
            id: t.project.id,
            contractNumber: t.project.contractNumber,
            clientName: t.project.clientName,
            title: t.project.title,
          },
          lastMessage: last
            ? {
                id: last.id,
                authorType: last.authorType,
                body: previewTicketBody(last.body, 160),
                createdAt:
                  last.createdAt instanceof Date
                    ? last.createdAt.toISOString()
                    : String(last.createdAt),
              }
            : null,
          messages: t.messages.map((m) => ({
            id: m.id,
            authorType: m.authorType,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          })),
        };
      }),
    });
  } catch (e) {
    console.error("[ADMIN TICKETS LIST]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

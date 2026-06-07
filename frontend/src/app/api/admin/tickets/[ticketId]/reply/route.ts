import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import {
  adminReplyToClientTicket,
  parseAdminTicketStatus,
} from "@/lib/client-ticket-admin-reply";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { ticketId } = await params;
  try {
    const ticket = await prisma.clientSupportTicket.findUnique({
      where: { id: ticketId },
      select: { projectId: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });
    }

    const body = await request.json();
    const text = String(body.body || body.message || "").trim();
    const result = await adminReplyToClientTicket({
      projectId: ticket.projectId,
      ticketId,
      body: text,
      status: parseAdminTicketStatus(body.status),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.ticket);
  } catch (e) {
    console.error("[ADMIN TICKET REPLY]", e);
    return NextResponse.json({ error: "Не удалось сохранить. Попробуйте позже" }, { status: 500 });
  }
}

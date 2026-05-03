import { NextRequest, NextResponse } from "next/server";
import type { ClientSupportTicketStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseTicketStatus(v: unknown): ClientSupportTicketStatus | undefined {
  if (v === "OPEN" || v === "IN_PROGRESS" || v === "CLOSED") return v;
  return undefined;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const { id: projectId, ticketId } = await params;
  try {
    const body = await request.json();
    const text = String(body.body || body.message || "").trim();
    if (!text) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }

    const ticket = await prisma.clientSupportTicket.findFirst({
      where: { id: ticketId, projectId },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextStatus = parseTicketStatus(body.status);
    const status: ClientSupportTicketStatus =
      nextStatus ?? (ticket.status === "CLOSED" ? "CLOSED" : "IN_PROGRESS");

    await prisma.$transaction([
      prisma.clientTicketMessage.create({
        data: {
          ticketId,
          authorType: "STAFF",
          body: text.slice(0, 8000),
        },
      }),
      prisma.clientSupportTicket.update({
        where: { id: ticketId },
        data: { status, updatedAt: new Date() },
      }),
    ]);

    const updated = await prisma.clientSupportTicket.findFirst({
      where: { id: ticketId, projectId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[ADMIN TICKET REPLY]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

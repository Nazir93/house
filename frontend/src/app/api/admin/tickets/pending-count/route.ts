import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { countTicketsNeedingStaffReply } from "@/lib/admin-ticket-inbox";

export const dynamic = "force-dynamic";

/** Тикеты, где последнее сообщение от клиента и ещё не просмотрено сотрудником. */
export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const tickets = await prisma.clientSupportTicket.findMany({
      where: { status: { not: "CLOSED" } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    const count = countTicketsNeedingStaffReply(tickets);
    return NextResponse.json({ count });
  } catch (e) {
    console.error("[ADMIN TICKETS PENDING COUNT]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

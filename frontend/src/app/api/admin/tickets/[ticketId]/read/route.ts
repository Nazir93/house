import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { ticketId } = await params;
  try {
    const ticket = await prisma.clientSupportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });
    }

    await prisma.clientSupportTicket.update({
      where: { id: ticketId },
      data: { staffLastReadAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN TICKET READ]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

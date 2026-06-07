import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import {
  adminReplyToClientTicket,
  parseAdminTicketStatus,
} from "@/lib/client-ticket-admin-reply";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId, ticketId } = await params;
  try {
    const body = await request.json();
    const text = String(body.body || body.message || "").trim();
    const result = await adminReplyToClientTicket({
      projectId,
      ticketId,
      body: text,
      status: parseAdminTicketStatus(body.status),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.error === "Обращение не найдено" ? 404 : 400 });
    }

    return NextResponse.json(result.ticket);
  } catch (e) {
    console.error("[ADMIN TICKET REPLY]", e);
    return NextResponse.json({ error: "Не удалось сохранить. Попробуйте позже" }, { status: 500 });
  }
}

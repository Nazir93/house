import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function projectIdFromSession(session: Session | null) {
  return session?.user?.role === "client" ? session.user.clientProjectId : undefined;
}

async function assertTicketAccess(ticketId: string, projectId: string) {
  const ticket = await prisma.clientSupportTicket.findFirst({
    where: { id: ticketId, projectId },
  });
  return ticket;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const projectId = projectIdFromSession(session);
  if (!projectId) {
    return NextResponse.json({ error: "Требуется вход в личный кабинет" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.clientSupportTicket.findFirst({
    where: { id, projectId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });
  }

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map((m) => ({
        id: m.id,
        authorType: m.authorType,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const projectId = projectIdFromSession(session);
  if (!projectId) {
    return NextResponse.json({ error: "Требуется вход в личный кабинет" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await assertTicketAccess(id, projectId);
  if (!ticket) {
    return NextResponse.json({ error: "Обращение не найдено" }, { status: 404 });
  }

  if (ticket.status === "CLOSED") {
    return NextResponse.json(
      { error: "Обращение закрыто — новые сообщения не принимаются" },
      { status: 400 }
    );
  }

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const message = body.message?.trim() ?? "";
  if (!message) {
    return NextResponse.json({ error: "Введите текст сообщения" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.clientTicketMessage.create({
      data: {
        ticketId: id,
        authorType: "CLIENT",
        body: message.slice(0, 8000),
      },
    }),
    prisma.clientSupportTicket.update({
      where: { id },
      data: {
        status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
        updatedAt: new Date(),
      },
    }),
  ]);

  const updated = await prisma.clientSupportTicket.findFirst({
    where: { id, projectId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({
    ticket: {
      id: updated!.id,
      subject: updated!.subject,
      status: updated!.status,
      messages: updated!.messages.map((m) => ({
        id: m.id,
        authorType: m.authorType,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

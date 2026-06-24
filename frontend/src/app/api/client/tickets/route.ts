import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyAdminClientTicketMessage } from "@/lib/admin-ticket-notify";
import { prisma } from "@/lib/db";
import { checkPublicRateLimitDb } from "@/lib/public-rate-limit-db";

function projectIdFromSession(session: Session | null) {
  return session?.user?.role === "client" ? session.user.clientProjectId : undefined;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const projectId = projectIdFromSession(session);
  if (!projectId) {
    return NextResponse.json({ error: "Требуется вход в личный кабинет" }, { status: 401 });
  }

  const tickets = await prisma.clientSupportTicket.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      messages: t.messages.map((m) => ({
        id: m.id,
        authorType: m.authorType,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const projectId = projectIdFromSession(session);
  if (!projectId) {
    return NextResponse.json({ error: "Требуется вход в личный кабинет" }, { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "client";
  if (
    !(await checkPublicRateLimitDb({
      scope: "client-ticket-create",
      key: `${projectId}:${ip}`,
      max: 10,
      windowMs: 15 * 60 * 1000,
    }))
  ) {
    return NextResponse.json({ error: "Слишком много обращений. Попробуйте позже." }, { status: 429 });
  }

  let body: { subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (!subject || !message) {
    return NextResponse.json({ error: "Укажите тему и текст сообщения" }, { status: 400 });
  }

  const ticket = await prisma.clientSupportTicket.create({
    data: {
      projectId,
      subject: subject.slice(0, 500),
      status: "OPEN",
      messages: {
        create: {
          authorType: "CLIENT",
          body: message.slice(0, 8000),
        },
      },
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      project: { select: { contractNumber: true, clientName: true } },
    },
  });

  void notifyAdminClientTicketMessage({
    contractNumber: ticket.project.contractNumber,
    clientName: ticket.project.clientName,
    subject: ticket.subject,
    messageBody: message,
    ticketId: ticket.id,
    isNewTicket: true,
  }).catch((e) => console.error("[CLIENT TICKET NOTIFY]", e));

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

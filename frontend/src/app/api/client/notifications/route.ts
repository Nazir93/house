import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { markClientNotificationsRead } from "@/lib/client-notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const projectId = session?.user?.role === "client" ? session.user.clientProjectId : undefined;
  if (!projectId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [items, unreadCount] = await Promise.all([
      prisma.clientNotification.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.clientNotification.count({ where: { projectId, readAt: null } }),
    ]);

    return NextResponse.json({
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        payload: n.payload,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (e) {
    console.error("[CLIENT NOTIFICATIONS GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const projectId = session?.user?.role === "client" ? session.user.clientProjectId : undefined;
  if (!projectId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
      : undefined;

    await markClientNotificationsRead(projectId, ids);
    const unreadCount = await prisma.clientNotification.count({
      where: { projectId, readAt: null },
    });

    return NextResponse.json({ ok: true, unreadCount });
  } catch (e) {
    console.error("[CLIENT NOTIFICATIONS POST]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

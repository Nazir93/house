import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { path, referer } = await request.json();
    if (!path) return NextResponse.json({ ok: true });

    const userAgent = request.headers.get("user-agent") || null;
    const refValue = referer || null;

    await prisma.errorLog.upsert({
      where: {
        path_referer: { path, referer: refValue || "" },
      },
      update: {
        count: { increment: 1 },
        lastSeen: new Date(),
        userAgent,
      },
      create: {
        path,
        referer: refValue,
        userAgent,
      },
    });
  } catch {
    // DB unavailable
  }

  return NextResponse.json({ ok: true });
}

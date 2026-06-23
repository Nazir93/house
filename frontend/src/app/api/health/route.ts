import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import os from "os";

/**
 * GET /api/health — быстрая проверка процесса (без БД).
 * GET /api/health?deep=1 — БД + очередь КП + память (для мониторинга).
 *
 * Если задан `HEALTH_CHECK_SECRET`, для `deep=1` нужен заголовок:
 * `Authorization: Bearer <HEALTH_CHECK_SECRET>`
 */
export async function GET(request: NextRequest) {
  const mem = process.memoryUsage();
  const base = {
    ok: true as boolean,
    service: "house-next",
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    memoryMb: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    },
    loadAvg: os.loadavg().map((v) => Math.round(v * 100) / 100),
  };

  const deep = request.nextUrl.searchParams.get("deep") === "1";
  if (!deep) {
    return NextResponse.json(base, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const secret = process.env.HEALTH_CHECK_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const pendingProposals = await prisma.lead.count({ where: { proposalStatus: "PENDING" } });
    return NextResponse.json(
      {
        ...base,
        db: true,
        pendingProposals,
        systemRamGb: Math.round((os.totalmem() / 1024 ** 3) * 10) / 10,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json(
      {
        ...base,
        ok: false,
        db: false,
        error: "database_unreachable",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health — быстрая проверка процесса (без БД).
 * GET /api/health?deep=1 — `SELECT 1` через Prisma (глубокая проверка для мониторинга).
 *
 * Если задан `HEALTH_CHECK_SECRET`, для `deep=1` нужен заголовок:
 * `Authorization: Bearer <HEALTH_CHECK_SECRET>`
 * (если секрет не задан — как в CI: глубокая проверка доступна без авторизации).
 */
export async function GET(request: NextRequest) {
  const base = {
    ok: true as boolean,
    service: "house-next",
    timestamp: new Date().toISOString(),
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
    return NextResponse.json(
      { ...base, db: true },
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimitDb } from "@/lib/public-rate-limit-db";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function normalizePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.length > 512) return null;
  return trimmed;
}

function normalizeOptional(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (
      !(await checkPublicRateLimitDb({
        scope: "log-404",
        key: ip,
        max: RATE_LIMIT_MAX,
        windowMs: RATE_LIMIT_WINDOW_MS,
      }))
    ) {
      return NextResponse.json({ ok: true });
    }

    const { path: rawPath, referer: rawReferer } = await request.json();
    const path = normalizePath(rawPath);
    if (!path) return NextResponse.json({ ok: true });

    const userAgent = normalizeOptional(request.headers.get("user-agent"), 256);
    const refValue = normalizeOptional(rawReferer, 512);

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
        referer: refValue ?? "",
        userAgent,
      },
    });
  } catch {
    // DB unavailable
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(key);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
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
    if (!checkRateLimit(clientIp(request))) return NextResponse.json({ ok: true });

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

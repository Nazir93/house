import { NextRequest, NextResponse } from "next/server";
import {
  cleanupE2eClientCabinet,
  seedE2eClientCabinet,
} from "@/lib/e2e-client-cabinet-seed";

export const dynamic = "force-dynamic";

function isE2eAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "production" && process.env.E2E_ENABLED !== "1") {
    return false;
  }
  const secret = process.env.E2E_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("x-e2e-secret") === secret;
}

/** POST — создать тестовый объект ЛК; DELETE — удалить. Только при E2E_SECRET. */
export async function POST(request: NextRequest) {
  if (!isE2eAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await seedE2eClientCabinet();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[E2E CLIENT CABINET SEED]", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isE2eAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await cleanupE2eClientCabinet();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[E2E CLIENT CABINET CLEANUP]", e);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

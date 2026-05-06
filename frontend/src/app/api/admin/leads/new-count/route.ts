import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

/** Количество заявок со статусом NEW (для бейджа в админке). */
export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const count = await prisma.lead.count({ where: { status: "NEW" } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[ADMIN LEADS NEW COUNT]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

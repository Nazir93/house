import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

/** Отклики на вакансии (лиды source=partner-vacancy) для экрана /admin/vacancies. */
export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const rows = await prisma.lead.findMany({
      where: { source: "partner-vacancy" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        service: true,
        calcData: true,
        createdAt: true,
        status: true,
      },
    });
    return NextResponse.json({
      responses: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[ADMIN VACANCY RESPONSES]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

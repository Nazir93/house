import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const errors = await prisma.errorLog.findMany({
      orderBy: { lastSeen: "desc" },
      take: 100,
    });
    return NextResponse.json(errors);
  } catch (error) {
    console.error("[ADMIN ERRORS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  try {
    if (id) {
      await prisma.errorLog.delete({ where: { id } });
    } else {
      await prisma.errorLog.deleteMany();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN ERROR DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

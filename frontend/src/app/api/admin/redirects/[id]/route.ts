import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.redirect.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN REDIRECT DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

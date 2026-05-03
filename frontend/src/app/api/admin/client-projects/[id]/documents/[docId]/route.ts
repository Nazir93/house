import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id: projectId, docId } = await params;
  try {
    const doc = await prisma.clientDocument.findFirst({
      where: { id: docId, projectId },
    });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.clientDocument.delete({ where: { id: docId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN CLIENT DOC DELETE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

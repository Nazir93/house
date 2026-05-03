import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id: projectId, photoId } = await params;
  try {
    const row = await prisma.clientPhotoReport.findFirst({
      where: { id: photoId, projectId },
    });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.clientPhotoReport.delete({ where: { id: photoId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN CLIENT PHOTO DELETE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

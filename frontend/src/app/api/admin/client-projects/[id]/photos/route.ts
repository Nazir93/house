import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId } = await params;
  try {
    const body = await request.json();
    const url = String(body.url || "").trim();
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }
    const project = await prisma.clientConstructionProject.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const count = await prisma.clientPhotoReport.count({ where: { projectId } });
    const photo = await prisma.clientPhotoReport.create({
      data: {
        projectId,
        url,
        caption: body.caption?.trim() || "",
        shotAt: body.shotAt ? new Date(String(body.shotAt)) : null,
        order: count,
      },
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (e) {
    console.error("[ADMIN CLIENT PHOTO CREATE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

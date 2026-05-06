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
    const filename = String(body.filename || "").trim();
    const url = String(body.url || "").trim();
    if (!filename || !url) {
      return NextResponse.json({ error: "filename and url required" }, { status: 400 });
    }
    const project = await prisma.clientConstructionProject.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const doc = await prisma.clientDocument.create({
      data: { projectId, filename, url },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    console.error("[ADMIN CLIENT DOC CREATE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

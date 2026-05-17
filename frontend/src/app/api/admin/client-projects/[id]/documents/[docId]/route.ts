import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveAdminDocumentPatch } from "@/lib/client-document-admin-patch";
import { touchDraftSavedAt } from "@/lib/client-project-draft-media";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

/** Ручная отметка «Подписан», дата и кто подписал (только администратор). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId, docId } = await params;
  try {
    const [doc, project] = await Promise.all([
      prisma.clientDocument.findFirst({ where: { id: docId, projectId } }),
      prisma.clientConstructionProject.findUnique({
        where: { id: projectId },
        select: { clientName: true },
      }),
    ]);
    if (!doc || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const plan = resolveAdminDocumentPatch(doc, body, {
      defaultClientName: project.clientName,
    });
    if ("error" in plan) {
      return NextResponse.json({ error: plan.error }, { status: plan.status });
    }

    if (plan.action === "update_signed_at") {
      const updated = await prisma.clientDocument.updateMany({
        where: { projectId, url: doc.url },
        data: {
          signedAt: plan.signedAt,
          ...(plan.signedByName ? { signedByName: plan.signedByName } : {}),
        },
      });
      if (updated.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const row = await prisma.clientDocument.findFirst({ where: { id: docId } });
      await touchDraftSavedAt(projectId);
      return NextResponse.json(row);
    }

    await prisma.clientDocument.updateMany({
      where: { projectId, url: doc.url },
      data: plan.data,
    });

    const updated = await prisma.clientDocument.findFirst({ where: { id: docId } });
    await touchDraftSavedAt(projectId);
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[ADMIN CLIENT DOC PATCH]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId, docId } = await params;
  try {
    const doc = await prisma.clientDocument.findFirst({
      where: { id: docId, projectId },
    });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.clientDocument.delete({ where: { id: docId } });
    await touchDraftSavedAt(projectId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN CLIENT DOC DELETE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

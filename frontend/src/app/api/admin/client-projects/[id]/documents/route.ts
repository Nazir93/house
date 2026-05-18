import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS } from "@/lib/client-document-admin-patch";
import { draftDocumentWhere, touchDraftSavedAt } from "@/lib/client-project-draft-media";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

async function nextDocumentOrder(projectId: string) {
  return prisma.clientDocument.count({ where: { projectId, ...draftDocumentWhere } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId } = await params;
  try {
    const body = await request.json();
    const project = await prisma.clientConstructionProject.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    type DocItem = { filename: string; url: string };
    const items: DocItem[] = Array.isArray(body.items)
      ? body.items
          .map((row: Record<string, unknown>) => ({
            filename: String(row.filename || "").trim(),
            url: String(row.url || "").trim(),
          }))
          .filter((row: DocItem) => row.filename && row.url)
      : body.filename && body.url
        ? [
            {
              filename: String(body.filename).trim(),
              url: String(body.url).trim(),
            },
          ]
        : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "filename and url required" }, { status: 400 });
    }

    const startOrder = await nextDocumentOrder(projectId);
    const created = await prisma.$transaction(
      items.map((item, i) =>
        prisma.clientDocument.create({
          data: {
            projectId,
            filename: item.filename,
            url: item.url,
            order: startOrder + i,
            isDraft: true,
            signatureStatus: DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS,
          },
        })
      )
    );

    await touchDraftSavedAt(projectId);
    return NextResponse.json(created.length === 1 ? created[0] : created, { status: 201 });
  } catch (e) {
    console.error("[ADMIN CLIENT DOC CREATE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

/** Сохранение порядка документов (drag-and-drop). */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId } = await params;
  try {
    const body = await request.json();
    const orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
      : [];

    if (orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
    }

    const existing = await prisma.clientDocument.findMany({
      where: { projectId, ...draftDocumentWhere },
      select: { id: true },
    });
    const existingSet = new Set(existing.map((r) => r.id));
    if (
      orderedIds.length !== existing.length ||
      orderedIds.some((id: string) => !existingSet.has(id))
    ) {
      return NextResponse.json({ error: "Invalid orderedIds" }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id: string, order: number) =>
        prisma.clientDocument.update({
          where: { id },
          data: { order },
        })
      )
    );

    const documents = await prisma.clientDocument.findMany({
      where: { projectId, ...draftDocumentWhere },
      orderBy: [{ order: "asc" }, { uploadedAt: "desc" }],
    });

    await touchDraftSavedAt(projectId);
    return NextResponse.json(documents);
  } catch (e) {
    console.error("[ADMIN CLIENT DOC REORDER]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

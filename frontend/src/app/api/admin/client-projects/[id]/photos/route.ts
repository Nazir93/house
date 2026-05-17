import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { draftPhotoWhere, touchDraftSavedAt } from "@/lib/client-project-draft-media";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

async function nextPhotoOrder(projectId: string) {
  return prisma.clientPhotoReport.count({ where: { projectId, ...draftPhotoWhere } });
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

    const urls: string[] = Array.isArray(body.urls)
      ? body.urls.map((u: unknown) => String(u || "").trim()).filter(Boolean)
      : body.url
        ? [String(body.url).trim()].filter(Boolean)
        : [];

    if (urls.length === 0) {
      return NextResponse.json({ error: "url or urls required" }, { status: 400 });
    }

    const startOrder = await nextPhotoOrder(projectId);
    const created = await prisma.$transaction(
      urls.map((url, i) =>
        prisma.clientPhotoReport.create({
          data: {
            projectId,
            url,
            caption: body.caption?.trim() || "",
            shotAt: body.shotAt ? new Date(String(body.shotAt)) : null,
            order: startOrder + i,
            isDraft: true,
          },
        })
      )
    );

    await touchDraftSavedAt(projectId);
    return NextResponse.json(created.length === 1 ? created[0] : created, { status: 201 });
  } catch (e) {
    console.error("[ADMIN CLIENT PHOTO CREATE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

/** Сохранение порядка фото (drag-and-drop). */
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

    const existing = await prisma.clientPhotoReport.findMany({
      where: { projectId, ...draftPhotoWhere },
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
        prisma.clientPhotoReport.update({
          where: { id },
          data: { order },
        })
      )
    );

    const photos = await prisma.clientPhotoReport.findMany({
      where: { projectId, ...draftPhotoWhere },
      orderBy: [{ order: "asc" }, { shotAt: "desc" }],
    });

    await touchDraftSavedAt(projectId);
    return NextResponse.json(photos);
  } catch (e) {
    console.error("[ADMIN CLIENT PHOTO REORDER]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

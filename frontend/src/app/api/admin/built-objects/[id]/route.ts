import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";
import {
  builtObjectSectionSavedResponse,
  builtObjectSectionUpdateData,
  parseBuiltObjectDraftSection,
} from "@/lib/built-object-admin-patch";
import { hasUnpublishedBuiltObjectSiteDraft } from "@/lib/built-object-admin-sections";

function selectPublishedMeta() {
  return {
    id: true,
    published: true,
    updatedAt: true,
    sitePublishedAt: true,
  };
}

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const object = await (prisma as any).builtObject.findUnique({
      where: { id: params.id },
      include: { media: { orderBy: [{ type: "asc" }, { order: "asc" }] }, houseProject: { select: { slug: true, title: true } } },
    });
    if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...object,
      hasUnpublishedDraft: hasUnpublishedBuiltObjectSiteDraft(object),
    });
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const section = parseBuiltObjectDraftSection(body);
    if (section === "main" && body.title !== undefined && !String(body.title ?? "").trim()) {
      return NextResponse.json({ error: "Укажите название объекта" }, { status: 400 });
    }

    const existing =
      body.published !== undefined
        ? await (prisma as any).builtObject.findUnique({
            where: { id: params.id },
            select: { published: true },
          })
        : null;

    const data = builtObjectSectionUpdateData(body, section);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет данных для сохранения" }, { status: 400 });
    }

    const object = await (prisma as any).builtObject.update({
      where: { id: params.id },
      data,
      select: selectPublishedMeta(),
    });

    if (body.published !== undefined && existing && existing.published !== object.published) {
      revalidatePublicConstructionCatalog();
    }

    return NextResponse.json({
      ...object,
      ok: true,
      savedSection: section,
      message: builtObjectSectionSavedResponse(section),
      hasUnpublishedDraft: hasUnpublishedBuiltObjectSiteDraft(object),
    });
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await (prisma as any).builtObject.delete({ where: { id: params.id } });
    revalidatePublicConstructionCatalog();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

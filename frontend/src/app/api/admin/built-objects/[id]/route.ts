import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";
import { builtObjectFormHasMediaPayload, builtObjectMediaCreatePayload } from "@/lib/built-object-admin-media";
import { builtObjectCoordinatesFromBody } from "@/lib/built-object-coordinates";

function n(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nf(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const s = String(value).trim().replace(",", ".");
  const parsed = parseFloat(s);
  return Number.isFinite(parsed) ? parsed : null;
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
    return NextResponse.json(object);
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
    const coords = builtObjectCoordinatesFromBody(body);
    const hasMedia = builtObjectFormHasMediaPayload(body);
    const object = await (prisma as any).builtObject.update({
      where: { id: params.id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.material !== undefined && { material: body.material }),
        ...(body.area !== undefined && { area: n(body.area) }),
        ...(body.buildTerm !== undefined && { buildTerm: body.buildTerm || null }),
        ...(body.foundation !== undefined && { foundation: body.foundation || null }),
        ...(body.walls !== undefined && { walls: body.walls || null }),
        ...(body.roof !== undefined && { roof: body.roof || null }),
        ...(body.floors !== undefined && { floors: nf(body.floors) }),
        ...(body.regionSlug !== undefined && { regionSlug: body.regionSlug?.trim() || null }),
        ...(body.district !== undefined && { district: body.district?.trim() || null }),
        ...(body.siteStatus !== undefined && {
          siteStatus: body.siteStatus === "UNDER_CONSTRUCTION" ? "UNDER_CONSTRUCTION" : "COMPLETED",
        }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(coords != null && { latitude: coords.latitude, longitude: coords.longitude }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.worksDescription !== undefined && { worksDescription: body.worksDescription || null }),
        ...(body.constructionHistoryJson !== undefined && {
          constructionHistoryJson: Array.isArray(body.constructionHistoryJson) ? body.constructionHistoryJson : null,
        }),
        ...(body.telegramUrl !== undefined && { telegramUrl: body.telegramUrl || null }),
        ...(body.vkUrl !== undefined && { vkUrl: body.vkUrl || null }),
        ...(body.houseProjectId !== undefined && { houseProjectId: body.houseProjectId || null }),
        ...(body.published !== undefined && { published: Boolean(body.published) }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
        ...(hasMedia && {
          media: {
            deleteMany: {},
            create: builtObjectMediaCreatePayload(body),
          },
        }),
      },
    });
    revalidatePublicConstructionCatalog();
    return NextResponse.json(object);
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

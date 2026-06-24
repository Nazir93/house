import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import {
  builtObjectSectionSavedResponse,
  builtObjectSectionUpdateData,
  n,
  nf,
  ni,
  parseBuiltObjectDraftSection,
} from "@/lib/built-object-admin-patch";
import { builtObjectCoordinatesFromBody } from "@/lib/built-object-coordinates";
import { hasUnpublishedBuiltObjectSiteDraft } from "@/lib/built-object-admin-sections";

export const dynamic = "force-dynamic";

const builtObjectCreateMainSchema = z.object({
  title: z.string().trim().min(1, "Укажите название объекта"),
});

function selectPublishedMeta() {
  return {
    id: true,
    published: true,
    updatedAt: true,
    sitePublishedAt: true,
  };
}

export async function GET(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const search = request.nextUrl.searchParams.get("search")?.trim();
  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10) || 100, 1), 200) : undefined;
  try {
    const objects = await (prisma as any).builtObject.findMany({
      where: search ? { title: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      ...(limit ? { take: limit } : {}),
      include: { media: { orderBy: [{ type: "asc" }, { order: "asc" }] }, houseProject: { select: { slug: true, title: true } } },
    });
    return NextResponse.json(objects);
  } catch (error) {
    console.error("[ADMIN BUILT OBJECTS]", error);
    return NextResponse.json({ error: "DB error. Run prisma db push after schema update." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const section = parseBuiltObjectDraftSection(body);
    if (section !== "main") {
      return NextResponse.json({ error: "Сначала сохраните раздел «Основное»" }, { status: 400 });
    }
    const parsedMain = builtObjectCreateMainSchema.safeParse(body);
    if (!parsedMain.success) {
      return NextResponse.json(
        { error: parsedMain.error.flatten().fieldErrors.title?.[0] || "Некорректные данные" },
        { status: 400 }
      );
    }

    const coords = builtObjectCoordinatesFromBody(body);
    const object = await (prisma as any).builtObject.create({
      data: {
        slug: body.slug?.trim() || generateSlug(body.title || "built-object"),
        title: parsedMain.data.title || body.title || "Построенный дом",
        material: body.material || "GAS_BLOCK",
        area: n(body.area),
        rooms: ni(body.rooms),
        bathrooms: ni(body.bathrooms),
        buildTerm: body.buildTerm || null,
        foundation: body.foundation || null,
        walls: body.walls || null,
        roof: body.roof || null,
        floors: nf(body.floors),
        regionSlug: body.regionSlug?.trim() || null,
        district: body.district?.trim() || null,
        siteStatus: body.siteStatus === "UNDER_CONSTRUCTION" ? "UNDER_CONSTRUCTION" : "COMPLETED",
        location: body.location || null,
        latitude: coords?.latitude ?? n(body.latitude),
        longitude: coords?.longitude ?? n(body.longitude),
        description: body.description || "",
        worksDescription: body.worksDescription || null,
        houseProjectId: body.houseProjectId || null,
        published: false,
        order: Number(body.order) || 0,
      },
      select: selectPublishedMeta(),
    });

    return NextResponse.json(
      {
        ...object,
        ok: true,
        savedSection: section,
        message: builtObjectSectionSavedResponse(section),
        hasUnpublishedDraft: hasUnpublishedBuiltObjectSiteDraft(object),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

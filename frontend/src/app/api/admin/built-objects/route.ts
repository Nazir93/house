import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";
import { builtObjectMediaCreatePayload } from "@/lib/built-object-admin-media";
import { builtObjectCoordinatesFromBody } from "@/lib/built-object-coordinates";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const search = request.nextUrl.searchParams.get("search")?.trim();
  try {
    const objects = await (prisma as any).builtObject.findMany({
      where: search ? { title: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
    const coords = builtObjectCoordinatesFromBody(body);
    const object = await (prisma as any).builtObject.create({
      data: {
        slug: body.slug?.trim() || generateSlug(body.title || "built-object"),
        title: body.title || "Построенный дом",
        material: body.material || "GAS_BLOCK",
        area: n(body.area),
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
        telegramUrl: body.telegramUrl || null,
        vkUrl: body.vkUrl || null,
        houseProjectId: body.houseProjectId || null,
        published: Boolean(body.published),
        order: Number(body.order) || 0,
        media: {
          create: builtObjectMediaCreatePayload(body),
        },
      },
    });
    revalidatePublicConstructionCatalog();
    return NextResponse.json(object, { status: 201 });
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

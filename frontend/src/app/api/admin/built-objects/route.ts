import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";

export const dynamic = "force-dynamic";

function n(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mediaCreate(urls: unknown, type: "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO") {
  const list = Array.isArray(urls) ? urls : typeof urls === "string" ? urls.split("\n") : [];
  return list.map(String).map((url) => url.trim()).filter(Boolean).map((url, order) => ({ type, url, order }));
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
        floors: n(body.floors),
        location: body.location || null,
        latitude: n(body.latitude),
        longitude: n(body.longitude),
        description: body.description || "",
        worksDescription: body.worksDescription || null,
        telegramUrl: body.telegramUrl || null,
        vkUrl: body.vkUrl || null,
        houseProjectId: body.houseProjectId || null,
        published: Boolean(body.published),
        order: Number(body.order) || 0,
        media: {
          create: [
            ...mediaCreate(body.renders, "RENDER"),
            ...mediaCreate(body.plans, "PLAN"),
            ...mediaCreate(body.stages, "BUILD_STAGE"),
            ...mediaCreate(body.videos, "VIDEO"),
          ],
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

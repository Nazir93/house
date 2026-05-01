import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function n(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mediaCreate(urls: unknown, type: "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO") {
  const list = Array.isArray(urls) ? urls : typeof urls === "string" ? urls.split("\n") : [];
  return list.map(String).map((url) => url.trim()).filter(Boolean).map((url, order) => ({ type, url, order }));
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const hasMedia = body.renders !== undefined || body.plans !== undefined || body.stages !== undefined || body.videos !== undefined;
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
        ...(body.floors !== undefined && { floors: n(body.floors) }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.latitude !== undefined && { latitude: n(body.latitude) }),
        ...(body.longitude !== undefined && { longitude: n(body.longitude) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.worksDescription !== undefined && { worksDescription: body.worksDescription || null }),
        ...(body.telegramUrl !== undefined && { telegramUrl: body.telegramUrl || null }),
        ...(body.vkUrl !== undefined && { vkUrl: body.vkUrl || null }),
        ...(body.houseProjectId !== undefined && { houseProjectId: body.houseProjectId || null }),
        ...(body.published !== undefined && { published: Boolean(body.published) }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
        ...(hasMedia && {
          media: {
            deleteMany: {},
            create: [
              ...mediaCreate(body.renders, "RENDER"),
              ...mediaCreate(body.plans, "PLAN"),
              ...mediaCreate(body.stages, "BUILD_STAGE"),
              ...mediaCreate(body.videos, "VIDEO"),
            ],
          },
        }),
      },
    });
    return NextResponse.json(object);
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await (prisma as any).builtObject.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

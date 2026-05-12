import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";

function numberOrNull(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOr(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function jsonOrNull(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const project = await (prisma as any).houseProject.findUnique({
      where: { id: params.id },
      include: {
        media: { orderBy: [{ type: "asc" }, { order: "asc" }] },
        builtObjects: { select: { id: true, title: true, slug: true } },
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error("[ADMIN HOUSE PROJECT GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const mediaPatch =
      Array.isArray(body.renders) || Array.isArray(body.plans)
        ? {
            deleteMany: {},
            create: [
              ...(Array.isArray(body.renders) ? body.renders : [])
                .filter(Boolean)
                .map((url: string, index: number) => ({
                  type: "RENDER",
                  url,
                  alt: body.title || "",
                  order: index,
                })),
              ...(Array.isArray(body.plans) ? body.plans : [])
                .filter((item: any) => item?.url)
                .map((item: any, index: number) => ({
                  type: "PLAN",
                  url: item.url,
                  alt: item.alt || body.title || "",
                  label: item.label || null,
                  floor: numberOrNull(item.floor),
                  order: index,
                })),
            ],
          }
        : undefined;

    const project = await (prisma as any).houseProject.update({
      where: { id: params.id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.floors !== undefined && { floors: numberOr(body.floors, 1) }),
        ...(body.area !== undefined && { area: numberOr(body.area, 0) }),
        ...(body.price !== undefined && { price: numberOr(body.price, 0) }),
        ...(body.rooms !== undefined && { rooms: numberOr(body.rooms, 0) }),
        ...(body.bathrooms !== undefined && { bathrooms: numberOr(body.bathrooms, 0) }),
        ...(body.materials !== undefined && { materials: stringArray(body.materials) }),
        ...(body.isNew !== undefined && { isNew: Boolean(body.isNew) }),
        ...(body.pricePromo !== undefined && { pricePromo: body.pricePromo || null }),
        ...(body.mortgageEnabled !== undefined && { mortgageEnabled: Boolean(body.mortgageEnabled) }),
        ...(body.mortgageMode !== undefined && { mortgageMode: body.mortgageMode === "CALCULATOR" ? "CALCULATOR" : "LEAD" }),
        ...(body.published !== undefined && { published: Boolean(body.published) }),
        ...(body.order !== undefined && { order: numberOr(body.order, 0) }),
        ...(body.completionJson !== undefined && { completionJson: jsonOrNull(body.completionJson) }),
        ...(body.constructionJson !== undefined && { constructionJson: jsonOrNull(body.constructionJson) }),
        ...(body.anchorsJson !== undefined && { anchorsJson: jsonOrNull(body.anchorsJson) }),
        ...(body.heroPricingJson !== undefined && { heroPricingJson: jsonOrNull(body.heroPricingJson) }),
        ...(body.calculatorJson !== undefined && { calculatorJson: jsonOrNull(body.calculatorJson) }),
        ...(mediaPatch && { media: mediaPatch }),
      },
    });
    revalidatePublicConstructionCatalog();
    return NextResponse.json(project);
  } catch (error) {
    console.error("[ADMIN HOUSE PROJECT UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await (prisma as any).houseProject.delete({ where: { id: params.id } });
    revalidatePublicConstructionCatalog();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN HOUSE PROJECT DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

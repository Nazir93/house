import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim();

  try {
    const projects = await (prisma as any).houseProject.findMany({
      where: search ? { title: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        media: { orderBy: [{ type: "asc" }, { order: "asc" }] },
        builtObjects: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[ADMIN HOUSE PROJECTS]", error);
    return NextResponse.json({ error: "DB error. Run prisma db push after schema update." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug?.trim() || generateSlug(body.title || "project");
    const renders = Array.isArray(body.renders) ? body.renders : [];
    const plans = Array.isArray(body.plans) ? body.plans : [];

    const project = await (prisma as any).houseProject.create({
      data: {
        slug,
        title: body.title || "Новый проект",
        shortDescription: body.shortDescription || "",
        description: body.description || "",
        floors: numberOr(body.floors, 1),
        area: numberOr(body.area, 100),
        price: numberOr(body.price, 0),
        rooms: numberOr(body.rooms, 3),
        bathrooms: numberOr(body.bathrooms, 1),
        materials: stringArray(body.materials),
        isNew: Boolean(body.isNew),
        pricePromo: body.pricePromo?.trim() || null,
        mortgageEnabled: body.mortgageEnabled ?? true,
        mortgageMode: body.mortgageMode === "CALCULATOR" ? "CALCULATOR" : "LEAD",
        published: Boolean(body.published),
        order: numberOr(body.order, 0),
        completionJson: jsonOrNull(body.completionJson),
        constructionJson: jsonOrNull(body.constructionJson),
        anchorsJson: jsonOrNull(body.anchorsJson),
        media: {
          create: [
            ...renders.filter(Boolean).map((url: string, index: number) => ({
              type: "RENDER",
              url,
              alt: body.title || "",
              order: index,
            })),
            ...plans.filter((item: any) => item?.url).map((item: any, index: number) => ({
              type: "PLAN",
              url: item.url,
              alt: item.alt || body.title || "",
              label: item.label || null,
              floor: item.floor ? numberOr(item.floor, index + 1) : null,
              order: index,
            })),
          ],
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[ADMIN HOUSE PROJECT CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

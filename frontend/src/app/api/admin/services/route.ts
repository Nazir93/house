import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureDefaultServicePageMetaIfNeeded } from "@/lib/seed-default-page-meta";
import { ensureDefaultServicesIfNeeded } from "@/lib/seed-default-services";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  try {
    await ensureDefaultServicesIfNeeded();
    await ensureDefaultServicePageMetaIfNeeded();
    const services = await prisma.service.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("[ADMIN SERVICES]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      shortDescription,
      serviceType,
      icon,
      coverImage,
      videoUrl,
      bannerImageDesktop,
      bannerImageMobile,
      published,
      order,
    } = body;

    if (!title || !shortDescription || !serviceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let slug = body.slug || generateSlug(title);
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const service = await prisma.service.create({
      data: {
        slug,
        title,
        shortDescription,
        serviceType,
        icon: icon || "zap",
        coverImage: coverImage || null,
        videoUrl: videoUrl || null,
        bannerImageDesktop: bannerImageDesktop ?? null,
        bannerImageMobile: bannerImageMobile ?? null,
        published: published ?? true,
        order: order ?? 0,
      } as unknown as Prisma.ServiceCreateInput,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[ADMIN SERVICE CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

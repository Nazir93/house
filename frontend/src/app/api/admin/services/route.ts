import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  CODE_OWNED_SERVICE_TYPE,
  isCodeOwnedAdminService,
} from "@/lib/admin-managed-services";
import { revalidatePublicServices } from "@/lib/revalidate-public-content";
import { ensureDefaultServicePageMetaIfNeeded } from "@/lib/seed-default-page-meta";
import { ensureDefaultServicesIfNeeded } from "@/lib/seed-default-services";
import { generateSlug } from "@/lib/utils";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await ensureDefaultServicesIfNeeded();
    await ensureDefaultServicePageMetaIfNeeded();
    const services = await prisma.service.findMany({
      where: {
        NOT: {
          OR: [{ slug: "proektirovanie" }, { serviceType: CODE_OWNED_SERVICE_TYPE }],
        },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("[ADMIN SERVICES]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

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
    if (isCodeOwnedAdminService({ slug, serviceType })) {
      return NextResponse.json(
        { error: "Проектирование ведётся в коде сайта и не редактируется в CMS услуг" },
        { status: 400 },
      );
    }

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

    revalidatePublicServices(service.slug);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[ADMIN SERVICE CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

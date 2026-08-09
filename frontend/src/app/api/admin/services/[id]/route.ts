import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isCodeOwnedAdminService } from "@/lib/admin-managed-services";
import { mergeServiceTitleIntoLandingJson } from "@/lib/merge-service-title-into-landing";
import { revalidatePublicServices } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";

const CODE_OWNED_ADMIN_ERROR =
  "Проектирование ведётся в коде сайта и не редактируется в CMS услуг";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const service = await prisma.service.findUnique({ where: { id: params.id } });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (isCodeOwnedAdminService(service)) {
      return NextResponse.json({ error: CODE_OWNED_ADMIN_ERROR, codeOwned: true }, { status: 403 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error("[ADMIN SERVICE GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      select: { slug: true, serviceType: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (isCodeOwnedAdminService(existing)) {
      return NextResponse.json({ error: CODE_OWNED_ADMIN_ERROR }, { status: 403 });
    }

    const body = await request.json();
    if (
      isCodeOwnedAdminService({
        slug: body.slug !== undefined ? body.slug : existing.slug,
        serviceType: body.serviceType !== undefined ? body.serviceType : existing.serviceType,
      })
    ) {
      return NextResponse.json({ error: CODE_OWNED_ADMIN_ERROR }, { status: 400 });
    }

    let landingJsonOut: unknown = body.landingJson;
    if (
      body.title !== undefined &&
      landingJsonOut !== undefined &&
      landingJsonOut !== null &&
      typeof body.title === "string"
    ) {
      landingJsonOut = mergeServiceTitleIntoLandingJson(landingJsonOut, body.title.trim());
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.serviceType !== undefined && { serviceType: body.serviceType }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        ...(body.bannerImageDesktop !== undefined && { bannerImageDesktop: body.bannerImageDesktop }),
        ...(body.bannerImageMobile !== undefined && { bannerImageMobile: body.bannerImageMobile }),
        ...(body.published !== undefined && { published: body.published }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.landingJson !== undefined && { landingJson: landingJsonOut }),
      } as unknown as Prisma.ServiceUpdateInput,
    });
    revalidatePublicServices(service.slug);
    return NextResponse.json(service);
  } catch (error) {
    console.error("[ADMIN SERVICE UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      select: { slug: true, serviceType: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (isCodeOwnedAdminService(existing)) {
      return NextResponse.json({ error: CODE_OWNED_ADMIN_ERROR }, { status: 403 });
    }
    await prisma.service.delete({ where: { id: params.id } });
    revalidatePublicServices(existing.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN SERVICE DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

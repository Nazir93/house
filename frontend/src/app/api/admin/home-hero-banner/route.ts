import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { HOME_HERO_BANNER_SETTINGS_KEY } from "@/lib/home-hero-banner-config";
import {
  DEFAULT_HOME_HERO_BANNER,
  homeHeroBannerSchema,
  parseHomeHeroBanner,
  type HomeHeroBanner,
} from "@/lib/home-hero-banner-schema";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: HOME_HERO_BANNER_SETTINGS_KEY },
    });
    if (!row?.value?.trim()) {
      return NextResponse.json(DEFAULT_HOME_HERO_BANNER satisfies HomeHeroBanner);
    }
    try {
      const parsed = JSON.parse(row.value) as unknown;
      return NextResponse.json(parseHomeHeroBanner(parsed));
    } catch {
      return NextResponse.json(DEFAULT_HOME_HERO_BANNER);
    }
  } catch (e) {
    console.error("[ADMIN HOME HERO BANNER GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body: unknown = await request.json();
    const validated = homeHeroBannerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    await prisma.siteSettings.upsert({
      where: { key: HOME_HERO_BANNER_SETTINGS_KEY },
      update: { value: JSON.stringify(validated.data) },
      create: { key: HOME_HERO_BANNER_SETTINGS_KEY, value: JSON.stringify(validated.data) },
    });

    revalidateTagWithProfile("home-hero-banner");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[ADMIN HOME HERO BANNER PUT]", e);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}

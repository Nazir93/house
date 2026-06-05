import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";
import {
  DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS,
  normalizeDesignProjectPricingSettings,
} from "@/lib/design-project-pricing";
import {
  DESIGN_PROJECT_PRICING_CACHE_TAG,
  DESIGN_PROJECT_PRICING_SETTINGS_KEY,
  getDesignProjectPricingSettings,
} from "@/lib/design-project-pricing-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;
  return NextResponse.json(await getDesignProjectPricingSettings());
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const settings = normalizeDesignProjectPricingSettings(body);
    await prisma.siteSettings.upsert({
      where: { key: DESIGN_PROJECT_PRICING_SETTINGS_KEY },
      create: { key: DESIGN_PROJECT_PRICING_SETTINGS_KEY, value: JSON.stringify(settings) },
      update: { value: JSON.stringify(settings) },
    });
    revalidateTagWithProfile(DESIGN_PROJECT_PRICING_CACHE_TAG);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[ADMIN DESIGN PROJECT PRICING UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.siteSettings.deleteMany({ where: { key: DESIGN_PROJECT_PRICING_SETTINGS_KEY } });
    revalidateTagWithProfile(DESIGN_PROJECT_PRICING_CACHE_TAG);
    return NextResponse.json(DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS);
  } catch (error) {
    console.error("[ADMIN DESIGN PROJECT PRICING RESET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

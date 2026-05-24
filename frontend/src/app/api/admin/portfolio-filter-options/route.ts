import { NextRequest, NextResponse } from "next/server";
import {
  PORTFOLIO_FILTER_OPTIONS_SETTINGS_KEY,
  parsePortfolioFilterOptionsConfig,
  serializePortfolioFilterOptionsConfig,
  type PortfolioFilterOptionsConfig,
} from "@/lib/portfolio-filter-options";
import { prisma } from "@/lib/db";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";
import { CACHE_TAG_PORTFOLIO_FILTER_OPTIONS } from "@/lib/cache-tags-public";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: PORTFOLIO_FILTER_OPTIONS_SETTINGS_KEY },
    });
    return NextResponse.json(parsePortfolioFilterOptionsConfig(row?.value));
  } catch (e) {
    console.error("[ADMIN PORTFOLIO FILTER OPTIONS GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as PortfolioFilterOptionsConfig;
    const config = parsePortfolioFilterOptionsConfig(
      serializePortfolioFilterOptionsConfig({
        customMaterials: body.customMaterials ?? [],
        customFloors: body.customFloors ?? [],
      })
    );

    await prisma.siteSettings.upsert({
      where: { key: PORTFOLIO_FILTER_OPTIONS_SETTINGS_KEY },
      update: { value: serializePortfolioFilterOptionsConfig(config) },
      create: { key: PORTFOLIO_FILTER_OPTIONS_SETTINGS_KEY, value: serializePortfolioFilterOptionsConfig(config) },
    });

    revalidateTagWithProfile(CACHE_TAG_PORTFOLIO_FILTER_OPTIONS);

    return NextResponse.json(config);
  } catch (e) {
    console.error("[ADMIN PORTFOLIO FILTER OPTIONS PUT]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

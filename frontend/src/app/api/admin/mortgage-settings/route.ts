import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";
import {
  mortgagePageSettingsSchema,
  DEFAULT_MORTGAGE_PAGE_SETTINGS,
  type MortgagePageSettings,
} from "@/lib/mortgage-settings-schema";
import { MORTGAGE_PAGE_SETTINGS_KEY } from "@/lib/mortgage-settings-config";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: MORTGAGE_PAGE_SETTINGS_KEY },
    });
    if (!row?.value?.trim()) {
      return NextResponse.json(DEFAULT_MORTGAGE_PAGE_SETTINGS as MortgagePageSettings);
    }
    try {
      const parsed = JSON.parse(row.value) as unknown;
      const validated = mortgagePageSettingsSchema.safeParse(parsed);
      return NextResponse.json(
        validated.success ? validated.data : DEFAULT_MORTGAGE_PAGE_SETTINGS
      );
    } catch {
      return NextResponse.json(DEFAULT_MORTGAGE_PAGE_SETTINGS);
    }
  } catch (e) {
    console.error("[ADMIN MORTGAGE SETTINGS GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body: unknown = await request.json();
    const validated = mortgagePageSettingsSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    await prisma.siteSettings.upsert({
      where: { key: MORTGAGE_PAGE_SETTINGS_KEY },
      update: { value: JSON.stringify(validated.data) },
      create: { key: MORTGAGE_PAGE_SETTINGS_KEY, value: JSON.stringify(validated.data) },
    });

    revalidateTagWithProfile("mortgage-page-settings");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[ADMIN MORTGAGE SETTINGS PUT]", e);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}

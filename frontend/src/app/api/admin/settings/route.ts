import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { HOUSE_CONSTRUCTION_CALCULATOR_SETTINGS_KEY } from "@/lib/house-construction-calculator-config";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const settings = await prisma.siteSettings.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error("[ADMIN SETTINGS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body: Record<string, string> = await request.json();

    const operations = Object.entries(body).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(operations);

    if (Object.prototype.hasOwnProperty.call(body, HOUSE_CONSTRUCTION_CALCULATOR_SETTINGS_KEY)) {
      revalidateTag("house-construction-calculator-config");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN SETTINGS UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

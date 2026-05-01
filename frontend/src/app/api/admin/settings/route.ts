import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN SETTINGS UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

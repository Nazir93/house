import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const partners = await prisma.partner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(partners);
  } catch (error) {
    console.error("[ADMIN PARTNERS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const { name, logoUrl, website, visible, order } = body;

    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Name and logoUrl are required" }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        logoUrl,
        website: website || null,
        visible: visible ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("[ADMIN PARTNER CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

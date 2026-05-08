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
    const showInTrustBlock = body.showInTrustBlock ?? true;
    const showInBankMarquee = body.showInBankMarquee ?? false;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!showInTrustBlock && !showInBankMarquee) {
      return NextResponse.json({ error: "Выберите хотя бы один блок на главной" }, { status: 400 });
    }
    if (showInTrustBlock && !(typeof logoUrl === "string" && logoUrl.trim())) {
      return NextResponse.json({ error: "Для блока «Нам доверяют» нужен логотип" }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        name: name.trim(),
        logoUrl: typeof logoUrl === "string" && logoUrl.trim() ? logoUrl.trim() : null,
        website: website || null,
        visible: visible ?? true,
        order: order ?? 0,
        showInTrustBlock,
        showInBankMarquee,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("[ADMIN PARTNER CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

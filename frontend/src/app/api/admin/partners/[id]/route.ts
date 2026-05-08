import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const existing = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextTrust =
      body.showInTrustBlock !== undefined ? Boolean(body.showInTrustBlock) : existing.showInTrustBlock;
    const nextBank =
      body.showInBankMarquee !== undefined ? Boolean(body.showInBankMarquee) : existing.showInBankMarquee;
    const nextLogo =
      body.logoUrl !== undefined
        ? typeof body.logoUrl === "string" && body.logoUrl.trim()
          ? body.logoUrl.trim()
          : null
        : existing.logoUrl;

    if (!nextTrust && !nextBank) {
      return NextResponse.json({ error: "Выберите хотя бы один блок на главной" }, { status: 400 });
    }
    if (nextTrust && !nextLogo) {
      return NextResponse.json({ error: "Для блока «Нам доверяют» нужен логотип" }, { status: 400 });
    }

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.logoUrl !== undefined && {
          logoUrl: typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null,
        }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.visible !== undefined && { visible: body.visible }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.showInTrustBlock !== undefined && { showInTrustBlock: body.showInTrustBlock }),
        ...(body.showInBankMarquee !== undefined && { showInBankMarquee: body.showInBankMarquee }),
      },
    });
    return NextResponse.json(partner);
  } catch (error) {
    console.error("[ADMIN PARTNER UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.partner.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN PARTNER DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

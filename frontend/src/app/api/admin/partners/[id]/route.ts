import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.visible !== undefined && { visible: body.visible }),
        ...(body.order !== undefined && { order: body.order }),
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
  try {
    await prisma.partner.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN PARTNER DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

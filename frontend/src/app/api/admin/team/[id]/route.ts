import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicTeam } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl || null }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.visible !== undefined && { visible: body.visible }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    revalidatePublicTeam();
    return NextResponse.json(member);
  } catch (error) {
    console.error("[ADMIN TEAM UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.teamMember.delete({ where: { id: params.id } });
    revalidatePublicTeam();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN TEAM DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

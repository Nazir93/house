import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicTeam } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import {
  isTeamMemberInputValid,
  mergeTeamMemberPatch,
  normalizeTeamMemberInput,
} from "@/lib/team-public";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const existingRow = await prisma.teamMember.findUnique({ where: { id: params.id } });
    if (!existingRow) {
      return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
    }

    const existing = normalizeTeamMemberInput(existingRow);
    const patch = normalizeTeamMemberInput(body);
    const touched = {
      name: body.name !== undefined,
      position: body.position !== undefined,
      photoUrl: body.photoUrl !== undefined,
      description: body.description !== undefined,
      visible: body.visible !== undefined,
      order: body.order !== undefined,
    };
    const merged = mergeTeamMemberPatch(existing, patch, touched);

    if (!isTeamMemberInputValid(merged)) {
      return NextResponse.json({ error: "Укажите имя и должность (не короче 2 символов)" }, { status: 400 });
    }

    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: merged,
    });
    revalidatePublicTeam();
    return NextResponse.json(member);
  } catch (error) {
    console.error("[ADMIN TEAM UPDATE]", error);
    return NextResponse.json({ error: "Не удалось обновить сотрудника" }, { status: 500 });
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
    return NextResponse.json({ error: "Не удалось удалить сотрудника" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicTeam } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { isTeamMemberInputValid, normalizeTeamMemberInput } from "@/lib/team-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const members = await prisma.teamMember.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
    return NextResponse.json(members);
  } catch (error) {
    console.error("[ADMIN TEAM]", error);
    return NextResponse.json({ error: "Не удалось загрузить команду" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const data = normalizeTeamMemberInput(body);
    if (!isTeamMemberInputValid(data)) {
      return NextResponse.json({ error: "Укажите имя и должность (не короче 2 символов)" }, { status: 400 });
    }

    const member = await prisma.teamMember.create({ data });
    revalidatePublicTeam();
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("[ADMIN TEAM CREATE]", error);
    return NextResponse.json({ error: "Не удалось сохранить сотрудника" }, { status: 500 });
  }
}

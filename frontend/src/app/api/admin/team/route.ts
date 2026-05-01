import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(members);
  } catch (error) {
    console.error("[ADMIN TEAM]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        position: body.position,
        photoUrl: body.photoUrl || null,
        description: body.description || null,
        visible: body.visible ?? true,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("[ADMIN TEAM CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

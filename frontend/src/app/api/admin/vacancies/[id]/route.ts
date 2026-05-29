import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicVacancies } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { isVacancyInputValid, normalizeVacancyInput } from "@/lib/vacancy-public";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const patch = normalizeVacancyInput(body);
    const existing = await prisma.vacancy.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const merged = {
      title: body.title !== undefined ? patch.title : existing.title,
      description: body.description !== undefined ? patch.description : existing.description,
      location: body.location !== undefined ? patch.location : existing.location,
      schedule: body.schedule !== undefined ? patch.schedule : existing.schedule,
      salaryLabel: body.salaryLabel !== undefined ? patch.salaryLabel : existing.salaryLabel,
      requirements: body.requirements !== undefined ? patch.requirements : existing.requirements,
      visible: body.visible !== undefined ? patch.visible : existing.visible,
      order: body.order !== undefined ? patch.order : existing.order,
    };

    if (!isVacancyInputValid(merged)) {
      return NextResponse.json({ error: "Укажите название и описание (не короче 10 символов)" }, { status: 400 });
    }

    const vacancy = await prisma.vacancy.update({
      where: { id: params.id },
      data: merged,
    });
    revalidatePublicVacancies();
    return NextResponse.json(vacancy);
  } catch (error) {
    console.error("[ADMIN VACANCIES UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.vacancy.delete({ where: { id: params.id } });
    revalidatePublicVacancies();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN VACANCIES DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

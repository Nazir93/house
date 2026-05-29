import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicVacancies } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { isVacancyInputValid, normalizeVacancyInput } from "@/lib/vacancy-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const vacancies = await prisma.vacancy.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(vacancies);
  } catch (error) {
    console.error("[ADMIN VACANCIES]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const data = normalizeVacancyInput(body);
    if (!isVacancyInputValid(data)) {
      return NextResponse.json({ error: "Укажите название и описание (не короче 10 символов)" }, { status: 400 });
    }

    const vacancy = await prisma.vacancy.create({ data });
    revalidatePublicVacancies();
    return NextResponse.json(vacancy, { status: 201 });
  } catch (error) {
    console.error("[ADMIN VACANCIES CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

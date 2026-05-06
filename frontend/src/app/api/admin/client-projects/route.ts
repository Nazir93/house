import { NextRequest, NextResponse } from "next/server";
import type { ClientPaymentStatus, ClientStageStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

const DEFAULT_STAGES: { title: string; iconKey: string }[] = [
  { title: "Фундамент", iconKey: "foundation" },
  { title: "Стены", iconKey: "walls" },
  { title: "Кровля", iconKey: "roof" },
  { title: "Инженерные сети", iconKey: "engineering" },
  { title: "Отделка", iconKey: "finish" },
];

function parseStageStatus(v: unknown): ClientStageStatus {
  return v === "DONE" || v === "IN_PROGRESS" || v === "NOT_STARTED" ? v : "NOT_STARTED";
}

function parsePaymentStatus(v: unknown): ClientPaymentStatus {
  return v === "PAID" || v === "EXPECTED" || v === "NOT_ISSUED" ? v : "EXPECTED";
}

export async function GET(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const search = request.nextUrl.searchParams.get("search")?.trim();

  try {
    const list = await prisma.clientConstructionProject.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { contractNumber: { contains: search, mode: "insensitive" } },
              { clientName: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        contractNumber: true,
        title: true,
        clientName: true,
        overallProgress: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("[ADMIN CLIENT PROJECTS LIST]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const contractNumber = String(body.contractNumber || "").trim();
    const plainPassword = String(body.plainPassword || "");
    const title = String(body.title || "").trim();
    if (!contractNumber || !plainPassword || !title) {
      return NextResponse.json(
        { error: "Нужны contractNumber, plainPassword и title" },
        { status: 400 }
      );
    }

    const exists = await prisma.clientConstructionProject.findUnique({
      where: { contractNumber },
    });
    if (exists) {
      return NextResponse.json({ error: "Такой номер договора уже есть" }, { status: 409 });
    }

    const passwordHash = await hashPassword(plainPassword);

    const stagesIn = Array.isArray(body.stages) ? body.stages : null;
    const stagesData =
      stagesIn && stagesIn.length > 0
        ? stagesIn.map((s: Record<string, unknown>, i: number) => ({
            order: typeof s.order === "number" && s.order >= 0 ? s.order : i,
            title: String(s.title || `Этап ${i + 1}`),
            iconKey: String(s.iconKey || "circle"),
            status: parseStageStatus(s.status),
          }))
        : DEFAULT_STAGES.map((s, i) => ({
            order: i,
            title: s.title,
            iconKey: s.iconKey,
            status: "NOT_STARTED" as ClientStageStatus,
          }));

    const project = await prisma.clientConstructionProject.create({
      data: {
        contractNumber,
        passwordHash,
        title,
        clientName: body.clientName?.trim() || null,
        clientEmail: body.clientEmail?.trim() || null,
        area:
          body.area === undefined || body.area === null || body.area === ""
            ? null
            : parseInt(String(body.area), 10) || null,
        wallMaterial: body.wallMaterial?.trim() || null,
        startDate: body.startDate ? new Date(String(body.startDate)) : null,
        plannedEndDate: body.plannedEndDate ? new Date(String(body.plannedEndDate)) : null,
        coverImageUrl: body.coverImageUrl?.trim() || null,
        overallProgress:
          body.overallProgress === undefined || body.overallProgress === null || body.overallProgress === ""
            ? 0
            : Math.min(100, Math.max(0, parseInt(String(body.overallProgress), 10) || 0)),
        currentStageLabel: body.currentStageLabel?.trim() || null,
        foremanName: body.foremanName?.trim() || null,
        cameraStreamUrl: body.cameraStreamUrl?.trim() || null,
        houseProjectId: body.houseProjectId?.trim() || null,
        stages: { create: stagesData },
      },
    });

    return NextResponse.json({ id: project.id, contractNumber: project.contractNumber }, { status: 201 });
  } catch (e) {
    console.error("[ADMIN CLIENT PROJECT CREATE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

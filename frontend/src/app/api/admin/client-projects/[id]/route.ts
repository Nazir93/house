import { NextRequest, NextResponse } from "next/server";
import type { ClientPaymentStatus, ClientStageStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { paymentAmountKopeksFromAdminPayload } from "@/lib/client-payment-amount";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

function parseStageStatus(v: unknown): ClientStageStatus {
  return v === "DONE" || v === "IN_PROGRESS" || v === "NOT_STARTED" ? v : "NOT_STARTED";
}

function parsePaymentStatus(v: unknown): ClientPaymentStatus {
  return v === "PAID" || v === "EXPECTED" || v === "NOT_ISSUED" ? v : "EXPECTED";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await prisma.clientConstructionProject.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
        documents: { orderBy: { uploadedAt: "desc" } },
        photoReports: { orderBy: [{ order: "asc" }, { shotAt: "desc" }] },
        tickets: {
          orderBy: { updatedAt: "desc" },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (e) {
    console.error("[ADMIN CLIENT PROJECT GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const exists = await prisma.clientConstructionProject.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const plainPassword = body.plainPassword?.trim();
    const passwordHash =
      plainPassword && plainPassword.length > 0 ? await hashPassword(plainPassword) : undefined;

    await prisma.$transaction(async (tx) => {
      const nextContract = body.contractNumber?.trim()
        ? String(body.contractNumber).trim()
        : undefined;
      if (nextContract && nextContract !== exists.contractNumber) {
        const clash = await tx.clientConstructionProject.findUnique({
          where: { contractNumber: nextContract },
        });
        if (clash) {
          throw new Error("CONTRACT_EXISTS");
        }
      }

      await tx.clientConstructionProject.update({
        where: { id },
        data: {
          ...(nextContract ? { contractNumber: nextContract } : {}),
          ...(passwordHash ? { passwordHash } : {}),
          title: body.title != null ? String(body.title).trim() : undefined,
          clientName: body.clientName !== undefined ? body.clientName?.trim() || null : undefined,
          clientEmail: body.clientEmail !== undefined ? body.clientEmail?.trim() || null : undefined,
          area:
            body.area === undefined
              ? undefined
              : body.area === null || body.area === ""
                ? null
                : parseInt(String(body.area), 10) || null,
          wallMaterial: body.wallMaterial !== undefined ? body.wallMaterial?.trim() || null : undefined,
          startDate:
            body.startDate === undefined
              ? undefined
              : body.startDate
                ? new Date(String(body.startDate))
                : null,
          plannedEndDate:
            body.plannedEndDate === undefined
              ? undefined
              : body.plannedEndDate
                ? new Date(String(body.plannedEndDate))
                : null,
          coverImageUrl: body.coverImageUrl !== undefined ? body.coverImageUrl?.trim() || null : undefined,
          overallProgress:
            body.overallProgress === undefined
              ? undefined
              : Math.min(100, Math.max(0, parseInt(String(body.overallProgress), 10) || 0)),
          currentStageLabel:
            body.currentStageLabel !== undefined ? body.currentStageLabel?.trim() || null : undefined,
          foremanName: body.foremanName !== undefined ? body.foremanName?.trim() || null : undefined,
          cameraStreamUrl: body.cameraStreamUrl !== undefined ? body.cameraStreamUrl?.trim() || null : undefined,
          houseProjectId: body.houseProjectId !== undefined ? body.houseProjectId?.trim() || null : undefined,
        },
      });

      if (Array.isArray(body.stages)) {
        await tx.clientProjectStage.deleteMany({ where: { projectId: id } });
        if (body.stages.length > 0) {
          await tx.clientProjectStage.createMany({
            data: body.stages.map((s: Record<string, unknown>, i: number) => ({
              projectId: id,
              order: typeof s.order === "number" && s.order >= 0 ? s.order : i,
              title: String(s.title || `Этап ${i + 1}`),
              iconKey: String(s.iconKey || "circle"),
              status: parseStageStatus(s.status),
            })),
          });
        }
      }

      if (Array.isArray(body.payments)) {
        await tx.clientPayment.deleteMany({ where: { projectId: id } });
        if (body.payments.length > 0) {
          await tx.clientPayment.createMany({
            data: body.payments.map((p: Record<string, unknown>, i: number) => ({
              projectId: id,
              label: String(p.label || `Платёж ${i + 1}`),
              amountKopeks: paymentAmountKopeksFromAdminPayload(p),
              dueDate: p.dueDate ? new Date(String(p.dueDate)) : null,
              status: parsePaymentStatus(p.status),
              paidAt: p.paidAt ? new Date(String(p.paidAt)) : null,
              order: typeof p.order === "number" && p.order >= 0 ? p.order : i,
            })),
          });
        }
      }
    });

    const project = await prisma.clientConstructionProject.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
        documents: { orderBy: { uploadedAt: "desc" } },
        photoReports: { orderBy: [{ order: "asc" }, { shotAt: "desc" }] },
        tickets: {
          orderBy: { updatedAt: "desc" },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
      },
    });

    return NextResponse.json(project);
  } catch (e) {
    if ((e as Error)?.message === "CONTRACT_EXISTS") {
      return NextResponse.json({ error: "Такой номер договора уже есть" }, { status: 409 });
    }
    console.error("[ADMIN CLIENT PROJECT PUT]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.clientConstructionProject.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

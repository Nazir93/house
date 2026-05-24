import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  buildDraftDataFromAdminBody,
  clientProjectDraftSectionSavedMessage,
  draftDataToJson,
  hasUnpublishedDraft,
  mergeClientProjectDraft,
  parseClientProjectDraftData,
  parseClientProjectDraftSection,
} from "@/lib/client-project-draft";
import { publishDraftMediaToCabinet } from "@/lib/client-project-draft-media";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const project = await prisma.clientConstructionProject.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...project,
      hasUnpublishedDraft: hasUnpublishedDraft(project),
    });
  } catch (e) {
    console.error("[ADMIN CLIENT PROJECT GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

/** Сохранение черновика; разделы documents/photos сразу публикуют медиа и шлют уведомления. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const body = await request.json();
    const exists = await prisma.clientConstructionProject.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const section = parseClientProjectDraftSection(body.draftSection) ?? "main";

    if (section === "documents" || section === "photos") {
      await publishDraftMediaToCabinet(id);
      const updated = await prisma.clientConstructionProject.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          draftSavedAt: true,
          cabinetPublishedAt: true,
          draftData: true,
        },
      });
      return NextResponse.json({
        ok: true,
        draftSavedAt: updated.draftSavedAt?.toISOString(),
        hasUnpublishedDraft: hasUnpublishedDraft(updated),
        savedSection: section,
        message: "Изменения сохранены и опубликованы в личном кабинете.",
      });
    }

    const existingDraft = parseClientProjectDraftData(exists.draftData);
    const patch = buildDraftDataFromAdminBody(body);
    const draft = mergeClientProjectDraft(existingDraft, patch, section);
    const nextContract = draft.contractNumber?.trim();
    if (nextContract && nextContract !== exists.contractNumber) {
      const clash = await prisma.clientConstructionProject.findFirst({
        where: { contractNumber: nextContract, id: { not: id } },
      });
      if (clash) {
        return NextResponse.json({ error: "Такой номер договора уже есть" }, { status: 409 });
      }
    }

    const draftJson = parseClientProjectDraftData(draft);
    const updated = await prisma.clientConstructionProject.update({
      where: { id },
      data: {
        ...(draftJson ? { draftData: draftDataToJson(draftJson) } : { draftData: Prisma.DbNull }),
        draftSavedAt: new Date(),
      },
      select: {
        id: true,
        draftSavedAt: true,
        cabinetPublishedAt: true,
        draftData: true,
      },
    });

    return NextResponse.json({
      ok: true,
      draftSavedAt: updated.draftSavedAt?.toISOString(),
      hasUnpublishedDraft: hasUnpublishedDraft(updated),
      savedSection: section,
      message: clientProjectDraftSectionSavedMessage(section),
    });
  } catch (e) {
    console.error("[ADMIN CLIENT PROJECT PUT]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    await prisma.clientConstructionProject.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

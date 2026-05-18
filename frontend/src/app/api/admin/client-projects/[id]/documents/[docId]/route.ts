import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deleteClientDocumentWithNotifications } from "@/lib/client-document-delete";
import { resolveAdminDocumentPatch } from "@/lib/client-document-admin-patch";
import {
  documentSignatureSyncWhere,
  type DocumentSignatureAnchor,
} from "@/lib/client-document-signature-sync";
import { touchDraftSavedAt } from "@/lib/client-project-draft-media";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

async function syncSignatureFields(
  projectId: string,
  anchor: DocumentSignatureAnchor,
  data: Prisma.ClientDocumentUpdateManyMutationInput
): Promise<void> {
  await prisma.clientDocument.updateMany({
    where: documentSignatureSyncWhere(projectId, anchor),
    data,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId, docId } = await params;
  try {
    const [doc, project] = await Promise.all([
      prisma.clientDocument.findFirst({ where: { id: docId, projectId } }),
      prisma.clientConstructionProject.findUnique({
        where: { id: projectId },
        select: { clientName: true },
      }),
    ]);
    if (!doc || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const plan = resolveAdminDocumentPatch(doc, body, {
      defaultClientName: project.clientName,
    });
    if ("error" in plan) {
      return NextResponse.json({ error: plan.error }, { status: plan.status });
    }

    const anchor: DocumentSignatureAnchor = {
      url: doc.url,
      filename: doc.filename,
      order: doc.order,
    };

    if (plan.action === "update_signed_at") {
      await syncSignatureFields(projectId, anchor, {
        signedAt: plan.signedAt,
        ...(plan.signedByName ? { signedByName: plan.signedByName } : {}),
      });
    } else {
      await syncSignatureFields(projectId, anchor, plan.data);
    }

    const row = await prisma.clientDocument.findFirst({ where: { id: docId } });
    await touchDraftSavedAt(projectId);
    return NextResponse.json(row);
  } catch (e) {
    console.error("[ADMIN CLIENT DOC PATCH]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id: projectId, docId } = await params;
  try {
    const doc = await prisma.clientDocument.findFirst({
      where: { id: docId, projectId },
    });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const anchor: DocumentSignatureAnchor = {
      url: doc.url,
      filename: doc.filename,
      order: doc.order,
    };

    const result = await prisma.$transaction((tx) =>
      deleteClientDocumentWithNotifications(tx, projectId, anchor)
    );

    if (result.documentsDeleted === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await touchDraftSavedAt(projectId);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[ADMIN CLIENT DOC DELETE]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

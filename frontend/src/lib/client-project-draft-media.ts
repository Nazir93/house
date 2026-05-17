import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Если черновых медиа нет — копируем опубликованные в черновик для редактирования. */
export async function ensureDraftMediaWorkspace(projectId: string): Promise<void> {
  const [draftPhotos, draftDocs] = await Promise.all([
    prisma.clientPhotoReport.count({ where: { projectId, isDraft: true } }),
    prisma.clientDocument.count({ where: { projectId, isDraft: true } }),
  ]);

  if (draftPhotos === 0) {
    const published = await prisma.clientPhotoReport.findMany({
      where: { projectId, isDraft: false },
      orderBy: [{ order: "asc" }, { shotAt: "desc" }],
    });
    if (published.length > 0) {
      await prisma.$transaction(
        published.map((p) =>
          prisma.clientPhotoReport.create({
            data: {
              projectId,
              url: p.url,
              caption: p.caption,
              shotAt: p.shotAt,
              order: p.order,
              isDraft: true,
            },
          })
        )
      );
    }
  }

  if (draftDocs === 0) {
    const published = await prisma.clientDocument.findMany({
      where: { projectId, isDraft: false },
      orderBy: [{ order: "asc" }, { uploadedAt: "desc" }],
    });
    if (published.length > 0) {
      await prisma.$transaction(
        published.map((d) =>
          prisma.clientDocument.create({
            data: {
              projectId,
              filename: d.filename,
              url: d.url,
              order: d.order,
              signatureStatus: d.signatureStatus,
              signatureMethod: d.signatureMethod,
              signedByName: d.signedByName,
              signatureSmsPhone: d.signatureSmsPhone,
              signedResultUrl: d.signedResultUrl,
              downloadedAt: d.downloadedAt,
              signedAt: d.signedAt,
              isDraft: true,
            },
          })
        )
      );
    }
  }
}

/** Заменяет опубликованные фото/документы черновиками. */
export async function publishDraftMedia(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<void> {
  await tx.clientPhotoReport.deleteMany({ where: { projectId, isDraft: false } });
  await tx.clientDocument.deleteMany({ where: { projectId, isDraft: false } });

  await tx.clientPhotoReport.updateMany({
    where: { projectId, isDraft: true },
    data: { isDraft: false },
  });
  await tx.clientDocument.updateMany({
    where: { projectId, isDraft: true },
    data: { isDraft: false },
  });
}

export const publishedPhotoWhere = { isDraft: false } as const;
export const publishedDocumentWhere = { isDraft: false } as const;
export const draftPhotoWhere = { isDraft: true } as const;
export const draftDocumentWhere = { isDraft: true } as const;

/** Помечает проект как имеющий неопубликованные правки (медиа). */
export async function touchDraftSavedAt(projectId: string): Promise<void> {
  await prisma.clientConstructionProject.update({
    where: { id: projectId },
    data: { draftSavedAt: new Date() },
  });
}

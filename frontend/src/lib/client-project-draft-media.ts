import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createClientNotifications } from "@/lib/client-notifications";
import {
  detectNewDocumentNotifications,
  detectNewPhotoNotifications,
} from "@/lib/client-notification-sync";

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

/** Уведомления клиенту о новых опубликованных фото/документах. */
export function collectMediaPublishNotifications(
  oldDocuments: { url: string; filename: string }[],
  newDocuments: { url: string; filename: string }[],
  oldPhotos: { url: string; caption: string | null }[],
  newPhotos: { url: string; caption: string | null }[]
) {
  return [
    ...detectNewDocumentNotifications(oldDocuments, newDocuments),
    ...detectNewPhotoNotifications(oldPhotos, newPhotos),
  ];
}

/** Публикует черновые медиа и шлёт DOCUMENT_NEW / PHOTO_NEW по новым файлам. */
export async function publishDraftMediaWithNotifications(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<void> {
  const [oldPublishedDocuments, oldPublishedPhotos] = await Promise.all([
    tx.clientDocument.findMany({
      where: { projectId, isDraft: false },
      select: { url: true, filename: true },
    }),
    tx.clientPhotoReport.findMany({
      where: { projectId, isDraft: false },
      select: { url: true, caption: true },
    }),
  ]);

  await publishDraftMedia(tx, projectId);

  const [newPublishedDocuments, newPublishedPhotos] = await Promise.all([
    tx.clientDocument.findMany({
      where: { projectId, isDraft: false },
      select: { url: true, filename: true },
    }),
    tx.clientPhotoReport.findMany({
      where: { projectId, isDraft: false },
      select: { url: true, caption: true },
    }),
  ]);

  const notificationSpecs = collectMediaPublishNotifications(
    oldPublishedDocuments,
    newPublishedDocuments,
    oldPublishedPhotos,
    newPublishedPhotos
  );

  if (notificationSpecs.length > 0) {
    await createClientNotifications(tx, projectId, notificationSpecs);
  }
}

/** Публикует черновые фото/документы в личный кабинет (без сброса остального черновика). */
export async function publishDraftMediaToCabinet(projectId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await publishDraftMediaWithNotifications(tx, projectId);
    await tx.clientConstructionProject.update({
      where: { id: projectId },
      data: { draftSavedAt: new Date() },
    });
  });
}

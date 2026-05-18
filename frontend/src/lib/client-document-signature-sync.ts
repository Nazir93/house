import type { Prisma } from "@prisma/client";

export type DocumentSignatureAnchor = {
  url: string;
  filename: string;
  order: number;
};

/** Условие для синхронизации статуса между черновиком и опубликованной копией (п. 9 ТЗ). */
export function documentSignatureSyncWhere(
  projectId: string,
  anchor: DocumentSignatureAnchor
): Prisma.ClientDocumentWhereInput {
  return {
    projectId,
    OR: [{ url: anchor.url }, { filename: anchor.filename, order: anchor.order }],
  };
}

export function documentSignatureSyncWherePublished(
  projectId: string,
  anchor: DocumentSignatureAnchor
): Prisma.ClientDocumentWhereInput {
  return {
    ...documentSignatureSyncWhere(projectId, anchor),
    isDraft: false,
  };
}

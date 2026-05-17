import { publishedDocumentWhere, publishedPhotoWhere } from "@/lib/client-project-draft-media";

/** Сортировка фотоотчёта и документов в ЛК (п. 9 ТЗ). */
export const clientPhotoReportOrderBy = [{ order: "asc" as const }, { shotAt: "desc" as const }];

export const clientDocumentOrderBy = [{ order: "asc" as const }, { uploadedAt: "desc" as const }];

export { publishedDocumentWhere, publishedPhotoWhere };

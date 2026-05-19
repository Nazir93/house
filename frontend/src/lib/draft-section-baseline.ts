/** Стабильная сериализация для сравнения черновика раздела. */
export function stableDraftPayloadString(value: unknown): string {
  return JSON.stringify(value);
}

/** Отпечаток данных с сервера — сброс baseline при обновлении страницы / router.refresh. */
export function buildClientProjectDraftBaselineKey(
  projectId: string,
  initial: {
    draftSavedAt?: string | null;
    cabinetPublishedAt?: string | null;
    contractNumber: string;
    title: string;
    clientName: string | null;
    clientEmail: string | null;
    area: number | null;
    wallMaterial: string | null;
    startDate: string | null;
    plannedEndDate: string | null;
    coverImageUrl: string | null;
    foremanName: string | null;
    cameraStreamUrl: string | null;
    houseProjectId: string | null;
    stages: {
      id: string;
      parentId: string | null;
      order: number;
      title: string;
      iconKey: string;
      status: string;
    }[];
    payments: {
      label: string;
      amountKopeks: number;
      dueDate: string | null;
      status: string;
      paidAt: string | null;
      order: number;
    }[];
    documents: { id: string }[];
    photoReports: { id: string }[];
  }
): string {
  return stableDraftPayloadString({
    projectId,
    draftSavedAt: initial.draftSavedAt ?? null,
    cabinetPublishedAt: initial.cabinetPublishedAt ?? null,
    main: {
      contractNumber: initial.contractNumber,
      title: initial.title,
      clientName: initial.clientName,
      clientEmail: initial.clientEmail,
      area: initial.area,
      wallMaterial: initial.wallMaterial,
      startDate: initial.startDate,
      plannedEndDate: initial.plannedEndDate,
      coverImageUrl: initial.coverImageUrl,
      foremanName: initial.foremanName,
      cameraStreamUrl: initial.cameraStreamUrl,
      houseProjectId: initial.houseProjectId,
    },
    stages: initial.stages.map((s) => ({
      id: s.id,
      parentId: s.parentId,
      order: s.order,
      title: s.title,
      iconKey: s.iconKey,
      status: s.status,
    })),
    payments: initial.payments.map((p) => ({
      order: p.order,
      label: p.label,
      amountKopeks: p.amountKopeks,
      dueDate: p.dueDate,
      status: p.status,
      paidAt: p.paidAt,
    })),
    documents: initial.documents.map((d) => d.id).sort(),
    photoReports: initial.photoReports.map((p) => p.id).sort(),
  });
}

/** «Грязный» только после захвата baseline и при реальном отличии от него. */
export function isDraftPayloadDirty(
  snapshotsReady: boolean,
  currentPayload: string,
  baselinePayload: string | undefined
): boolean {
  if (!snapshotsReady) return false;
  if (baselinePayload === undefined) return false;
  return currentPayload !== baselinePayload;
}

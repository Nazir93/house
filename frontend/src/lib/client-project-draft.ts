import type { Prisma } from "@prisma/client";
import type { AdminStagePayload } from "@/lib/client-project-stages-persist";

/** Сохраняется в ClientConstructionProject.draftData до публикации в ЛК. */
export type ClientProjectDraftData = {
  contractNumber?: string;
  plainPassword?: string;
  title?: string;
  clientName?: string | null;
  clientEmail?: string | null;
  area?: number | null;
  wallMaterial?: string | null;
  startDate?: string | null;
  plannedEndDate?: string | null;
  coverImageUrl?: string | null;
  foremanName?: string | null;
  cameraStreamUrl?: string | null;
  houseProjectId?: string | null;
  stages?: AdminStagePayload[];
  payments?: Array<{
    order: number;
    label: string;
    amountRubles: number;
    dueDate: string | null;
    status: string;
    paidAt: string | null;
  }>;
};

export type ClientProjectDraftSection =
  | "main"
  | "stages"
  | "payments"
  | "documents"
  | "photos";

const DRAFT_SECTIONS: ClientProjectDraftSection[] = [
  "main",
  "stages",
  "payments",
  "documents",
  "photos",
];

export function parseClientProjectDraftSection(value: unknown): ClientProjectDraftSection | null {
  if (typeof value !== "string") return null;
  return DRAFT_SECTIONS.includes(value as ClientProjectDraftSection)
    ? (value as ClientProjectDraftSection)
    : null;
}

export const CLIENT_PROJECT_DRAFT_SECTION_LABELS: Record<ClientProjectDraftSection, string> = {
  main: "Основная информация",
  stages: "Этапы строительства",
  payments: "Платежи",
  documents: "Документы",
  photos: "Фотоотчёты",
};

export function clientProjectDraftSectionSavedMessage(section: ClientProjectDraftSection): string {
  return `${CLIENT_PROJECT_DRAFT_SECTION_LABELS[section]} сохранена в черновик. Уведомления клиенту не отправляются.`;
}

const MAIN_DRAFT_KEYS = [
  "contractNumber",
  "plainPassword",
  "title",
  "clientName",
  "clientEmail",
  "area",
  "wallMaterial",
  "startDate",
  "plannedEndDate",
  "coverImageUrl",
  "foremanName",
  "cameraStreamUrl",
  "houseProjectId",
] as const satisfies readonly (keyof ClientProjectDraftData)[];

function assignDefinedMainFields(
  target: ClientProjectDraftData,
  patch: ClientProjectDraftData
): void {
  for (const key of MAIN_DRAFT_KEYS) {
    if (patch[key] !== undefined) {
      (target as Record<string, unknown>)[key] = patch[key];
    }
  }
}

/** Объединяет черновик: обновляет только поля выбранного блока. */
export function mergeClientProjectDraft(
  existing: ClientProjectDraftData | null,
  patch: ClientProjectDraftData,
  section: ClientProjectDraftSection
): ClientProjectDraftData {
  const base: ClientProjectDraftData = { ...(existing ?? {}) };

  if (section === "documents" || section === "photos") {
    return base;
  }

  if (section === "main") {
    assignDefinedMainFields(base, patch);
    return base;
  }

  if (section === "stages") {
    if (patch.stages !== undefined) base.stages = patch.stages;
    return base;
  }

  if (section === "payments") {
    if (patch.payments !== undefined) base.payments = patch.payments;
    return base;
  }

  assignDefinedMainFields(base, patch);
  if (patch.stages !== undefined) base.stages = patch.stages;
  if (patch.payments !== undefined) base.payments = patch.payments;
  return base;
}

export function parseClientProjectDraftData(raw: unknown): ClientProjectDraftData | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as ClientProjectDraftData;
}

export function hasUnpublishedDraft(project: {
  draftSavedAt: Date | null;
  cabinetPublishedAt: Date | null;
  draftData: unknown;
}): boolean {
  if (!project.draftSavedAt || !project.draftData) return false;
  if (!project.cabinetPublishedAt) return true;
  return project.draftSavedAt.getTime() > project.cabinetPublishedAt.getTime();
}

export function buildDraftDataFromAdminBody(body: Record<string, unknown>): ClientProjectDraftData {
  return {
    contractNumber: body.contractNumber != null ? String(body.contractNumber).trim() : undefined,
    plainPassword:
      typeof body.plainPassword === "string" && body.plainPassword.trim()
        ? body.plainPassword.trim()
        : undefined,
    title: body.title != null ? String(body.title).trim() : undefined,
    clientName: body.clientName !== undefined ? body.clientName?.toString().trim() || null : undefined,
    clientEmail: body.clientEmail !== undefined ? body.clientEmail?.toString().trim() || null : undefined,
    area:
      body.area === undefined
        ? undefined
        : body.area === null || body.area === ""
          ? null
          : parseInt(String(body.area), 10) || null,
    wallMaterial: body.wallMaterial !== undefined ? body.wallMaterial?.toString().trim() || null : undefined,
    startDate: body.startDate === undefined ? undefined : body.startDate ? String(body.startDate) : null,
    plannedEndDate:
      body.plannedEndDate === undefined ? undefined : body.plannedEndDate ? String(body.plannedEndDate) : null,
    coverImageUrl: body.coverImageUrl !== undefined ? body.coverImageUrl?.toString().trim() || null : undefined,
    foremanName: body.foremanName !== undefined ? body.foremanName?.toString().trim() || null : undefined,
    cameraStreamUrl:
      body.cameraStreamUrl !== undefined ? body.cameraStreamUrl?.toString().trim() || null : undefined,
    houseProjectId: body.houseProjectId !== undefined ? body.houseProjectId?.toString().trim() || null : undefined,
    stages: Array.isArray(body.stages) ? (body.stages as AdminStagePayload[]) : undefined,
    payments: Array.isArray(body.payments)
      ? body.payments.map((p: Record<string, unknown>, i: number) => ({
          order: typeof p.order === "number" && p.order >= 0 ? p.order : i,
          label: String(p.label || `Платёж ${i + 1}`),
          amountRubles: typeof p.amountRubles === "number" ? p.amountRubles : parseFloat(String(p.amountRubles)) || 0,
          dueDate: p.dueDate ? String(p.dueDate) : null,
          status: String(p.status || "EXPECTED"),
          paidAt: p.paidAt ? String(p.paidAt) : null,
        }))
      : undefined,
  };
}

export function draftDataToJson(draft: ClientProjectDraftData): Prisma.InputJsonValue {
  return draft as Prisma.InputJsonValue;
}

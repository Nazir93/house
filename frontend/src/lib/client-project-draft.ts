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

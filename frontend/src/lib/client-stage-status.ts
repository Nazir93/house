import type { ClientStageStatus } from "@prisma/client";

/** Статусы этапа в личном кабинете (п. 2 ТЗ). */
export const CLIENT_STAGE_STATUS_OPTIONS: { value: ClientStageStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "Ожидает старта" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Сдан клиенту" },
];

const LEGACY_STATUS_MAP: Record<string, ClientStageStatus> = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  WAITING_START: "NOT_STARTED",
  BUILDING: "IN_PROGRESS",
  HANDED_TO_CLIENT: "DONE",
};

export function parseClientStageStatus(v: unknown): ClientStageStatus {
  if (typeof v === "string" && v in LEGACY_STATUS_MAP) return LEGACY_STATUS_MAP[v]!;
  return "NOT_STARTED";
}

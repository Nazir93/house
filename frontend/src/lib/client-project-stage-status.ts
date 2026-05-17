import type { ClientStageStatus } from "@prisma/client";

/** В зачёт прогресса и «сдан» идёт только этот статус. */
export const CLIENT_STAGE_COMPLETE_STATUS: ClientStageStatus = "DONE";

export type ClientStageNode = {
  id: string;
  parentId: string | null;
  status: ClientStageStatus;
};

export function getTopLevelStages(all: ClientStageNode[]): ClientStageNode[] {
  return all.filter((s) => !s.parentId);
}

export function getChildStages(parentId: string, all: ClientStageNode[]): ClientStageNode[] {
  return all.filter((s) => s.parentId === parentId);
}

/**
 * Агрегированный статус по подэтапам (п. ТЗ «Этапы строительства»):
 * — все «Ожидает старта» → Ожидает старта;
 * — хотя бы один «В работе» → В работе;
 * — все «Сдан клиенту» → Сдан клиенту;
 * — смесь без «В работе» (часть сдана, часть ждёт) → В работе.
 */
export function aggregateStatusesFromChildren(statuses: ClientStageStatus[]): ClientStageStatus {
  if (statuses.length === 0) return "NOT_STARTED";
  if (statuses.every((s) => s === CLIENT_STAGE_COMPLETE_STATUS)) return CLIENT_STAGE_COMPLETE_STATUS;
  if (statuses.every((s) => s === "NOT_STARTED")) return "NOT_STARTED";
  if (statuses.some((s) => s === "IN_PROGRESS")) return "IN_PROGRESS";
  return "IN_PROGRESS";
}

/** Эффективный статус этапа: у листа — свой; у родителя — из подэтапов (рекурсивно). */
export function getEffectiveStageStatus(stage: ClientStageNode, all: ClientStageNode[]): ClientStageStatus {
  const children = getChildStages(stage.id, all);
  if (children.length === 0) return stage.status;
  const childStatuses = children.map((c) => getEffectiveStageStatus(c, all));
  return aggregateStatusesFromChildren(childStatuses);
}

/** Подэтапное дерево полностью сдано клиенту (для прогресса и галочки). */
export function isStageSubtreeComplete(stageId: string, all: ClientStageNode[]): boolean {
  const stage = all.find((s) => s.id === stageId);
  if (!stage) return false;
  const children = getChildStages(stageId, all);
  if (children.length === 0) return stage.status === CLIENT_STAGE_COMPLETE_STATUS;
  return children.every((c) => isStageSubtreeComplete(c.id, all));
}

export function stagesToProgressInput(
  stages: ClientStageNode[]
): { clientKey: string; parentClientKey: string | null; status: ClientStageStatus }[] {
  return stages.map((s) => ({
    clientKey: s.id,
    parentClientKey: s.parentId,
    status: s.status,
  }));
}

export type StageWithMeta = ClientStageNode & {
  title: string;
  iconKey: string;
  order?: number;
};

export type CurrentStageInProgress = {
  id: string;
  title: string;
  iconKey: string;
};

/**
 * Текущий этап(ы) на главной ЛК: все верхнеуровневые этапы со статусом «В работе»
 * (с учётом подэтапов через getEffectiveStageStatus).
 */
export function getCurrentStagesInProgress(stages: StageWithMeta[]): CurrentStageInProgress[] {
  if (stages.length === 0) return [];

  const nodes: ClientStageNode[] = stages.map((s) => ({
    id: s.id,
    parentId: s.parentId,
    status: s.status,
  }));

  return getTopLevelStages(nodes)
    .map((t) => stages.find((s) => s.id === t.id))
    .filter((s): s is StageWithMeta => Boolean(s))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((stage) => getEffectiveStageStatus(stage, nodes) === "IN_PROGRESS")
    .map((stage) => ({ id: stage.id, title: stage.title, iconKey: stage.iconKey }));
}

/** Строка для поля currentStageLabel в БД (админка / совместимость). */
export function formatCurrentStageLabel(stages: StageWithMeta[]): string | null {
  const labels = getCurrentStagesInProgress(stages).map((s) => s.title);
  return labels.length > 0 ? labels.join(", ") : null;
}

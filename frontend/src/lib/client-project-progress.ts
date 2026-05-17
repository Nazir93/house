import type { ClientStageStatus } from "@prisma/client";
import {
  CLIENT_STAGE_COMPLETE_STATUS,
  getTopLevelStages,
  isStageSubtreeComplete,
  stagesToProgressInput,
  type ClientStageNode,
} from "@/lib/client-project-stage-status";

export { CLIENT_STAGE_COMPLETE_STATUS };

export type StageForProgress = {
  clientKey: string;
  parentClientKey: string | null;
  status: ClientStageStatus;
};

export function isClientStageHandedToClient(status: ClientStageStatus): boolean {
  return status === CLIENT_STAGE_COMPLETE_STATUS;
}

export type StageWithParentId = ClientStageNode;

/** Галочка / завершённость: всё поддерево сдано клиенту. */
export function isStageCompleteForDisplay(stage: StageWithParentId, all: StageWithParentId[]): boolean {
  return isStageSubtreeComplete(stage.id, all);
}

/**
 * Прогресс 0–100: 100% / число верхнеуровневых этапов × число полностью сданных.
 * Верхнеуровневый с подэтапами засчитывается, только если все подэтапы (рекурсивно) «Сдан клиенту».
 */
export function computeOverallProgressFromStages(stages: StageForProgress[]): number {
  const nodes: ClientStageNode[] = stages.map((s) => ({
    id: s.clientKey,
    parentId: s.parentClientKey,
    status: s.status,
  }));
  return computeOverallProgressFromDbStages(nodes);
}

export function computeOverallProgressFromDbStages(stages: ClientStageNode[]): number {
  const topLevel = getTopLevelStages(stages);
  if (topLevel.length === 0) return 0;
  const completed = topLevel.filter((s) => isStageSubtreeComplete(s.id, stages)).length;
  return Math.round((completed / topLevel.length) * 100);
}

export { stagesToProgressInput };

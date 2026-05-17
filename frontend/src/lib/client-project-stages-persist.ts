import type { ClientStageStatus, Prisma } from "@prisma/client";
import { parseClientStageStatus } from "@/lib/client-stage-status";
import { computeOverallProgressFromStages, type StageForProgress } from "@/lib/client-project-progress";

export type AdminStagePayload = {
  clientKey?: unknown;
  parentClientKey?: unknown;
  order?: unknown;
  title?: unknown;
  iconKey?: unknown;
  status?: unknown;
};

export type NormalizedAdminStage = StageForProgress & {
  order: number;
  title: string;
  iconKey: string;
  status: ClientStageStatus;
};

export function normalizeAdminStagesPayload(raw: AdminStagePayload[]): {
  stages: NormalizedAdminStage[];
  progress: number;
} {
  const stages = raw.map((s, i) => {
    const clientKey =
      typeof s.clientKey === "string" && s.clientKey.trim() ? s.clientKey.trim() : `stage-${i}`;
    const parentClientKey =
      typeof s.parentClientKey === "string" && s.parentClientKey.trim()
        ? s.parentClientKey.trim()
        : null;
    return {
      clientKey,
      parentClientKey,
      order: typeof s.order === "number" && s.order >= 0 ? s.order : i,
      title: String(s.title || `Этап ${i + 1}`),
      iconKey: String(s.iconKey || "circle"),
      status: parseClientStageStatus(s.status),
    };
  });

  const progress = computeOverallProgressFromStages(stages);
  return { stages, progress };
}

/** Пересоздаёт этапы проекта (delete + create) с иерархией parentId. */
export async function replaceClientProjectStages(
  tx: Prisma.TransactionClient,
  projectId: string,
  raw: AdminStagePayload[]
): Promise<number> {
  const { stages, progress } = normalizeAdminStagesPayload(raw);

  await tx.clientProjectStage.deleteMany({ where: { projectId } });
  if (stages.length === 0) return progress;

  const idByKey = new Map<string, string>();
  let pending = [...stages];

  while (pending.length > 0) {
    const batch = pending.filter((s) => {
      if (!s.parentClientKey) return true;
      return idByKey.has(s.parentClientKey);
    });
    if (batch.length === 0) break;

    for (const s of batch) {
      const parentId = s.parentClientKey ? idByKey.get(s.parentClientKey) ?? null : null;
      const row = await tx.clientProjectStage.create({
        data: {
          projectId,
          order: s.order,
          title: s.title,
          iconKey: s.iconKey,
          status: s.status,
          parentId,
        },
      });
      idByKey.set(s.clientKey, row.id);
    }

    pending = pending.filter((s) => !idByKey.has(s.clientKey));
  }

  return progress;
}

import { prisma } from "@/lib/db";
import { computeOverallProgressFromDbStages } from "@/lib/client-project-progress";
import type { ClientStageNode } from "@/lib/client-project-stage-status";

/** Актуальный % готовности по этапам; при расхождении с БД — обновляет запись. */
export async function resolveClientOverallProgress(
  projectId: string,
  stages: ClientStageNode[],
  storedProgress: number
): Promise<number> {
  const computed = computeOverallProgressFromDbStages(stages);
  if (computed !== storedProgress) {
    await prisma.clientConstructionProject.update({
      where: { id: projectId },
      data: { overallProgress: computed },
    });
  }
  return computed;
}

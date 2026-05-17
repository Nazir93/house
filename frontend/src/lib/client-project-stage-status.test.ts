import { describe, expect, it } from "vitest";
import {
  formatCurrentStageLabel,
  getCurrentStagesInProgress,
  type StageWithMeta,
} from "./client-project-stage-status";

function stage(
  partial: Partial<StageWithMeta> & Pick<StageWithMeta, "id" | "title">
): StageWithMeta {
  return {
    parentId: null,
    status: "NOT_STARTED",
    iconKey: "circle",
    order: 0,
    ...partial,
  };
}

describe("getCurrentStagesInProgress", () => {
  it("возвращает верхнеуровневые этапы со статусом «В работе»", () => {
    const stages: StageWithMeta[] = [
      stage({ id: "1", title: "Фундамент", status: "DONE", order: 0 }),
      stage({ id: "2", title: "Инженерные сети", status: "NOT_STARTED", order: 1, iconKey: "engineering" }),
      stage({
        id: "2a",
        parentId: "2",
        title: "Водоснабжение",
        status: "IN_PROGRESS",
        order: 0,
      }),
    ];
    const current = getCurrentStagesInProgress(stages);
    expect(current).toHaveLength(1);
    expect(current[0]?.title).toBe("Инженерные сети");
  });

  it("несколько этапов «в работе»", () => {
    const stages: StageWithMeta[] = [
      stage({ id: "1", title: "Кровля", status: "IN_PROGRESS", order: 0 }),
      stage({ id: "2", title: "Окна", status: "IN_PROGRESS", order: 1 }),
    ];
    expect(getCurrentStagesInProgress(stages).map((s) => s.title)).toEqual(["Кровля", "Окна"]);
  });

  it("листовой этап в работе без подэтапов", () => {
    const stages: StageWithMeta[] = [
      stage({ id: "1", title: "Фундамент", status: "IN_PROGRESS", order: 0 }),
    ];
    expect(getCurrentStagesInProgress(stages)[0]?.title).toBe("Фундамент");
  });

  it("formatCurrentStageLabel объединяет через запятую", () => {
    const stages: StageWithMeta[] = [
      stage({ id: "1", title: "Кровля", status: "IN_PROGRESS" }),
      stage({ id: "2", title: "Окна", status: "IN_PROGRESS", order: 1 }),
    ];
    expect(formatCurrentStageLabel(stages)).toBe("Кровля, Окна");
  });
});

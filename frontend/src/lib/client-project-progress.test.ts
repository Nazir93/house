import { describe, expect, it } from "vitest";
import { computeOverallProgressFromStages } from "./client-project-progress";

describe("computeOverallProgressFromStages", () => {
  it("делит 100% поровну между верхнеуровневыми этапами", () => {
    const stages = [
      { clientKey: "a", parentClientKey: null, status: "DONE" as const },
      { clientKey: "b", parentClientKey: null, status: "DONE" as const },
      { clientKey: "c", parentClientKey: null, status: "NOT_STARTED" as const },
      { clientKey: "d", parentClientKey: null, status: "IN_PROGRESS" as const },
      { clientKey: "e", parentClientKey: null, status: "NOT_STARTED" as const },
    ];
    expect(computeOverallProgressFromStages(stages)).toBe(40);
  });

  it("8 этапов по 12.5% при одном сданном", () => {
    const stages = Array.from({ length: 8 }, (_, i) => ({
      clientKey: String(i),
      parentClientKey: null,
      status: (i === 0 ? "DONE" : "IN_PROGRESS") as const,
    }));
    expect(computeOverallProgressFromStages(stages)).toBe(13);
  });

  it("родитель с подэтапами — только когда все подэтапы сданы", () => {
    const stages = [
      { clientKey: "p1", parentClientKey: null, status: "IN_PROGRESS" as const },
      { clientKey: "c1", parentClientKey: "p1", status: "DONE" as const },
      { clientKey: "c2", parentClientKey: "p1", status: "NOT_STARTED" as const },
      { clientKey: "p2", parentClientKey: null, status: "DONE" as const },
    ];
    expect(computeOverallProgressFromStages(stages)).toBe(50);
  });

  it("родитель сдан, но подэтапы не все — не в зачёт", () => {
    const stages = [
      { clientKey: "p1", parentClientKey: null, status: "DONE" as const },
      { clientKey: "c1", parentClientKey: "p1", status: "DONE" as const },
      { clientKey: "c2", parentClientKey: "p1", status: "IN_PROGRESS" as const },
    ];
    expect(computeOverallProgressFromStages(stages)).toBe(0);
  });

  it("все подэтапы сданы — родитель в зачёт", () => {
    const stages = [
      { clientKey: "p1", parentClientKey: null, status: "NOT_STARTED" as const },
      { clientKey: "c1", parentClientKey: "p1", status: "DONE" as const },
      { clientKey: "c2", parentClientKey: "p1", status: "DONE" as const },
    ];
    expect(computeOverallProgressFromStages(stages)).toBe(100);
  });

  it("вложенные подэтапы: сдан только если всё дерево сдано", () => {
    const stages = [
      { clientKey: "p", parentClientKey: null, status: "DONE" as const },
      { clientKey: "m", parentClientKey: "p", status: "DONE" as const },
      { clientKey: "l", parentClientKey: "m", status: "NOT_STARTED" as const },
    ];
    expect(computeOverallProgressFromStages(stages)).toBe(0);
  });
});

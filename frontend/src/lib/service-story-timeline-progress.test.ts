import { describe, expect, it } from "vitest";
import {
  computeActiveBeatIndex,
  computeBeatBranchAcrossProgress,
  computeBeatReveal,
  computeLineHeightPx,
  computeSectionScrollProgress,
  computeTrackScrollProgress,
  buildBeatBranchPath,
} from "@/lib/service-story-timeline-progress";

describe("service-story-timeline-progress", () => {
  it("computeSectionScrollProgress clamped 0…1", () => {
    expect(computeSectionScrollProgress(500, 2000, 800)).toBe(0);
    const mid = computeSectionScrollProgress(-400, 2000, 800);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });

  it("computeTrackScrollProgress clamped 0…1", () => {
    const p = computeTrackScrollProgress(200, 4000, 900);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });

  it("линия скрыта до начала скролла", () => {
    expect(computeLineHeightPx(0, 100, 3000)).toBe(0);
  });

  it("линия растёт вместе со скроллом", () => {
    const early = computeLineHeightPx(0.1, 100, 3000);
    const late = computeLineHeightPx(0.6, 100, 3000);
    expect(late).toBeGreaterThan(early);
  });

  it("блоки открываются по очереди", () => {
    const total = 4;
    expect(computeBeatReveal(0.05, 0, total)).toBe(0);
    expect(computeBeatReveal(0.2, 0, total)).toBeGreaterThan(0);
    expect(computeBeatReveal(0.2, 1, total)).toBe(0);
    expect(computeBeatReveal(0.5, 1, total)).toBeGreaterThan(0);
  });

  it("ветка: от точки горизонтально влево или вправо", () => {
    const leftText = { spineX: 500, nodeY: 220, textEdgeX: 280, branchToRight: false };
    const early = buildBeatBranchPath(leftText, 0.3);
    expect(early.d).toMatch(/^M 500 220 L [\d.]+ 220$/);
    expect(parseFloat(early.d.split(" L ")[1].split(" ")[0])).toBeLessThan(500);

    const rightText = { spineX: 500, nodeY: 220, textEdgeX: 720, branchToRight: true };
    const rightPath = buildBeatBranchPath(rightText, 1);
    expect(rightPath.d).toBe("M 500 220 L 720 220");

    expect(computeBeatBranchAcrossProgress(0)).toBe(0);
    expect(computeBeatBranchAcrossProgress(1)).toBe(1);
  });

  it("computeActiveBeatIndex", () => {
    expect(computeActiveBeatIndex(0, 4)).toBe(0);
    expect(computeActiveBeatIndex(0.26, 4)).toBe(1);
    expect(computeActiveBeatIndex(1, 4)).toBe(3);
  });
});

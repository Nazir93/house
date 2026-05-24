import { describe, expect, it } from "vitest";
import { computeStoryTrackScrollProgress } from "@/lib/service-story-spine-layout";

describe("service-story-spine-layout", () => {
  it("computeStoryTrackScrollProgress clamped 0…1", () => {
    const p = computeStoryTrackScrollProgress(600, 400, 3000, 900);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });
});

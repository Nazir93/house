import { describe, expect, it, vi } from "vitest";
import { pausePageMediaForOverlay } from "@/lib/overlay-page-freeze";

describe("pausePageMediaForOverlay", () => {
  it("ставит playing video на паузу", () => {
    const playing = { paused: false, pause: vi.fn() };
    const alreadyPaused = { paused: true, pause: vi.fn() };
    const root = {
      querySelectorAll: () => [playing, alreadyPaused],
    } as unknown as ParentNode;

    pausePageMediaForOverlay(root);

    expect(playing.pause).toHaveBeenCalledTimes(1);
    expect(alreadyPaused.pause).not.toHaveBeenCalled();
  });
});

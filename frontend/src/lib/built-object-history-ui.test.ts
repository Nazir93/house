import { describe, expect, it } from "vitest";

import { toggleExclusiveHistoryStage } from "@/lib/built-object-history-ui";

describe("built-object-history-ui", () => {
  it("открывает этап с первого клика", () => {
    expect(toggleExclusiveHistoryStage(null, "walls")).toBe("walls");
  });

  it("повторный клик закрывает", () => {
    expect(toggleExclusiveHistoryStage("walls", "walls")).toBeNull();
  });

  it("клик по другому этапу переключает (один открытый)", () => {
    expect(toggleExclusiveHistoryStage("walls", "roof")).toBe("roof");
  });
});

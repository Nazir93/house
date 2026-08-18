import { describe, expect, it } from "vitest";

import { shouldLoadDeferredAnalytics } from "@/lib/analytics-defer";

describe("analytics-defer", () => {
  it("разрешает idle, interaction и timeout", () => {
    expect(shouldLoadDeferredAnalytics("idle")).toBe(true);
    expect(shouldLoadDeferredAnalytics("interaction")).toBe(true);
    expect(shouldLoadDeferredAnalytics("timeout")).toBe(true);
  });
});

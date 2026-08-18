import { describe, expect, it } from "vitest";

import { isLowPerfFromSignals, scoreLowPerfDevice } from "@/lib/perf-device";

describe("perf-device", () => {
  it("не считает iPhone с неизвестной памятью за 8 ГБ — включает low-perf", () => {
    expect(
      isLowPerfFromSignals({
        hardwareConcurrency: 6,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      }),
    ).toBe(true);
    expect(
      scoreLowPerfDevice({
        hardwareConcurrency: 6,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      }),
    ).toBe(3);
  });

  it("на desktop с 8 ГБ и многими ядрами не включает low-perf", () => {
    expect(
      isLowPerfFromSignals({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      }),
    ).toBe(false);
  });

  it("Android с 4 ГБ помечает как low-perf", () => {
    expect(
      isLowPerfFromSignals({
        hardwareConcurrency: 8,
        deviceMemory: 4,
        userAgent: "Mozilla/5.0 (Linux; Android 13) Chrome/120",
      }),
    ).toBe(true);
  });

  it("слабый desktop (2 ядра) — low-perf даже без mobile", () => {
    expect(
      isLowPerfFromSignals({
        hardwareConcurrency: 2,
        deviceMemory: 8,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(true);
  });
});

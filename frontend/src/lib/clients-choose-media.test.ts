import { describe, expect, it } from "vitest";

import {
  clientsChooseVideoSeekIntervalMs,
  shouldScrubClientsChooseVideoDense,
} from "@/lib/clients-choose-media";

describe("clients-choose-media", () => {
  it("на слабом телефоне не включает плотный scrub", () => {
    expect(
      shouldScrubClientsChooseVideoDense({
        hardwareConcurrency: 4,
        userAgent: "iPhone",
      }),
    ).toBe(false);
  });

  it("на обычном десктопе включает плотный scrub", () => {
    expect(
      shouldScrubClientsChooseVideoDense({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(true);
  });

  it("reduced-motion всегда без плотного scrub", () => {
    expect(
      shouldScrubClientsChooseVideoDense({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        prefersReducedMotion: true,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(false);
  });

  it("на weak seek реже", () => {
    expect(clientsChooseVideoSeekIntervalMs(true)).toBe(120);
    expect(clientsChooseVideoSeekIntervalMs(false)).toBe(360);
  });
});

import { describe, expect, it } from "vitest";

import {
  clientsChooseVideoSeekIntervalMs,
  shouldScrubClientsChooseVideoDense,
  shouldUseClientsChooseStaticMedia,
} from "@/lib/clients-choose-media";

describe("clients-choose-media", () => {
  it("на mobile и PWA показываем статичные картинки вместо видео", () => {
    expect(
      shouldUseClientsChooseStaticMedia({
        hardwareConcurrency: 4,
        userAgent: "iPhone",
      }),
    ).toBe(true);
    expect(
      shouldUseClientsChooseStaticMedia({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        displayMode: "standalone",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(true);
  });

  it("на десктопе в браузере — видео-скруб", () => {
    expect(
      shouldUseClientsChooseStaticMedia({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        displayMode: "browser",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(false);
  });

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
        displayMode: "browser",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(true);
  });

  it("reduced-motion — статика, без плотного scrub", () => {
    expect(
      shouldUseClientsChooseStaticMedia({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        prefersReducedMotion: true,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }),
    ).toBe(true);
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

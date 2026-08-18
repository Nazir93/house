import { describe, expect, it } from "vitest";

import {
  getRemainingLoaderDelay,
  getStartupLoaderHideDelay,
  isStandaloneDisplayMode,
  shouldShowMobileStartupLoader,
} from "@/lib/mobile-startup-loader";

describe("mobile-startup-loader", () => {
  it("на desktop показывает лоадер всегда, на mobile — только standalone", () => {
    expect(shouldShowMobileStartupLoader({ isMobileViewport: false, isStandaloneMode: false })).toBe(true);
    expect(shouldShowMobileStartupLoader({ isMobileViewport: false, isStandaloneMode: true })).toBe(true);
    expect(shouldShowMobileStartupLoader({ isMobileViewport: true, isStandaloneMode: true })).toBe(true);
    expect(shouldShowMobileStartupLoader({ isMobileViewport: true, isStandaloneMode: false })).toBe(false);
  });

  it("поддерживает modern и legacy признаки standalone", () => {
    expect(isStandaloneDisplayMode(true, undefined)).toBe(true);
    expect(isStandaloneDisplayMode(false, true)).toBe(true);
    expect(isStandaloneDisplayMode(false, false)).toBe(false);
  });

  it("корректно считает задержку до скрытия", () => {
    expect(getRemainingLoaderDelay(100, 550, 220)).toBe(430);
    expect(getRemainingLoaderDelay(100, 550, 800)).toBe(0);
    expect(getRemainingLoaderDelay(300, 550, 250)).toBe(550);
  });

  it("не даёт ждать дольше max даже если min ещё не вышел", () => {
    expect(
      getStartupLoaderHideDelay({
        startedAtMs: 0,
        nowMs: 100,
        minVisibleMs: 550,
        maxVisibleMs: 2800,
      }),
    ).toBe(450);
    expect(
      getStartupLoaderHideDelay({
        startedAtMs: 0,
        nowMs: 2700,
        minVisibleMs: 550,
        maxVisibleMs: 2800,
      }),
    ).toBe(0);
    expect(
      getStartupLoaderHideDelay({
        startedAtMs: 0,
        nowMs: 100,
        minVisibleMs: 550,
        maxVisibleMs: 200,
      }),
    ).toBe(100);
  });
});

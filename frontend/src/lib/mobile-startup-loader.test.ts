import { describe, expect, it } from "vitest";

import {
  getRemainingLoaderDelay,
  isStandaloneDisplayMode,
  shouldShowMobileStartupLoader,
} from "@/lib/mobile-startup-loader";

describe("mobile-startup-loader", () => {
  it("показывает лоадер только на мобильном в standalone", () => {
    expect(shouldShowMobileStartupLoader({ isMobileViewport: true, isStandaloneMode: true })).toBe(true);
    expect(shouldShowMobileStartupLoader({ isMobileViewport: false, isStandaloneMode: true })).toBe(false);
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
});

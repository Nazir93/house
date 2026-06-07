import { describe, expect, it, vi } from "vitest";
import {
  detectIosUserAgent,
  isStandaloneDisplayMode,
  pwaInstallBannerMessage,
  resolvePwaInstallPlatform,
  shouldShowPwaInstallBanner,
} from "@/lib/pwa-install-prompt";

describe("pwa-install-prompt", () => {
  it("isStandaloneDisplayMode: standalone или iOS navigator", () => {
    expect(
      isStandaloneDisplayMode(
        () => ({ matches: true }) as MediaQueryList,
        false
      )
    ).toBe(true);
    expect(
      isStandaloneDisplayMode(
        () => ({ matches: false }) as MediaQueryList,
        true
      )
    ).toBe(true);
  });

  it("detectIosUserAgent", () => {
    expect(detectIosUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(detectIosUserAgent("Mozilla/5.0 (Linux; Android 14)")).toBe(false);
  });

  it("resolvePwaInstallPlatform", () => {
    expect(resolvePwaInstallPlatform("Android", true)).toBe("android");
    expect(resolvePwaInstallPlatform("iPhone", false)).toBe("ios");
  });

  it("shouldShowPwaInstallBanner: скрыт в standalone и после dismiss", () => {
    expect(
      shouldShowPwaInstallBanner({
        dismissed: true,
        standalone: false,
        isMobileViewport: true,
        platform: "android",
      })
    ).toBe(false);
    expect(
      shouldShowPwaInstallBanner({
        dismissed: false,
        standalone: true,
        isMobileViewport: true,
        platform: "android",
      })
    ).toBe(false);
    expect(
      shouldShowPwaInstallBanner({
        dismissed: false,
        standalone: false,
        isMobileViewport: true,
        platform: "ios",
      })
    ).toBe(true);
  });

  it("pwaInstallBannerMessage: iOS и Android", () => {
    expect(pwaInstallBannerMessage("ios")).toContain("На экран Домой");
    expect(pwaInstallBannerMessage("android")).toContain("PWA");
  });
});

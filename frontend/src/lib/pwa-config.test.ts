import { describe, expect, it } from "vitest";
import {
  buildPwaManifest,
  buildPwaPrecacheUrls,
  isPwaEnabled,
  PWA_ICON_PATHS,
  PWA_SERWIST_GLOB_IGNORES,
  PWA_SERWIST_GLOB_PATTERNS,
  PWA_SW_URL,
  PWA_THEME_COLORS,
  resolvePwaCacheRevision,
  resolvePwaShortName,
} from "@/lib/pwa-config";

describe("pwa-config", () => {
  it("buildPwaManifest: start_url /, standalone, минимум 2 PNG-иконки", () => {
    const manifest = buildPwaManifest({
      siteName: "Часть души",
      description: "Строительство домов под ключ",
    });

    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.orientation).toBe("any");

    const pngIcons = manifest.icons?.filter((icon) => icon.type === "image/png") ?? [];
    expect(pngIcons.length).toBeGreaterThanOrEqual(2);
    expect(pngIcons.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(pngIcons.some((icon) => icon.sizes === "512x512")).toBe(true);
  });

  it("buildPwaManifest: пустой siteName → fallback", () => {
    const manifest = buildPwaManifest({ siteName: "  ", description: "Описание" });
    expect(manifest.short_name).toBe("Часть души");
    expect(manifest.name).toContain("Часть души");
  });

  it("resolvePwaShortName: длинное имя обрезается", () => {
    expect(resolvePwaShortName("Очень длинное название компании")).toHaveLength(12);
    expect(resolvePwaShortName("Короткое")).toBe("Короткое");
  });

  it("buildPwaPrecacheUrls: manifest и иконки", () => {
    const urls = buildPwaPrecacheUrls();
    expect(urls).toContain("/manifest.webmanifest");
    expect(urls).toContain(PWA_ICON_PATHS.png192);
    expect(urls).toContain(PWA_ICON_PATHS.png512);
    expect(urls).toContain(PWA_ICON_PATHS.appleTouch);
  });

  it("isPwaEnabled: только production", () => {
    expect(isPwaEnabled("production")).toBe(true);
    expect(isPwaEnabled("development")).toBe(false);
    expect(isPwaEnabled("test")).toBe(false);
    expect(isPwaEnabled(undefined)).toBe(false);
  });

  it("resolvePwaCacheRevision: непустая строка", () => {
    expect(resolvePwaCacheRevision().length).toBeGreaterThan(0);
  });

  it("PWA_SW_URL и theme colors заданы", () => {
    expect(PWA_SW_URL).toBe("/serwist/sw.js");
    expect(PWA_THEME_COLORS.light).toBe("#F6F6F4");
    expect(PWA_THEME_COLORS.dark).toBe("#121816");
  });

  it("Serwist glob: только icons, без видео и PDF", () => {
    expect(PWA_SERWIST_GLOB_PATTERNS.join(",")).toContain("icons");
    expect(PWA_SERWIST_GLOB_IGNORES.some((g) => g.includes("mp4"))).toBe(true);
    expect(PWA_SERWIST_GLOB_IGNORES.some((g) => g.includes("pdf"))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import {
  assertProtectedUrlRenameAllowed,
  isProtectedIndexedPath,
  listCurrentSeoCanonicalPaths,
  PROTECTED_INDEXED_PATHS,
  urlChangeHasRequiredPermanentRedirect,
} from "@/lib/seo/indexed-url-stability";
import { buildRedirectMap } from "@/lib/seo/redirect-map";

describe("indexed-url-stability (ТЗ SEO §22)", () => {
  it("фиксирует уже индексируемые каноны: /projects, /portfolio, /services/proektirovanie", () => {
    expect(PROTECTED_INDEXED_PATHS).toEqual(
      expect.arrayContaining([
        "/projects",
        "/portfolio",
        "/services/proektirovanie",
        "/projects/gazobeton",
        "/projects/kirpich",
        "/projects/keramoblok",
      ]),
    );
    expect(isProtectedIndexedPath("/projects")).toBe(true);
    expect(isProtectedIndexedPath("/stroitelstvo-domov-iz-gazobetona")).toBe(false);
  });

  it("текущие SEO-пути сайта совпадают с защищёнными канонами (не «украшали» URL)", () => {
    const current = listCurrentSeoCanonicalPaths();
    expect(current).toContain("/projects");
    expect(current).toContain("/services/proektirovanie");
    expect(current).toContain("/projects/gazobeton");
    expect(current.some((p) => p.includes("stroitelstvo-domov-iz"))).toBe(false);
    for (const path of [
      "/projects",
      "/services/proektirovanie",
      "/projects/gazobeton",
      "/projects/kirpich",
      "/projects/keramoblok",
    ]) {
      expect(isProtectedIndexedPath(path)).toBe(true);
    }
  });

  it("смена URL допустима только с permanent redirect на новый путь", () => {
    const map = buildRedirectMap(
      [{ fromPath: "/old-hub", toPath: "/projects", permanent: true }],
      { includeSeoLegacy: false },
    );
    expect(urlChangeHasRequiredPermanentRedirect("/old-hub", "/projects", map)).toBe(true);
    expect(urlChangeHasRequiredPermanentRedirect("/projects", "/katalog-proektov", map)).toBe(
      false,
    );
    expect(assertProtectedUrlRenameAllowed("/projects", "/katalog-proektov", map)).toEqual({
      ok: false,
      reason: expect.stringContaining("§22"),
    });
    expect(assertProtectedUrlRenameAllowed("/projects", "/projects", map)).toEqual({ ok: true });
  });
});

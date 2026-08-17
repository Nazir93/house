import { describe, expect, it } from "vitest";
import {
  buildRedirectMap,
  listRedirectChainSources,
  lookupRedirect,
  lookupRedirectResolved,
  normalizeRedirectPath,
  resolveProjectsMaterialQueryRedirect,
  SEO_LEGACY_PATH_REDIRECTS,
} from "./redirect-map";

describe("redirect-map (ТЗ SEO §21)", () => {
  it("нормализует путь без ведущего слэша и хвостового слэша", () => {
    expect(normalizeRedirectPath("old-page")).toBe("/old-page");
    expect(normalizeRedirectPath("/old-page/")).toBe("/old-page");
    expect(normalizeRedirectPath("/")).toBe("/");
  });

  it("находит редирект по точному пути", () => {
    const map = buildRedirectMap([{ fromPath: "/old", toPath: "/new", permanent: true }], {
      includeSeoLegacy: false,
    });
    expect(lookupRedirect(map, "/old")).toEqual({ toPath: "/new", permanent: true });
    expect(lookupRedirect(map, "/old/")).toEqual({ toPath: "/new", permanent: true });
    expect(lookupRedirect(map, "/missing")).toBeNull();
  });

  it("сохраняет флаг permanent для временных", () => {
    const map = buildRedirectMap([{ fromPath: "/a", toPath: "/b", permanent: false }], {
      includeSeoLegacy: false,
    });
    expect(lookupRedirect(map, "/a")?.permanent).toBe(false);
  });

  it("legacy stroitelstvo → сразу /projects/{материал}, без цепочки", () => {
    const map = buildRedirectMap([]);
    for (const row of SEO_LEGACY_PATH_REDIRECTS) {
      const resolved = lookupRedirectResolved(map, `${row.fromPath}/`);
      expect(resolved).toEqual({ toPath: row.toPath, permanent: true });
    }
  });

  it("склеивает A→B→C в один hop A→C", () => {
    const map = buildRedirectMap(
      [
        { fromPath: "/a", toPath: "/b", permanent: true },
        { fromPath: "/b", toPath: "/c", permanent: true },
      ],
      { includeSeoLegacy: false },
    );
    expect(listRedirectChainSources(map)).toEqual(["/a"]);
    expect(lookupRedirectResolved(map, "/a")).toEqual({ toPath: "/c", permanent: true });
  });

  it("?material= не редиректит на коммерческую ЧПУ (каталог с фильтром)", () => {
    expect(
      resolveProjectsMaterialQueryRedirect(
        "/projects",
        new URLSearchParams("material=gazobeton"),
      ),
    ).toBeNull();
    expect(
      resolveProjectsMaterialQueryRedirect(
        "/projects",
        new URLSearchParams("material=kirpich&floors=1"),
      ),
    ).toBeNull();
    expect(
      resolveProjectsMaterialQueryRedirect("/typical-projects", new URLSearchParams("material=kirpich")),
    ).toBeNull();
  });
});

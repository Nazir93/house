import { describe, expect, it } from "vitest";
import { buildRedirectMap, lookupRedirect, normalizeRedirectPath } from "./redirect-map";

describe("redirect-map", () => {
  it("нормализует путь без ведущего слэша и хвостового слэша", () => {
    expect(normalizeRedirectPath("old-page")).toBe("/old-page");
    expect(normalizeRedirectPath("/old-page/")).toBe("/old-page");
    expect(normalizeRedirectPath("/")).toBe("/");
  });

  it("находит редирект по точному пути", () => {
    const map = buildRedirectMap([{ fromPath: "/old", toPath: "/new", permanent: true }]);
    expect(lookupRedirect(map, "/old")).toEqual({ toPath: "/new", permanent: true });
    expect(lookupRedirect(map, "/old/")).toEqual({ toPath: "/new", permanent: true });
    expect(lookupRedirect(map, "/missing")).toBeNull();
  });

  it("сохраняет флаг permanent для 302", () => {
    const map = buildRedirectMap([{ fromPath: "/a", toPath: "/b", permanent: false }]);
    expect(lookupRedirect(map, "/a")?.permanent).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { shouldAnimatePageTransition } from "@/lib/page-transition";

describe("page-transition", () => {
  it("не анимирует первый paint / hydrate (ТЗ: LCP баннера)", () => {
    expect(
      shouldAnimatePageTransition({
        hasHydrated: false,
        pathname: "/",
        previousPathname: null,
      }),
    ).toBe(false);
    expect(
      shouldAnimatePageTransition({
        hasHydrated: true,
        pathname: "/",
        previousPathname: null,
      }),
    ).toBe(false);
  });

  it("анимирует только смену маршрута после hydrate", () => {
    expect(
      shouldAnimatePageTransition({
        hasHydrated: true,
        pathname: "/projects",
        previousPathname: "/",
      }),
    ).toBe(true);
    expect(
      shouldAnimatePageTransition({
        hasHydrated: true,
        pathname: "/",
        previousPathname: "/",
      }),
    ).toBe(false);
  });
});

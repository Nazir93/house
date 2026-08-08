import { describe, expect, it } from "vitest";
import { mergeHeroBannersFromDb } from "@/lib/service-landing-banners";
import type { ServiceLandingDocument } from "@/lib/service-landing-schema";

function docWithHero(desktop?: string, mobile?: string): ServiceLandingDocument {
  return {
    version: 1,
    sections: [
      {
        type: "hero",
        title: "Тест",
        subtitle: "",
        ...(desktop ? { bannerImageDesktop: desktop } : {}),
        ...(mobile ? { bannerImageMobile: mobile } : {}),
      },
    ],
  } as ServiceLandingDocument;
}

describe("mergeHeroBannersFromDb", () => {
  it("без URL из БД не меняет документ", () => {
    const base = docWithHero("/images/template.webp");
    expect(mergeHeroBannersFromDb(base, null, null)).toEqual(base);
    expect(mergeHeroBannersFromDb(base, "  ", "")).toEqual(base);
  });

  it("баннер из админки перекрывает шаблон landingJson", () => {
    const base = docWithHero("/images/template-desktop.webp", "/images/template-mobile.webp");
    const merged = mergeHeroBannersFromDb(base, "/uploads/admin-banner.webp", "/uploads/admin-banner.webp");
    const hero = merged.sections[0];
    expect(hero.type).toBe("hero");
    if (hero.type !== "hero") return;
    expect(hero.bannerImageDesktop).toBe("/uploads/admin-banner.webp");
    expect(hero.bannerImageMobile).toBe("/uploads/admin-banner.webp");
  });

  it("один URL из БД подставляется и на desktop, и на mobile", () => {
    const base = docWithHero("/images/template.webp");
    const merged = mergeHeroBannersFromDb(base, "/uploads/only-desktop.webp", null);
    const hero = merged.sections[0];
    if (hero.type !== "hero") return;
    expect(hero.bannerImageDesktop).toBe("/uploads/only-desktop.webp");
    expect(hero.bannerImageMobile).toBe("/uploads/only-desktop.webp");
  });
});

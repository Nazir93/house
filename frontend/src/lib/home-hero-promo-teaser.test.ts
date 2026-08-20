import { describe, expect, it } from "vitest";

import {
  formatHomeHeroPromoSlideEyebrow,
  homeHeroPromosForCatalogFilters,
  resolveHomeHeroPromoCaption,
} from "@/lib/home-hero-promo-teaser";
import type { HomeHeroPromoSlide } from "@/lib/home-hero-banner-schema";

const slide = (partial: Partial<HomeHeroPromoSlide>): HomeHeroPromoSlide => ({
  id: "promo-01",
  label: "Топас 4 в подарок",
  title: "Биостанция в подарок",
  caption: "Биостанция для новых клиентов в подарок",
  image: "/images/banner/banner-hero-01.png",
  href: "/promo",
  ...partial,
});

describe("home-hero-promo-teaser", () => {
  it("форматирует eyebrow как на главной карусели", () => {
    expect(formatHomeHeroPromoSlideEyebrow(0, "Топас 4 в подарок")).toBe("01 · Топас 4 в подарок");
    expect(formatHomeHeroPromoSlideEyebrow(9, "Акция")).toBe("10 · Акция");
  });

  it("берёт caption или запасной текст", () => {
    expect(resolveHomeHeroPromoCaption(slide({}))).toBe("Биостанция для новых клиентов в подарок");
    expect(resolveHomeHeroPromoCaption(slide({ caption: "" }))).toBe(
      "Фрагмент серии — топас 4 в подарок.",
    );
  });

  it("отфильтровывает пустые слайды для фильтров каталога", () => {
    const list = homeHeroPromosForCatalogFilters([
      slide({}),
      slide({ id: "bad", image: "  ", href: "/x" }),
      slide({ id: "ok2", label: "Сумерки", title: "Дом", caption: "" }),
    ]);
    expect(list.map((p) => p.id)).toEqual(["promo-01", "ok2"]);
  });
});

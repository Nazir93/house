import { describe, expect, it } from "vitest";

import {
  HOME_HERO_CTAS,
  HOME_HERO_SEO_LEAD,
  resolveHomeHeroLead,
} from "@/lib/home-hero-first-screen";

describe("home-hero-first-screen (SEO §2)", () => {
  it("короткий lead: каменные дома, материалы, гео — без простыни", () => {
    expect(HOME_HERO_SEO_LEAD).toContain("каменные частные дома");
    expect(HOME_HERO_SEO_LEAD).toMatch(/газобетон/i);
    expect(HOME_HERO_SEO_LEAD).toMatch(/керамический блок/i);
    expect(HOME_HERO_SEO_LEAD).toMatch(/кирпич/i);
    expect(HOME_HERO_SEO_LEAD).toContain("Санкт-Петербурге и Ленинградской области");
    expect(HOME_HERO_SEO_LEAD.length).toBeLessThan(280);
  });

  it("две основные CTA и дополнительная на строящийся объект", () => {
    expect(HOME_HERO_CTAS.map((c) => c.id)).toEqual(["estimate", "projects", "visit"]);
    expect(HOME_HERO_CTAS[0]).toMatchObject({
      label: "Рассчитать стоимость дома",
      action: "estimate",
      primary: true,
    });
    expect(HOME_HERO_CTAS[1]).toMatchObject({
      label: "Выбрать проект",
      href: "/projects",
      primary: true,
    });
    expect(HOME_HERO_CTAS[2]).toMatchObject({
      label: "Посетить строящийся объект",
      href: "/portfolio/under-construction",
      primary: false,
    });
  });

  it("resolveHomeHeroLead предпочитает SEO-текст", () => {
    expect(resolveHomeHeroLead(HOME_HERO_SEO_LEAD, "Старый подзаголовок")).toBe(HOME_HERO_SEO_LEAD);
    expect(resolveHomeHeroLead("  ", "Из баннера")).toBe("Из баннера");
  });
});

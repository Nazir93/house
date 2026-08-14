import { describe, expect, it } from "vitest";

import {
  formatMaterialFromPerM2,
  getMaterialCommercialLanding,
  hasMaterialCommercialLanding,
} from "@/lib/seo/project-material-commercial";
import { getProjectMaterialSeo } from "@/lib/seo/project-material-seo";

describe("project-material-commercial (этап 2 / ТЗ §11–12 на /projects/{материал})", () => {
  it.each([
    {
      slug: "gazobeton" as const,
      from: 65_825,
      titlePrefix: "Строительство домов из газобетона под ключ в СПб",
      h1: "Строительство домов из газобетона",
    },
    {
      slug: "kirpich" as const,
      from: 71_462,
      titlePrefix: "Строительство домов из кирпича под ключ в СПб",
      h1: "Строительство домов из кирпича",
    },
    {
      slug: "keramoblok" as const,
      from: 68_054,
      titlePrefix: "Строительство домов из керамоблока под ключ в СПб",
      h1: "Строительство домов из керамоблока",
    },
  ])("$slug: отдельная коммерческая посадочная на каноне, не stroitelstvo-*", ({ slug, from, titlePrefix, h1 }) => {
    expect(hasMaterialCommercialLanding(slug)).toBe(true);

    const landing = getMaterialCommercialLanding(slug);
    const seo = getProjectMaterialSeo(slug);
    expect(landing).not.toBeNull();
    expect(seo?.path).toBe(`/projects/${slug}`);
    expect(seo?.path).not.toContain("stroitelstvo-domov-iz");
    expect(seo?.title).toMatch(new RegExp(`^${titlePrefix}`));
    expect(seo?.h1).toBe(h1);
    expect(seo?.description).toMatch(/Проекты, стоимость/);
    expect(landing!.price.fromPerM2Rub).toBe(from);
    expect(formatMaterialFromPerM2(landing!.price.fromPerM2Rub)).toMatch(/^от .+ ₽\/м²$/);
    expect(landing!.ctas.map((c) => c.label)).toEqual([
      "Получить расчет стоимости",
      "Выбрать проект",
      "Посетить строящийся объект",
    ]);
    expect(landing!.included.items.length).toBeGreaterThanOrEqual(5);
    expect(landing!.stages.items.length).toBe(4);
    expect(landing!.wallTech.points.length).toBeGreaterThanOrEqual(3);
    expect(landing!.form.lead.toLowerCase()).toContain("калькулятор");
  });

  it("кирпич и керамоблок не слиты в одну посадочную", () => {
    const brick = getMaterialCommercialLanding("kirpich");
    const ceramic = getMaterialCommercialLanding("keramoblok");
    expect(brick!.slug).toBe("kirpich");
    expect(ceramic!.slug).toBe("keramoblok");
    expect(brick!.price.h2).not.toBe(ceramic!.price.h2);
    expect(brick!.wallTech.h2).not.toBe(ceramic!.wallTech.h2);
    expect(getProjectMaterialSeo("kirpich")?.h1).not.toBe(getProjectMaterialSeo("keramoblok")?.h1);
    expect(brick!.wallTech.lead.toLowerCase()).not.toContain("каменн");
    expect(ceramic!.wallTech.lead.toLowerCase()).not.toContain("каменн");
  });
});

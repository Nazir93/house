import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getServiceSeoBySlug } from "@/lib/seo/service-seo-defaults";
import {
  PROEKTROVANIE_HERO_SUBTITLE,
  PROEKTROVANIE_HERO_TITLE,
  PROEKTROVANIE_TIMELINE_ITEMS,
} from "@/lib/service-proektirovanie-landing";

/**
 * ТЗ SEO §10: проверка источника релевантности «tehnadzorspb».
 * Совпадений в коде лендинга/SEO нет — искусственно ничего не удаляем.
 */
describe("proektirovanie tehnadzorspb scan (SEO §10)", () => {
  const needles = ["tehnadzorspb", "tehnadzorspb.ru"];

  it("нет строк конкурента в SEO, hero и шаблонных текстах проектирования", () => {
    const seo = getServiceSeoBySlug("proektirovanie");
    const timeline = PROEKTROVANIE_TIMELINE_ITEMS.map((i) => `${i.title}\n${i.body}`).join("\n");
    const blob = [
      seo?.title,
      seo?.description,
      seo?.h1,
      ...(seo?.keywords ?? []),
      ...(seo?.landingTheses ?? []),
      PROEKTROVANIE_HERO_TITLE,
      PROEKTROVANIE_HERO_SUBTITLE,
      timeline,
    ]
      .join("\n")
      .toLowerCase();

    for (const needle of needles) {
      expect(blob).not.toContain(needle);
    }
    expect(PROEKTROVANIE_HERO_TITLE).toBe("Проектирование частных домов");
  });

  it("нет строк конкурента в исходниках лендинга проектирования", () => {
    const roots = [
      "src/lib/seo/service-seo-defaults.ts",
      "src/lib/service-proektirovanie-landing.ts",
      "src/lib/get-service-landing-page.ts",
      "src/app/services/[slug]/page.tsx",
      "src/lib/services-hub-data.ts",
    ];
    for (const rel of roots) {
      const text = readFileSync(join(process.cwd(), rel), "utf8").toLowerCase();
      for (const needle of needles) {
        expect(text, rel).not.toContain(needle);
      }
    }
  });
});

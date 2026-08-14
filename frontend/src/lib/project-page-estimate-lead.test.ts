import { describe, expect, it } from "vitest";

import { estimatePayloadHasDetailedCalc } from "@/lib/lp-contact-cta";
import { projectPageEstimateLeadMeta } from "@/lib/project-page-estimate-lead";

describe("projectPageEstimateLeadMeta", () => {
  it("собирает заявку с карточки проекта без детального калькулятора", () => {
    const meta = projectPageEstimateLeadMeta({
      slug: "aurora",
      title: "Аврора",
      materialLabel: "Газобетон",
      priceRub: 5_200_000.4,
    });

    expect(meta.source).toBe("project-page-estimate");
    expect(meta.service).toBe("Смета · проект Аврора");
    expect(meta.calcData).toEqual({
      projectSlug: "aurora",
      projectTitle: "Аврора",
      materialLabel: "Газобетон",
      priceRub: 5_200_000,
    });
    expect(estimatePayloadHasDetailedCalc(meta.calcData)).toBe(false);
  });

  it("без цены и материала — только проект", () => {
    const meta = projectPageEstimateLeadMeta({ slug: "line", title: "  " });
    expect(meta.service).toBe("Смета · проект line");
    expect(meta.calcData).toEqual({
      projectSlug: "line",
      projectTitle: "line",
    });
  });

  it("нулевая цена не попадает в calcData", () => {
    const meta = projectPageEstimateLeadMeta({
      slug: "a",
      title: "A",
      priceRub: 0,
      materialLabel: "  ",
    });
    expect(meta.calcData).toEqual({
      projectSlug: "a",
      projectTitle: "A",
    });
  });
});

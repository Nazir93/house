import { describe, expect, it } from "vitest";

import {
  ADVERTISING_LANDING_SLUGS,
  getAdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import {
  lpQuizStepsBlurb,
  lpQuizStepsChain,
  resolveLpQuizSteps,
} from "@/lib/advertising-landing-quiz-steps";

describe("resolveLpQuizSteps", () => {
  it("без preset — 6 шагов, включая материал и этажность", () => {
    const steps = resolveLpQuizSteps();
    expect(steps).toHaveLength(6);
    expect(steps.map((s) => s.id)).toEqual([
      "material",
      "area",
      "floors",
      "budget",
      "mortgage",
      "contact",
    ]);
  });

  it("кирпичный LP — без шага материала, в заявке остаётся brick", () => {
    const steps = resolveLpQuizSteps("brick");
    expect(steps).toHaveLength(5);
    expect(steps.every((s) => s.id !== "material")).toBe(true);
    expect(steps[0]?.id).toBe("area");
  });

  it("одноэтажный LP — без шага этажности", () => {
    const steps = resolveLpQuizSteps({ floorsPreset: "1" });
    expect(steps).toHaveLength(5);
    expect(steps.every((s) => s.id !== "floors")).toBe(true);
    expect(steps.some((s) => s.id === "material")).toBe(true);
  });

  it("материал + этажность вместе — 4 шага", () => {
    const steps = resolveLpQuizSteps({
      wallMaterialPreset: "brick",
      floorsPreset: "1",
    });
    expect(steps).toHaveLength(4);
    expect(steps.map((s) => s.id)).toEqual(["area", "budget", "mortgage", "contact"]);
  });
});

describe("lpQuizStepsBlurb / chain", () => {
  it("для кирпичного LP — 5 шагов без материала", () => {
    const steps = resolveLpQuizSteps("brick");
    expect(lpQuizStepsBlurb(steps)).toBe(
      "5 шагов: площадь, этажность, бюджет, ипотека и контакты.",
    );
    expect(lpQuizStepsBlurb(steps).toLowerCase()).not.toContain("материал");
  });

  it("chain отражает фактические шаги", () => {
    const chain = lpQuizStepsChain(resolveLpQuizSteps({ floorsPreset: "1" }));
    expect(chain.startsWith("материал → площадь → бюджет")).toBe(true);
    expect(chain).not.toContain("этажность");
  });
});

/** ТЗ: пресеты квиза по системе kirpich — на всех материальных/форматных LP. */
describe("quizDefaults по всем рекламным LP", () => {
  it("у каждого slug есть serviceLabel для модалки и квиза", () => {
    for (const slug of ADVERTISING_LANDING_SLUGS) {
      const config = getAdvertisingLandingConfig(slug);
      expect(config?.quizDefaults?.serviceLabel, slug).toBeTruthy();
    }
  });

  it("материальные LP пропускают шаг материала", () => {
    expect(getAdvertisingLandingConfig("kirpich")?.quizDefaults?.wallMaterial).toBe("brick");
    expect(getAdvertisingLandingConfig("gazobeton")?.quizDefaults?.wallMaterial).toBe("gas");
    expect(getAdvertisingLandingConfig("keramoblok")?.quizDefaults?.wallMaterial).toBe("ceramic");

    for (const slug of ["kirpich", "gazobeton", "keramoblok"] as const) {
      const config = getAdvertisingLandingConfig(slug)!;
      const steps = resolveLpQuizSteps({
        wallMaterialPreset: config.quizDefaults?.wallMaterial,
        floorsPreset: config.quizDefaults?.floors,
      });
      expect(steps.every((s) => s.id !== "material"), slug).toBe(true);
      expect(steps).toHaveLength(5);
    }
  });

  it("одноэтажный LP пропускает шаг этажности", () => {
    const config = getAdvertisingLandingConfig("odnoetazhnye")!;
    expect(config.quizDefaults?.floors).toBe("1");
    const steps = resolveLpQuizSteps({
      wallMaterialPreset: config.quizDefaults?.wallMaterial,
      floorsPreset: config.quizDefaults?.floors,
    });
    expect(steps.every((s) => s.id !== "floors")).toBe(true);
    expect(steps).toHaveLength(5);
  });

  it("общие LP оставляют выбор материала и этажности", () => {
    for (const slug of ["dom-pod-klyuch", "stoimost"] as const) {
      const config = getAdvertisingLandingConfig(slug)!;
      expect(config.quizDefaults?.wallMaterial, slug).toBeUndefined();
      expect(config.quizDefaults?.floors, slug).toBeUndefined();
      const steps = resolveLpQuizSteps({
        wallMaterialPreset: config.quizDefaults?.wallMaterial,
        floorsPreset: config.quizDefaults?.floors,
      });
      expect(steps).toHaveLength(6);
    }
  });
});

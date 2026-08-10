import { describe, expect, it } from "vitest";

import {
  lpQuizStepsBlurb,
  resolveLpQuizSteps,
} from "@/lib/advertising-landing-quiz-steps";

describe("resolveLpQuizSteps", () => {
  it("без preset — 6 шагов, включая материал", () => {
    const steps = resolveLpQuizSteps();
    expect(steps).toHaveLength(6);
    expect(steps[0]?.id).toBe("material");
  });

  it("кирпичный LP — без шага материала, в заявке остаётся brick", () => {
    const steps = resolveLpQuizSteps("brick");
    expect(steps).toHaveLength(5);
    expect(steps.every((s) => s.id !== "material")).toBe(true);
    expect(steps[0]?.id).toBe("area");
  });
});

describe("lpQuizStepsBlurb", () => {
  it("для кирпичного LP — 5 шагов без материала", () => {
    const blurb = lpQuizStepsBlurb(resolveLpQuizSteps("brick"));
    expect(blurb).toBe("5 шагов: площадь, этажность, бюджет, ипотека и контакты.");
    expect(blurb.toLowerCase()).not.toContain("материал");
  });
});

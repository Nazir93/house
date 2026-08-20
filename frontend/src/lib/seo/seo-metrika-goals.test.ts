import { describe, expect, it } from "vitest";

import {
  SEO_METRIKA_TZ_GOAL_STATUS,
  SEO_METRIKA_TZ_GOALS,
  isMortgageLeadSource,
  isProjectOpenPath,
  isVisitConstructionLeadSource,
  isVisitConstructionPath,
  listWiredSeoMetrikaTzGoals,
} from "@/lib/seo/seo-metrika-goals";
import { METRIKA_GOAL_IDS } from "@/lib/analytics-goals";

describe("seo-metrika-goals (ТЗ SEO §24)", () => {
  it("чеклист ТЗ: whatsapp_click пропущен, остальные wired", () => {
    expect(SEO_METRIKA_TZ_GOAL_STATUS.whatsapp_click).toBe("skip");
    expect(listWiredSeoMetrikaTzGoals().sort()).toEqual(
      [
        "calculate_complete",
        "calculate_start",
        "form_submit",
        "mortgage_request",
        "phone_click",
        "project_open",
        "telegram_click",
        "visit_construction_request",
      ].sort(),
    );
    expect(listWiredSeoMetrikaTzGoals()).not.toContain(SEO_METRIKA_TZ_GOALS.whatsappClick);
  });

  it("wired цели есть в METRIKA_GOAL_IDS (кроме уже существовавших phone/telegram)", () => {
    for (const goal of listWiredSeoMetrikaTzGoals()) {
      expect(METRIKA_GOAL_IDS).toContain(goal);
    }
    expect(METRIKA_GOAL_IDS).not.toContain("whatsapp_click");
  });

  it("project_open — карточка проекта, не хаб материала", () => {
    expect(isProjectOpenPath("/projects/dom-alpha")).toBe(true);
    expect(isProjectOpenPath("/projects/dom-alpha/")).toBe(true);
    expect(isProjectOpenPath("/typical-projects/partner-1")).toBe(true);
    expect(isProjectOpenPath("/projects")).toBe(false);
    expect(isProjectOpenPath("/projects/gazobeton")).toBe(false);
    expect(isProjectOpenPath("/projects/kirpich")).toBe(false);
    expect(isProjectOpenPath("/projects/keramoblok")).toBe(false);
    expect(isProjectOpenPath("/portfolio/house-1")).toBe(false);
  });

  it("visit_construction — under-construction; mortgage/visit lead sources", () => {
    expect(isVisitConstructionPath("/portfolio/under-construction")).toBe(true);
    expect(isVisitConstructionPath("/portfolio")).toBe(false);
    expect(isMortgageLeadSource("mortgage")).toBe(true);
    expect(isMortgageLeadSource("house-project-mortgage")).toBe(true);
    expect(isMortgageLeadSource("calculator")).toBe(false);
    expect(isVisitConstructionLeadSource("portfolio-case-cta")).toBe(true);
    expect(isVisitConstructionLeadSource("portfolio-tour")).toBe(true);
  });
});

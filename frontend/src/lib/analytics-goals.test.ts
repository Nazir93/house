import { describe, expect, it } from "vitest";

import {
  collectTrafficParams,
  METRIKA_GOAL_IDS,
  METRIKA_GOALS,
  METRIKA_REACH_GOAL_TIMEOUT_MS,
  metrikaGoalForLeadSource,
  metrikaGoalForLpCallbackSource,
  shouldSendSpaMetrikaHit,
  shouldTrackQuizComplete,
} from "@/lib/analytics-goals";
import { LEAD_SOURCE_OPTIONS } from "@/lib/lead-sources";

describe("collectTrafficParams", () => {
  it("maps Direct URL params to lead payload fields", () => {
    expect(
      collectTrafficParams(
        "?utm_source=yandex&utm_medium=cpc&utm_campaign=kirpich_search&utm_term=дом%20из%20кирpича&utm_content=ad-1&yclid=123",
      ),
    ).toEqual({
      utmSource: "yandex",
      utmMedium: "cpc",
      utmCampaign: "kirpich_search",
      utmTerm: "дом из кирpича",
      utmContent: "ad-1",
      yclid: "123",
    });
  });

  it("returns nulls for absent or blank params", () => {
    expect(collectTrafficParams("?utm_source=&utm_medium= ")).toEqual({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      yclid: null,
    });
  });
});

describe("metrikaGoalForLeadSource", () => {
  it("maps every configured lead source to a dedicated goal", () => {
    for (const option of LEAD_SOURCE_OPTIONS) {
      expect(metrikaGoalForLeadSource(option.value), option.value).not.toBeNull();
    }
  });

  it("maps LP quiz slugs to LP goals (UI 593966484 / 593985668 / 594449404)", () => {
    expect(metrikaGoalForLeadSource("lp-kirpich")).toBe(METRIKA_GOALS.leadLpKirpich);
    expect(metrikaGoalForLeadSource("lp-gazobeton")).toBe(METRIKA_GOALS.leadLpGazobeton);
    expect(metrikaGoalForLeadSource("lp-keramoblok")).toBe(METRIKA_GOALS.leadLpKeramoblok);
  });

  it("maps LP menu callback sources (UI 593975324 / 593994796 / 594449441)", () => {
    expect(metrikaGoalForLpCallbackSource("lp-kirpich-header-callback")).toBe(
      METRIKA_GOALS.leadLpKirpichCallback,
    );
    expect(metrikaGoalForLeadSource("lp-kirpich-nav-callback")).toBe(METRIKA_GOALS.leadLpKirpichCallback);
    expect(metrikaGoalForLeadSource("lp-keramoblok-header-callback")).toBe(
      METRIKA_GOALS.leadLpKeramoblokCallback,
    );
    expect(metrikaGoalForLeadSource("lp-gazobeton-nav-callback")).toBe(
      METRIKA_GOALS.leadLpGazobetonCallback,
    );
  });

  it("maps site calculator to lead_calculator (UI 594448264)", () => {
    expect(metrikaGoalForLeadSource("calculator")).toBe(METRIKA_GOALS.leadCalculator);
    expect(metrikaGoalForLeadSource("promo-qr-banner")).toBe(METRIKA_GOALS.leadCalculator);
  });

  it("maps mortgage variants separately", () => {
    expect(metrikaGoalForLeadSource("mortgage")).toBe(METRIKA_GOALS.leadMortgage);
    expect(metrikaGoalForLeadSource("house-project-mortgage")).toBe(METRIKA_GOALS.leadMortgageProject);
    expect(metrikaGoalForLeadSource("project-calculator")).toBe(METRIKA_GOALS.leadProject);
    expect(metrikaGoalForLeadSource("project-page-estimate")).toBe(METRIKA_GOALS.leadProject);
  });

  it("maps partner and service prefixes", () => {
    expect(metrikaGoalForLeadSource("partner-vacancy")).toBe(METRIKA_GOALS.leadPartnerVacancy);
    expect(metrikaGoalForLeadSource("service-foundation")).toBe(METRIKA_GOALS.leadService);
    expect(metrikaGoalForLeadSource("service-consult-roofing")).toBe(METRIKA_GOALS.leadServiceConsult);
  });
});

describe("shouldTrackQuizComplete", () => {
  it("true только для квиза/калькулятора, не для callback", () => {
    expect(shouldTrackQuizComplete("lp-gazobeton")).toBe(true);
    expect(shouldTrackQuizComplete("calculator")).toBe(true);
    expect(shouldTrackQuizComplete("lp-gazobeton-header-callback")).toBe(false);
    expect(shouldTrackQuizComplete("lp-kirpich-nav-callback")).toBe(false);
  });
});

describe("SPA hit", () => {
  it("пропускает первый просмотр после init", () => {
    expect(shouldSendSpaMetrikaHit(true)).toBe(false);
    expect(shouldSendSpaMetrikaHit(false)).toBe(true);
  });
});

describe("METRIKA_GOAL_IDS", () => {
  it("lists unique JavaScript goal identifiers for Yandex Metrika UI", () => {
    expect(METRIKA_GOAL_IDS.length).toBe(37);
    expect(new Set(METRIKA_GOAL_IDS).size).toBe(METRIKA_GOAL_IDS.length);
    expect(METRIKA_GOAL_IDS).toContain("lead_submit");
    expect(METRIKA_GOAL_IDS).toContain("lead_lp_gazobeton");
    expect(METRIKA_GOAL_IDS).toContain("lead_lp_gazobeton_callback");
    expect(METRIKA_GOAL_IDS).toContain("lead_lp_kirpich_callback");
    expect(METRIKA_GOAL_IDS).toContain("lead_lp_keramoblok_callback");
    expect(METRIKA_GOAL_IDS).toContain("lead_calculator");
    expect(METRIKA_GOAL_IDS).not.toContain("whatsapp_click");
    expect(METRIKA_REACH_GOAL_TIMEOUT_MS).toBeGreaterThanOrEqual(400);
  });
});

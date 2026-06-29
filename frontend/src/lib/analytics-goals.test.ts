import { describe, expect, it } from "vitest";

import {
  collectTrafficParams,
  METRIKA_GOAL_IDS,
  METRIKA_GOALS,
  metrikaGoalForLeadSource,
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

  it("maps LP slugs to LP goals", () => {
    expect(metrikaGoalForLeadSource("lp-kirpich")).toBe(METRIKA_GOALS.leadLpKirpich);
    expect(metrikaGoalForLeadSource("lp-gazobeton")).toBe(METRIKA_GOALS.leadLpGazobeton);
  });

  it("maps mortgage variants separately", () => {
    expect(metrikaGoalForLeadSource("mortgage")).toBe(METRIKA_GOALS.leadMortgage);
    expect(metrikaGoalForLeadSource("house-project-mortgage")).toBe(METRIKA_GOALS.leadMortgageProject);
  });

  it("maps partner and service prefixes", () => {
    expect(metrikaGoalForLeadSource("partner-vacancy")).toBe(METRIKA_GOALS.leadPartnerVacancy);
    expect(metrikaGoalForLeadSource("service-foundation")).toBe(METRIKA_GOALS.leadService);
    expect(metrikaGoalForLeadSource("service-consult-roofing")).toBe(METRIKA_GOALS.leadServiceConsult);
  });
});

describe("METRIKA_GOAL_IDS", () => {
  it("lists unique JavaScript goal identifiers for Yandex Metrika UI", () => {
    expect(METRIKA_GOAL_IDS.length).toBe(28);
    expect(new Set(METRIKA_GOAL_IDS).size).toBe(METRIKA_GOAL_IDS.length);
    expect(METRIKA_GOAL_IDS).toContain("lead_submit");
    expect(METRIKA_GOAL_IDS).toContain("lead_mortgage_project");
    expect(METRIKA_GOAL_IDS).toContain("lead_service_consult");
  });
});

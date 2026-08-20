import { describe, expect, it } from "vitest";

import {
  buildFirstTouchTraffic,
  buildLeadTrafficCalcFields,
  collectTrafficParams,
  mergeTrafficParams,
  parsePersistedTraffic,
} from "@/lib/analytics-traffic";

describe("analytics-traffic", () => {
  it("maps Direct URL params", () => {
    expect(
      collectTrafficParams(
        "?utm_source=yandex&utm_medium=cpc&utm_campaign=kirpich_search&utm_term=дом&utm_content=ad-1&yclid=123",
      ),
    ).toEqual({
      utmSource: "yandex",
      utmMedium: "cpc",
      utmCampaign: "kirpich_search",
      utmTerm: "дом",
      utmContent: "ad-1",
      yclid: "123",
    });
  });

  it("merge: non-null next wins, else keep prev", () => {
    expect(
      mergeTrafficParams(
        { utmSource: "yandex", utmMedium: "cpc", utmCampaign: "a", utmTerm: null, utmContent: null, yclid: "1" },
        { utmSource: null, utmMedium: "organic", utmCampaign: null, utmTerm: "x", utmContent: null, yclid: null },
      ),
    ).toEqual({
      utmSource: "yandex",
      utmMedium: "organic",
      utmCampaign: "a",
      utmTerm: "x",
      utmContent: null,
      yclid: "1",
    });
  });

  it("first-touch сохраняет landing и referrer, не затирает UTM пустым query", () => {
    const first = buildFirstTouchTraffic({
      search: "?utm_source=yandex&yclid=99",
      href: "https://chastdushi.ru/lp/gazobeton?utm_source=yandex&yclid=99",
      referrer: "https://yandex.ru/",
      existing: null,
    });
    expect(first.utmSource).toBe("yandex");
    expect(first.yclid).toBe("99");
    expect(first.landingUrl).toContain("/lp/gazobeton");
    expect(first.referrer).toBe("https://yandex.ru/");

    const next = buildFirstTouchTraffic({
      search: "",
      href: "https://chastdushi.ru/spasibo",
      referrer: "",
      existing: first,
    });
    expect(next.utmSource).toBe("yandex");
    expect(next.yclid).toBe("99");
    expect(next.landingUrl).toContain("/lp/gazobeton");
    expect(next.referrer).toBe("https://yandex.ru/");
  });

  it("parsePersistedTraffic устойчив к мусору", () => {
    expect(parsePersistedTraffic(null)).toBeNull();
    expect(parsePersistedTraffic("{")).toBeNull();
    expect(parsePersistedTraffic(JSON.stringify({ utmSource: "yandex" }))?.utmSource).toBe("yandex");
  });

  it("buildLeadTrafficCalcFields кладёт formType и traffic", () => {
    expect(buildLeadTrafficCalcFields({ formType: "lp-quiz", material: "gas", landingUrl: "/lp", referrer: "r" })).toEqual({
      formType: "lp-quiz",
      wallMaterial: "gas",
      material: "gas",
      traffic: { landingUrl: "/lp", referrer: "r", formType: "lp-quiz" },
    });
  });
});

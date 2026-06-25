import { describe, expect, it } from "vitest";

import { collectTrafficParams } from "@/lib/analytics-goals";

describe("collectTrafficParams", () => {
  it("maps Direct URL params to lead payload fields", () => {
    expect(
      collectTrafficParams(
        "?utm_source=yandex&utm_medium=cpc&utm_campaign=kirpich_search&utm_term=дом%20из%20кирпича&utm_content=ad-1&yclid=123"
      )
    ).toEqual({
      utmSource: "yandex",
      utmMedium: "cpc",
      utmCampaign: "kirpich_search",
      utmTerm: "дом из кирпича",
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


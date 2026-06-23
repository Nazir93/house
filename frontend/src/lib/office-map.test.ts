import { describe, expect, it } from "vitest";

import {
  YANDEX_OFFICE_MAP_CONSTRUCTOR_ID,
  getYandexOfficeMapEmbedUrl,
  getYandexOfficeMapLinkUrl,
  getYandexOfficePedestrianRouteUrl,
  formatOfficeMetroWalkingLabel,
  OFFICE_METRO_DIRECTIONS,
} from "./office-map";

describe("office-map", () => {
  it("getYandexOfficeMapEmbedUrl — конструктор Яндекс.Карт", () => {
    const url = getYandexOfficeMapEmbedUrl();
    expect(url).toContain("map-widget/v1/");
    expect(url).toContain(`constructor%3A${encodeURIComponent(YANDEX_OFFICE_MAP_CONSTRUCTOR_ID)}`);
    expect(url).toContain("source=constructor");
  });

  it("getYandexOfficeMapLinkUrl — точка офиса", () => {
    expect(getYandexOfficeMapLinkUrl()).toContain("yandex.ru/maps/?pt=");
  });

  it("getYandexOfficePedestrianRouteUrl — маршрут от метро", () => {
    const metro = OFFICE_METRO_DIRECTIONS[0];
    const url = getYandexOfficePedestrianRouteUrl(metro);
    expect(url).toContain("rtext=");
    expect(url).toContain("rtt=pd");
    expect(url).toContain(String(metro.geoLat));
  });

  it("formatOfficeMetroWalkingLabel", () => {
    expect(formatOfficeMetroWalkingLabel(OFFICE_METRO_DIRECTIONS[0])).toContain("Петроградская");
  });
});

import { describe, expect, it } from "vitest";
import { normalizeRussiaMapCoordinates, yandexMapsPointUrl } from "@/lib/map-tiles";

describe("normalizeRussiaMapCoordinates", () => {
  it("не меняет корректные координаты СПб", () => {
    expect(normalizeRussiaMapCoordinates(59.93, 30.35)).toEqual({
      latitude: 59.93,
      longitude: 30.35,
      swapped: false,
    });
  });

  it("меняет местами перепутанные широту и долготу", () => {
    expect(normalizeRussiaMapCoordinates(30.35, 59.93)).toEqual({
      latitude: 59.93,
      longitude: 30.35,
      swapped: true,
    });
  });
});

describe("yandexMapsPointUrl", () => {
  it("строит ссылку Яндекс.Карт в формате lon,lat", () => {
    expect(yandexMapsPointUrl(59.93, 30.35, 12)).toContain("ll=30.35%2C59.93");
    expect(yandexMapsPointUrl(59.93, 30.35, 12)).toContain("z=12");
  });
});

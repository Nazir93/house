import { describe, expect, it } from "vitest";

import {
  buildBuiltObjectLocationFieldsFromInputs,
  formatCoordinate,
  parseCoordinate,
  resolveBuiltObjectLocationFromCoordinates,
  resolveDistrictFromCoordinates,
  resolveRegionFromCoordinates,
} from "@/lib/built-object-location-from-coords";

/**
 * Автоподстановка региона и района в админке портфолио по координатам (без платных API).
 */
describe("built-object-location-from-coords", () => {
  it("parseCoordinate accepts comma decimal and trims spaces", () => {
    expect(parseCoordinate(" 59,731536 ")).toBeCloseTo(59.731536, 5);
  });

  it("parseCoordinate returns null for empty or invalid input", () => {
    expect(parseCoordinate("")).toBeNull();
    expect(parseCoordinate("abc")).toBeNull();
  });

  it("resolve vyritsa demo coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(59.407, 30.346)).toEqual({
      regionSlug: "lo",
      district: "vyritsa",
    });
  });

  it("resolve vsevolozhsk demo coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(60.255, 30.527)).toEqual({
      regionSlug: "lo",
      district: "vsevolozhsk",
    });
  });

  it("resolve vyborg demo coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(60.713, 28.753)).toEqual({
      regionSlug: "lo",
      district: "vyborg",
    });
  });

  it("resolve priyutninskoe demo coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(59.25, 29.91)).toEqual({
      regionSlug: "lo",
      district: "priyutninskoe",
    });
  });

  it("resolve gatchina coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(59.57, 30.13)).toEqual({
      regionSlug: "lo",
      district: "gatchina",
    });
  });

  it("resolve eastern LO coordinates to vsevolozhsk", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(59.731536, 33.298553)).toEqual({
      regionSlug: "lo",
      district: "vsevolozhsk",
    });
  });

  it("resolve ramenskoe demo coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(55.567, 38.23)).toEqual({
      regionSlug: "mo",
      district: "ramenskoe",
    });
  });

  it("resolve novgorod city coordinates", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(58.521, 31.271)).toEqual({
      regionSlug: "vnovgorod",
      district: "novgorod_city",
    });
  });

  it("coordinates outside service regions → other without district", () => {
    expect(resolveBuiltObjectLocationFromCoordinates(45.0, 35.0)).toEqual({
      regionSlug: "other",
      district: "",
    });
  });

  it("swaps reversed latitude and longitude before resolving district", () => {
    expect(buildBuiltObjectLocationFieldsFromInputs("30.346", "59.407")).toEqual({
      latitude: "59.407",
      longitude: "30.346",
      regionSlug: "lo",
      district: "vyritsa",
    });
  });

  it("buildBuiltObjectLocationFieldsFromInputs returns null when one coordinate is missing", () => {
    expect(buildBuiltObjectLocationFieldsFromInputs("59.731536", "")).toBeNull();
    expect(buildBuiltObjectLocationFieldsFromInputs("", "33.298553")).toBeNull();
  });

  it("buildBuiltObjectLocationFieldsFromInputs fills region and district from pasted strings", () => {
    expect(buildBuiltObjectLocationFieldsFromInputs("59.731536", "33.298553")).toEqual({
      latitude: "59.731536",
      longitude: "33.298553",
      regionSlug: "lo",
      district: "vsevolozhsk",
    });
  });

  it("fallback to nearest district center when point is in region but outside bbox", () => {
    expect(resolveRegionFromCoordinates(59.8, 30.25)).toBe("lo");
    expect(resolveDistrictFromCoordinates(59.8, 30.25, "lo")).toBe("gatchina");
  });

  it("formatCoordinate keeps 6 decimals", () => {
    expect(formatCoordinate(59.731536)).toBe("59.731536");
  });
});

describe("built-object-location-from-coords workflow (admin autofill)", () => {
  it("вставка координат → регион ЛО и район без внешних ключей", () => {
    const patch = buildBuiltObjectLocationFieldsFromInputs("59.407", "30.346");
    expect(patch).toEqual({
      latitude: "59.407",
      longitude: "30.346",
      regionSlug: "lo",
      district: "vyritsa",
    });
  });

  it("не заполняет район для региона «другое»", () => {
    const patch = buildBuiltObjectLocationFieldsFromInputs("45", "35");
    expect(patch?.regionSlug).toBe("other");
    expect(patch?.district).toBe("");
  });
});

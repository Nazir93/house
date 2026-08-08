import { describe, expect, it } from "vitest";

import {
  formatHouseProjectFloorsLabel,
  parseHouseProjectFloors,
} from "@/lib/house-project-floors";

describe("parseHouseProjectFloors", () => {
  it("сохраняет 1.5 (раньше Int обрезал до 1)", () => {
    expect(parseHouseProjectFloors(1.5)).toBe(1.5);
    expect(parseHouseProjectFloors("1.5")).toBe(1.5);
    expect(parseHouseProjectFloors("1,5")).toBe(1.5);
  });

  it("целые этажи", () => {
    expect(parseHouseProjectFloors(1)).toBe(1);
    expect(parseHouseProjectFloors("2")).toBe(2);
  });

  it("округление к шагу 0.5", () => {
    expect(parseHouseProjectFloors(1.4)).toBe(1.5);
    expect(parseHouseProjectFloors(1.2)).toBe(1);
  });

  it("fallback при мусоре", () => {
    expect(parseHouseProjectFloors("abc", 1)).toBe(1);
    expect(parseHouseProjectFloors("", 2)).toBe(2);
  });
});

describe("formatHouseProjectFloorsLabel", () => {
  it("1.5 → 1,5 для UI", () => {
    expect(formatHouseProjectFloorsLabel(1.5)).toBe("1,5");
    expect(formatHouseProjectFloorsLabel(2)).toBe("2");
  });
});

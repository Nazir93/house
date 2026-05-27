import { describe, expect, it } from "vitest";
import {
  fractionToPercentInput,
  normalizeSettingsInput,
  parsePositiveFloat,
  parsePositiveInt,
  percentInputToFraction,
} from "./admin-calculator-save";

describe("admin-calculator-save (админка калькулятора)", () => {
  describe("parsePositiveInt", () => {
    it("округляет и отбрасывает отрицательные", () => {
      expect(parsePositiveInt(65825.7, 0)).toBe(65826);
      expect(parsePositiveInt(-10, 5)).toBe(5);
      expect(parsePositiveInt("abc", 100)).toBe(100);
    });
  });

  describe("parsePositiveFloat", () => {
    it("сохраняет дробные коэффициенты", () => {
      expect(parsePositiveFloat(1.234, 1)).toBe(1.234);
      expect(parsePositiveFloat(undefined, 0.8)).toBe(0.8);
    });
  });

  describe("percent ↔ fraction", () => {
    it("15% → 0.15 и обратно", () => {
      expect(percentInputToFraction(15)).toBe(0.15);
      expect(fractionToPercentInput(0.15)).toBe(15);
    });

    it("отрицательный процент → 0", () => {
      expect(percentInputToFraction(-5)).toBe(0);
    });
  });

  describe("normalizeSettingsInput", () => {
    it("happy path: поля из формы админки", () => {
      expect(
        normalizeSettingsInput({
          smallAreaThresholdM2: 120,
          smallAreaSurchargePercent: 12.5,
          blindAreaWidthM: 1,
        })
      ).toEqual({
        smallAreaThresholdM2: 120,
        smallAreaSurcharge: 0.125,
        blindAreaWidthM: 1,
      });
    });

    it("пустые/битые значения — дефолты", () => {
      expect(normalizeSettingsInput({})).toEqual({
        smallAreaThresholdM2: 100,
        smallAreaSurcharge: 0.15,
        blindAreaWidthM: 0.8,
      });
    });

    it("строковые числа из input", () => {
      expect(
        normalizeSettingsInput({
          smallAreaThresholdM2: "95",
          smallAreaSurchargePercent: "20",
          blindAreaWidthM: "0.5",
        })
      ).toEqual({
        smallAreaThresholdM2: 95,
        smallAreaSurcharge: 0.2,
        blindAreaWidthM: 0.5,
      });
    });
  });
});

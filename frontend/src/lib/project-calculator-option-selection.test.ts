import { describe, expect, it } from "vitest";
import {
  sanitizeConstructionOptionSelection,
  shouldAutoExpandCalculatorOptionDetail,
  toggleConstructionOptionSelection,
} from "./project-calculator-option-selection";

describe("toggleConstructionOptionSelection", () => {
  it("нельзя выбрать фальцевую и мягкую кровлю одновременно", () => {
    const selected = toggleConstructionOptionSelection(["roof_folding"], "roof_soft");
    expect([...selected].sort()).toEqual(["roof_soft"]);
  });

  it("нельзя выбрать утепление 200 мм и 250 мм одновременно", () => {
    const selected = toggleConstructionOptionSelection(["roof_insulation_200"], "roof_insulation_250");
    expect([...selected].sort()).toEqual(["roof_insulation_250"]);
  });

  it("обычные строительные опции можно комбинировать", () => {
    const selected = toggleConstructionOptionSelection(["blind_area"], "drainage");
    expect([...selected].sort()).toEqual(["blind_area", "drainage"]);
  });

  it("повторный клик снимает выбранную опцию", () => {
    const selected = toggleConstructionOptionSelection(["roof_soft"], "roof_soft");
    expect([...selected]).toEqual([]);
  });

  it("sanitizeConstructionOptionSelection убирает конфликтующие опции из сохранённого набора", () => {
    const sanitized = sanitizeConstructionOptionSelection([
      "roof_folding",
      "roof_soft",
      "roof_insulation_200",
      "roof_insulation_250",
      "gutter",
    ]);
    expect(sanitized.sort()).toEqual(["gutter", "roof_soft", "roof_insulation_250"].sort());
  });
});

describe("shouldAutoExpandCalculatorOptionDetail", () => {
  it("при включённой галочке и наличии описания/картинки — раскрыть", () => {
    expect(shouldAutoExpandCalculatorOptionDetail({ checked: true, hasDetail: true })).toBe(true);
  });

  it("без галочки — свернуть (даже если есть описание/картинка)", () => {
    expect(shouldAutoExpandCalculatorOptionDetail({ checked: false, hasDetail: true })).toBe(false);
  });

  it("без контента — не раскрывать", () => {
    expect(shouldAutoExpandCalculatorOptionDetail({ checked: true, hasDetail: false })).toBe(false);
  });
});

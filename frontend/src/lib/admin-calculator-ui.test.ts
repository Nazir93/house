import { describe, expect, it } from "vitest";
import {
  calculatorCategoryTitle,
  CALCULATOR_GROUP_LABELS,
  CALCULATOR_WALL_LABELS,
} from "./admin-calculator-ui";

describe("admin-calculator-ui (админка калькулятора)", () => {
  it("подписи групп для массового изменения цен", () => {
    expect(CALCULATOR_GROUP_LABELS.construction).toBe("Стройопции");
    expect(CALCULATOR_GROUP_LABELS.engineering).toBe("Инженерия");
    expect(CALCULATOR_GROUP_LABELS.shell).toBe("Коробка (все категории)");
    expect(Object.keys(CALCULATOR_GROUP_LABELS)).toEqual(
      expect.arrayContaining(["construction", "engineering", "facade", "shell"])
    );
  });

  it("подписи материалов стен", () => {
    expect(CALCULATOR_WALL_LABELS.gas).toBe("Газобетон");
    expect(CALCULATOR_WALL_LABELS.ceramic).toBe("Керамоблок");
    expect(CALCULATOR_WALL_LABELS.brick).toBe("Кирпич");
  });

  it("calculatorCategoryTitle — код и подпись", () => {
    expect(calculatorCategoryTitle("a")).toContain("Категория a");
    expect(calculatorCategoryTitle("a")).toContain("двухскатная");
    expect(calculatorCategoryTitle("f", "2 этажа")).toContain("2 этажа");
    expect(calculatorCategoryTitle("g")).toContain("2 эт., двухскатная");
    expect(calculatorCategoryTitle("h")).toContain("2 эт., трёхскатная");
  });
});

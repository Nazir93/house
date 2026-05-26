import { describe, expect, it } from "vitest";

import { calculatorAddonGroupSum } from "@/lib/calculator-addon-group-sum";

describe("calculatorAddonGroupSum", () => {
  it("суммирует только выбранные позиции", () => {
    const group = {
      title: "Тест",
      items: [
        { id: "a", name: "A", price: 100 },
        { id: "b", name: "B", price: 200 },
      ],
    };
    expect(
      calculatorAddonGroupSum(group, { a: true, b: false }, (it) => it.price),
    ).toBe(100);
    expect(
      calculatorAddonGroupSum(group, { a: true, b: true }, (it) => it.price),
    ).toBe(300);
  });
});

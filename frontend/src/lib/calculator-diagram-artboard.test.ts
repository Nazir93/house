import { describe, expect, it } from "vitest";

import {
  CALCULATOR_DIAGRAM_ARTBOARD,
  SHOW_CALCULATOR_OPTION_WORK_IMAGES,
  calculatorOptionWorkImageUrl,
  hasCalculatorOptionWorkDetail,
} from "@/lib/calculator-diagram-artboard";

describe("calculator-diagram-artboard", () => {
  it("белая подложка только для картинок схем", () => {
    expect(CALCULATOR_DIAGRAM_ARTBOARD).toBe("#ffffff");
  });

  it("пока схемы в составе работ опций скрыты", () => {
    expect(SHOW_CALCULATOR_OPTION_WORK_IMAGES).toBe(false);
    expect(calculatorOptionWorkImageUrl("/uploads/options/facade.png")).toBe("");
    expect(
      hasCalculatorOptionWorkDetail({
        description: null,
        imageUrl: "/uploads/options/facade.png",
      }),
    ).toBe(false);
    expect(
      hasCalculatorOptionWorkDetail({
        description: "Монтаж термопанелей",
        imageUrl: "/uploads/options/facade.png",
      }),
    ).toBe(true);
  });
});

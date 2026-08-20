import { describe, expect, it } from "vitest";

import {
  CALCULATOR_DIAGRAM_ARTBOARD,
  SHOW_CALCULATOR_FACADE_WORK_IMAGES,
  calculatorOptionWorkImageUrl,
  hasCalculatorOptionWorkDetail,
} from "@/lib/calculator-diagram-artboard";

describe("calculator-diagram-artboard", () => {
  it("белая подложка только для картинок схем", () => {
    expect(CALCULATOR_DIAGRAM_ARTBOARD).toBe("#ffffff");
  });

  it("схемы скрыты только у фасада; у остальных опций картинки остаются", () => {
    expect(SHOW_CALCULATOR_FACADE_WORK_IMAGES).toBe(false);
    expect(
      calculatorOptionWorkImageUrl("/uploads/options/facade.png", {
        hideImage: !SHOW_CALCULATOR_FACADE_WORK_IMAGES,
      }),
    ).toBe("");
    expect(calculatorOptionWorkImageUrl("/uploads/options/drainage.png")).toBe(
      "/uploads/options/drainage.png",
    );
    expect(
      hasCalculatorOptionWorkDetail({
        description: null,
        imageUrl: "/uploads/options/facade.png",
        hideImage: !SHOW_CALCULATOR_FACADE_WORK_IMAGES,
      }),
    ).toBe(false);
    expect(
      hasCalculatorOptionWorkDetail({
        description: "Монтаж термопанелей",
        imageUrl: "/uploads/options/facade.png",
        hideImage: !SHOW_CALCULATOR_FACADE_WORK_IMAGES,
      }),
    ).toBe(true);
    expect(
      hasCalculatorOptionWorkDetail({
        description: null,
        imageUrl: "/uploads/options/drainage.png",
      }),
    ).toBe(true);
  });
});

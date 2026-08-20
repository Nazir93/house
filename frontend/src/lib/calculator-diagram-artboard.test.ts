import { describe, expect, it } from "vitest";

import { CALCULATOR_DIAGRAM_ARTBOARD } from "@/lib/calculator-diagram-artboard";

describe("calculator-diagram-artboard", () => {
  it("белая подложка — единый фон схем и блока «Состав работ»", () => {
    expect(CALCULATOR_DIAGRAM_ARTBOARD).toBe("#ffffff");
  });
});

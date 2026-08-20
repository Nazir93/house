import { describe, expect, it } from "vitest";

import { CALCULATOR_DIAGRAM_ARTBOARD } from "@/lib/calculator-diagram-artboard";

describe("calculator-diagram-artboard", () => {
  it("светлая подложка не зависит от темы (скрывает клетку на тёмном --bg)", () => {
    expect(CALCULATOR_DIAGRAM_ARTBOARD).toMatch(/^#[0-9a-fA-F]{6}$/);
    const hex = CALCULATOR_DIAGRAM_ARTBOARD.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    expect((r + g + b) / 3).toBeGreaterThan(180);
  });
});

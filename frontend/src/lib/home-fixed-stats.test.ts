import { describe, expect, it } from "vitest";

import { STATS } from "@/lib/constants";
import { formatHomeFixedStatValue } from "@/lib/home-fixed-stats";

describe("home-fixed-stats", () => {
  it("форматирует число и суффикс для HTML (не 0 до анимации)", () => {
    expect(formatHomeFixedStatValue(13, "")).toBe("13");
    expect(formatHomeFixedStatValue(120, "+")).toBe("120+");
    expect(formatHomeFixedStatValue(85, "+")).toBe("85+");
    expect(formatHomeFixedStatValue(3, "")).toBe("3");
  });

  it("STATS на главной — реальные значения, не нули", () => {
    expect(STATS.map((s) => formatHomeFixedStatValue(s.value, s.suffix))).toEqual([
      "13",
      "120+",
      "85+",
      "3",
    ]);
  });
});

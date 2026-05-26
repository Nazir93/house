import { describe, expect, it } from "vitest";

import { formatImplementationDays, formatFloorsLabel, houseTypeSubtitle } from "@/lib/built-object-detail";

describe("built-object-detail", () => {
  it("formatImplementationDays — склонение", () => {
    expect(formatImplementationDays("211")).toBe("211 дней");
    expect(formatImplementationDays("1")).toBe("1 день");
    expect(formatImplementationDays("22")).toBe("22 дня");
    expect(formatImplementationDays("7 месяцев")).toBeNull();
  });

  it("formatFloorsLabel", () => {
    expect(formatFloorsLabel(1.5)).toBe("1,5 этажа");
    expect(formatFloorsLabel(2)).toBe("2 этажа");
  });

  it("houseTypeSubtitle", () => {
    expect(houseTypeSubtitle("Кирпич")).toBe("Кирпичный дом");
  });
});

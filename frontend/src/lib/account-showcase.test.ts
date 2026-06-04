import { describe, expect, it } from "vitest";

import { ACCOUNT_SHOWCASE_ITEMS, accountShowcaseTitles } from "@/lib/account-showcase";

describe("account-showcase", () => {
  it("covers the four strongest client cabinet areas", () => {
    expect(accountShowcaseTitles()).toEqual(["Этапы строительства", "Фотоотчёты", "Документы", "Платежи"]);
  });

  it("keeps every card ready for a visual showcase", () => {
    for (const item of ACCOUNT_SHOWCASE_ITEMS) {
      expect(item.image).toMatch(/^\/images\//);
      expect(item.metrics.length).toBe(3);
      expect(item.points.length).toBeGreaterThanOrEqual(3);
    }
  });
});

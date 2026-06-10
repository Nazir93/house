import { describe, expect, it } from "vitest";

import {
  ACCOUNT_SHOWCASE_ITEMS,
  accountShowcaseHeadlines,
  resolveAccountShowcaseImage,
} from "@/lib/account-showcase";

describe("account-showcase", () => {
  it("covers seven client cabinet areas without camera", () => {
    expect(accountShowcaseHeadlines()).toEqual([
      "Обзор объекта",
      "Контроль сроков",
      "Прозрачный прогресс",
      "Порядок в бумагах",
      "Финансовая ясность",
      "Связь с компанией",
      "Ничего не пропустить",
    ]);
    expect(ACCOUNT_SHOWCASE_ITEMS.some((item) => item.id === "camera")).toBe(false);
  });

  it("keeps every card ready for a visual showcase", () => {
    for (const item of ACCOUNT_SHOWCASE_ITEMS) {
      expect(item.image).toMatch(/^\/images\/account\/showcase-/);
      expect(item.metrics.length).toBe(3);
      expect(item.points.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("switches themed screenshots by site theme", () => {
    const dashboard = ACCOUNT_SHOWCASE_ITEMS[0];
    expect(resolveAccountShowcaseImage(dashboard, "light")).toBe("/images/account/showcase-dashboard-light.png");
    expect(resolveAccountShowcaseImage(dashboard, "dark")).toBe("/images/account/showcase-dashboard-dark.png");

    const stages = ACCOUNT_SHOWCASE_ITEMS[1];
    expect(resolveAccountShowcaseImage(stages, "light")).toBe("/images/account/showcase-stages-light.png");
    expect(resolveAccountShowcaseImage(stages, "dark")).toBe("/images/account/showcase-stages-dark.png");

    const photos = ACCOUNT_SHOWCASE_ITEMS[2];
    expect(resolveAccountShowcaseImage(photos, "light")).toBe("/images/account/showcase-photos-light.png");
    expect(resolveAccountShowcaseImage(photos, "dark")).toBe("/images/account/showcase-photos-dark.png");

    const documents = ACCOUNT_SHOWCASE_ITEMS[3];
    expect(resolveAccountShowcaseImage(documents, "light")).toBe("/images/account/showcase-documents-light.png");
    expect(resolveAccountShowcaseImage(documents, "dark")).toBe("/images/account/showcase-documents-dark.png");

    const payments = ACCOUNT_SHOWCASE_ITEMS[4];
    expect(resolveAccountShowcaseImage(payments, "light")).toBe("/images/account/showcase-payments-light.png");
    expect(resolveAccountShowcaseImage(payments, "dark")).toBe("/images/account/showcase-payments-dark.png");

    const support = ACCOUNT_SHOWCASE_ITEMS[5];
    expect(resolveAccountShowcaseImage(support, "light")).toBe("/images/account/showcase-support-light.png");
    expect(resolveAccountShowcaseImage(support, "dark")).toBe("/images/account/showcase-support-dark.png");

    const notifications = ACCOUNT_SHOWCASE_ITEMS[6];
    expect(resolveAccountShowcaseImage(notifications, "light")).toBe("/images/account/showcase-notifications-light.png");
    expect(resolveAccountShowcaseImage(notifications, "dark")).toBe("/images/account/showcase-notifications-dark.png");
  });
});

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_SHOWCASE_ITEMS,
  ACCOUNT_SHOWCASE_SECTION_CALLOUT,
  ACCOUNT_SHOWCASE_SECTION_INTRO,
  ACCOUNT_SHOWCASE_SECTION_TITLE,
  ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT,
  accountShowcaseHeadlines,
  resolveAccountShowcaseImage,
} from "@/lib/account-showcase";

describe("account-showcase", () => {
  it("intro copy for client cabinet section on homepage", () => {
    expect(ACCOUNT_SHOWCASE_SECTION_TITLE).toBe("Стройка под контролем — в одном личном кабинете");
    expect(ACCOUNT_SHOWCASE_SECTION_INTRO).toContain("этапы работ, фотоотчёты, документы и платежи");
    expect(ACCOUNT_SHOWCASE_SECTION_INTRO).toContain("подписывать документы удалённо");
    expect(ACCOUNT_SHOWCASE_SECTION_CALLOUT).toContain("Всё важное по проекту — под рукой");
  });

  it("first three showcase cards match homepage copy spec", () => {
    const [dashboard, stages, photos] = ACCOUNT_SHOWCASE_ITEMS;
    expect(dashboard?.headline).toBe("Обзор проекта");
    expect(dashboard?.description).toContain("ключевая информация по дому");
    expect(stages?.headline).toBe("Этапы под контролем");
    expect(stages?.description).toContain("какие работы уже выполнены");
    expect(photos?.headline).toBe("Фотоотчёты по этапам");
    expect(photos?.description).toContain("по этапам строительства");
  });

  it("cards 4–6 match homepage copy spec", () => {
    const documents = ACCOUNT_SHOWCASE_ITEMS[3];
    const payments = ACCOUNT_SHOWCASE_ITEMS[4];
    const support = ACCOUNT_SHOWCASE_ITEMS[5];
    expect(documents?.headline).toBe("Документы в одном месте");
    expect(documents?.description).toContain("подписывать удалённо");
    expect(payments?.description).toContain("график платежей, история оплат");
    expect(support?.description).toContain("сохраняются в истории проекта");
  });

  it("footer guest copy for client cabinet section", () => {
    expect(ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT).toContain("современное строительство");
    expect(ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT).toContain("понятный, открытый процесс");
    expect(ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT).not.toContain("управляемый процесс");
  });

  it("card 7 notifications matches homepage copy spec", () => {
    const notifications = ACCOUNT_SHOWCASE_ITEMS[6];
    expect(notifications?.headline).toBe("Всё важное — в одном месте");
    expect(notifications?.description).toContain("Центр уведомлений");
    expect(notifications?.description).toContain("ответы нашей команды");
  });

  it("covers seven client cabinet areas without camera", () => {
    expect(accountShowcaseHeadlines()).toEqual([
      "Обзор проекта",
      "Этапы под контролем",
      "Фотоотчёты по этапам",
      "Документы в одном месте",
      "Финансовая ясность",
      "Связь с компанией",
      "Всё важное — в одном месте",
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

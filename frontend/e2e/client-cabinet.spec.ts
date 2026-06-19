import { test, expect } from "@playwright/test";
import {
  cleanupE2eCabinetFixture,
  E2E_SECRET,
  loginClientAccount,
  seedE2eCabinetFixture,
  type E2eCabinetFixture,
} from "./helpers/client-account";

let fixture: E2eCabinetFixture | null = null;

test.describe("Личный кабинет — критический путь", () => {
  test.beforeAll(async ({ request }) => {
    const deep = await request.get("/api/health?deep=1");
    test.skip(!deep.ok(), "БД недоступна — пропуск E2E ЛК");

    fixture = await seedE2eCabinetFixture(request);
    test.skip(!fixture, `Нет seed API (E2E_SECRET=${E2E_SECRET})`);
  });

  test.afterAll(async ({ request }) => {
    if (fixture) await cleanupE2eCabinetFixture(request);
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!fixture, "нет фикстуры");
    await loginClientAccount(page, fixture!.contractNumber, fixture!.password);
  });

  test("звоночек ведёт в центр уведомлений", async ({ page }) => {
    await page.goto("/account/dashboard");
    const bell = page.locator('header a[href="/account/notifications"]').first();
    await expect(bell).toHaveAttribute("href", "/account/notifications");
    await bell.click();
    await expect(page).toHaveURL(/\/account\/notifications/);
    await expect(page.getByRole("heading", { name: "Уведомления" })).toBeVisible();
  });

  test("уведомление о документе → раздел «Документы»", async ({ page }) => {
    await page.goto("/account/notifications");
    await page
      .getByRole("button", { name: /ознакомления и подписания/i })
      .click();
    await expect(page).toHaveURL(/\/account\/documents/);
    await expect(page.getByRole("heading", { name: "Документы" })).toBeVisible();
    await expect(page.getByText("Ожидает ознакомления")).toBeVisible();
  });

  test("скачивание документа → «Ожидает подписания»", async ({ page }) => {
    await page.goto("/account/documents");
    await expect(page.getByText(fixture!.documentFilename).first()).toBeVisible();

    const downloadHref = `/api/client/documents/${fixture!.documentId}/download`;
    const downloadPromise = page.waitForEvent("download");
    await page.goto(downloadHref).catch((err: Error) => {
      if (!/Download is starting/i.test(err.message)) throw err;
    });
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("E2E");

    await page.goto("/account/documents");
    await expect(page.getByText("Ожидает подписания")).toBeVisible();
  });

  test("главная: навигация в платежи", async ({ page }) => {
    await page.goto("/account/dashboard");
    await expect(page.getByRole("heading", { name: "E2E — тестовый объект" })).toBeVisible();
    await page.getByRole("link", { name: "Платежи", exact: true }).click();
    await expect(page).toHaveURL(/\/account\/payments/);
  });
});

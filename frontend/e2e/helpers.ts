import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

/** Успешная загрузка документа (учитывает редиректы до финального ответа). */
export async function expectPublicPage(
  page: Page,
  path: string,
  options?: { waitUntil?: "domcontentloaded" | "load" | "commit" }
): Promise<Response | null> {
  const res = await page.goto(path, {
    waitUntil: options?.waitUntil ?? "domcontentloaded",
  });
  expect(res, `нет ответа для ${path}`).toBeTruthy();
  expect(res!.status(), `${path}: HTTP ${res!.status()}`).toBeLessThan(400);
  await expect(page.locator("body")).toBeVisible();
  return res;
}

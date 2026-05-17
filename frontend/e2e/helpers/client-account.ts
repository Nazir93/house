import type { APIRequestContext, Page } from "@playwright/test";

export const E2E_SECRET = process.env.E2E_SECRET?.trim() || "local-e2e-secret";

export type E2eCabinetFixture = {
  contractNumber: string;
  password: string;
  projectId: string;
  documentId: string;
  notificationId: string;
  documentFilename: string;
};

export async function seedE2eCabinetFixture(
  request: APIRequestContext
): Promise<E2eCabinetFixture | null> {
  const res = await request.post("/api/e2e/client-cabinet", {
    headers: { "x-e2e-secret": E2E_SECRET },
  });
  if (!res.ok()) return null;
  return (await res.json()) as E2eCabinetFixture;
}

export async function cleanupE2eCabinetFixture(request: APIRequestContext): Promise<void> {
  await request.delete("/api/e2e/client-cabinet", {
    headers: { "x-e2e-secret": E2E_SECRET },
  });
}

export async function loginClientAccount(
  page: Page,
  contractNumber: string,
  password: string
): Promise<void> {
  await page.goto("/account/login");
  await page.getByPlaceholder("Например, Д-2025-001").fill(contractNumber);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(/\/account\/(dashboard|notifications|documents)/, { timeout: 30_000 });
}

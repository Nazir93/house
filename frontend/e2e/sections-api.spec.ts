import { test, expect } from "@playwright/test";

test.describe("API", () => {
  test("GET /api/health — процесс жив", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok(), `HTTP ${res.status()}`).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; service?: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBe("house-next");
  });
});

import { describe, expect, it, vi } from "vitest";
import { authorizeAdminCredentials } from "@/lib/auth-credentials";

vi.mock("@/lib/db", () => ({ prisma: {} }));

vi.mock("@/lib/public-rate-limit-db", () => ({
  peekPublicRateLimitCount: vi.fn().mockResolvedValue(0),
  checkPublicRateLimitDb: vi.fn().mockResolvedValue(true),
}));

describe("auth-credentials", () => {
  it("admin: принимает ADMIN_SECRET", async () => {
    process.env.ADMIN_EMAIL = "ops@example.com";
    process.env.ADMIN_SECRET = "secret123";
    delete process.env.ADMIN_PASSWORD_HASH;

    const user = await authorizeAdminCredentials("ops@example.com", "secret123");
    expect(user?.role).toBe("admin");
  });

  it("admin: отклоняет неверный пароль", async () => {
    process.env.ADMIN_EMAIL = "ops@example.com";
    process.env.ADMIN_SECRET = "secret123";

    const user = await authorizeAdminCredentials("ops@example.com", "wrong");
    expect(user).toBeNull();
  });
});

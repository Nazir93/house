import { describe, expect, it, vi } from "vitest";
import { checkPublicRateLimitDb } from "@/lib/public-rate-limit-db";

vi.mock("@/lib/db", () => ({
  prisma: {
    publicRateBucket: {
      upsert: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

import { prisma } from "@/lib/db";

describe("public-rate-limit-db", () => {
  it("разрешает запросы в пределах лимита", async () => {
    vi.mocked(prisma.publicRateBucket.upsert).mockResolvedValue({
      scopeKey: "review:1.1.1.1",
      bucketStart: new Date(),
      count: 1,
      updatedAt: new Date(),
    });

    const ok = await checkPublicRateLimitDb({
      scope: "review",
      key: "1.1.1.1",
      max: 5,
      windowMs: 60_000,
    });
    expect(ok).toBe(true);
  });

  it("блокирует при превышении лимита", async () => {
    vi.mocked(prisma.publicRateBucket.upsert).mockResolvedValue({
      scopeKey: "review:1.1.1.1",
      bucketStart: new Date(),
      count: 6,
      updatedAt: new Date(),
    });

    const ok = await checkPublicRateLimitDb({
      scope: "review",
      key: "1.1.1.1",
      max: 5,
      windowMs: 60_000,
    });
    expect(ok).toBe(false);
  });
});

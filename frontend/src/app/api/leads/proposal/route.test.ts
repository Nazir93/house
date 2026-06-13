import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireAdminApiSession = vi.fn();
const thankYouFindUnique = vi.fn();
const leadFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    thankYouToken: {
      findUnique: (...args: unknown[]) => thankYouFindUnique(...args),
    },
    lead: {
      findUnique: (...args: unknown[]) => leadFindUnique(...args),
    },
  },
}));

vi.mock("@/lib/require-admin-api", () => ({
  requireAdminApiSession: (...args: unknown[]) => requireAdminApiSession(...args),
}));

import { GET } from "@/app/api/leads/proposal/route";

describe("GET /api/leads/proposal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminApiSession.mockResolvedValue({ ok: true, session: { user: { role: "admin" } } });
    thankYouFindUnique.mockResolvedValue({
      leadId: "lead-1",
      expiresAt: new Date(Date.now() + 60_000),
    });
    leadFindUnique.mockResolvedValue({
      proposalStatus: "PENDING",
      proposalPath: null,
      proposalFilename: null,
      proposalError: null,
    });
  });

  it("returns 202 with proposal status while file is pending", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads/proposal?token=abc");
    const res = await GET(req);
    const json = (await res.json()) as { status?: string };

    expect(res.status).toBe(202);
    expect(json.status).toBe("PENDING");
  });
});


import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const upsertRateBucket = vi.fn();
const deleteRateBuckets = vi.fn();
const txLeadCreate = vi.fn();
const txThankYouCreate = vi.fn();
const dbTransaction = vi.fn();
const sendTelegramNotification = vi.fn();
const sendBitrixLead = vi.fn();
const generateLeadProposalPdf = vi.fn();

vi.mock("uuid", () => ({
  v4: () => "uuid-test-token",
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    leadIpRateBucket: {
      upsert: (...args: unknown[]) => upsertRateBucket(...args),
      deleteMany: (...args: unknown[]) => deleteRateBuckets(...args),
    },
    $transaction: (...args: unknown[]) => dbTransaction(...args),
  },
}));

vi.mock("@/lib/telegram", () => ({
  sendTelegramNotification: (...args: unknown[]) => sendTelegramNotification(...args),
  formatLeadMessage: () => "formatted",
}));

vi.mock("@/lib/bitrix", () => ({
  sendBitrixLead: (...args: unknown[]) => sendBitrixLead(...args),
}));

vi.mock("@/lib/proposal/proposal-service", () => ({
  generateLeadProposalPdf: (...args: unknown[]) => generateLeadProposalPdf(...args),
}));

import { POST } from "@/app/api/leads/route";

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertRateBucket.mockResolvedValue({ count: 1 });
    deleteRateBuckets.mockResolvedValue({ count: 0 });
    txLeadCreate.mockResolvedValue({
      id: "lead-1",
      name: "Иван",
      phone: "+79990000000",
      email: null,
      calcData: { kind: "house-construction-quote", area: "114" },
      createdAt: new Date("2026-06-13T10:00:00.000Z"),
    });
    txThankYouCreate.mockResolvedValue({ id: "ty-1" });
    dbTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        lead: { create: (...args: unknown[]) => txLeadCreate(...args) },
        thankYouToken: { create: (...args: unknown[]) => txThankYouCreate(...args) },
      })
    );
    sendTelegramNotification.mockResolvedValue(undefined);
    sendBitrixLead.mockResolvedValue(undefined);
    generateLeadProposalPdf.mockRejectedValue(new Error("pdf failed"));
  });

  it("does not fail request when proposal generation crashes", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Иван",
        phone: "+7 999 000 00 00",
        source: "calculator",
        calcData: { kind: "house-construction-quote", area: "114" },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const json = (await res.json()) as { success?: boolean; redirectUrl?: string; proposalStatus?: string };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.redirectUrl).toContain("/spasibo?token=uuid-test-token");
    expect(json.proposalStatus).toBe("PENDING");
    expect(generateLeadProposalPdf).toHaveBeenCalledOnce();
  });
});


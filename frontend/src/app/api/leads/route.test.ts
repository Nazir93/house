import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const upsertRateBucket = vi.fn();
const deleteRateBuckets = vi.fn();
const txLeadCreate = vi.fn();
const txThankYouCreate = vi.fn();
const dbTransaction = vi.fn();
const sendTelegramNotification = vi.fn();
const sendBitrixLead = vi.fn();
const scheduleLeadProposalPdf = vi.fn();
const originalSmartCaptchaSecret = process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY;
const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;

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

vi.mock("@/lib/proposal/schedule-proposal-job", () => ({
  scheduleLeadProposalPdf: (...args: unknown[]) => scheduleLeadProposalPdf(...args),
}));

vi.mock("@/lib/smart-captcha-config", () => ({
  isSmartCaptchaConfigured: () => false,
  requireSmartCaptchaOnProduction: () => false,
  smartCaptchaUnavailableResponse: () => ({
    error: "Форма временно недоступна.",
    status: 503 as const,
  }),
}));

import { POST } from "@/app/api/leads/route";

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY = "";
    process.env.NEXTAUTH_SECRET = "test-nextauth-secret";
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
    scheduleLeadProposalPdf.mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY = originalSmartCaptchaSecret;
    process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
  });

  it("schedules proposal generation without blocking the response", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Иван",
        phone: "+7 999 000 00 00",
        source: "calculator",
        utm_content: "ignored-snake-case",
        utmContent: "ad-variant-a",
        yclid: "1234567890",
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
    expect(scheduleLeadProposalPdf).toHaveBeenCalledOnce();
    expect(scheduleLeadProposalPdf).toHaveBeenCalledWith("lead-1");
    expect(txLeadCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: "calculator",
        utmContent: "ad-variant-a",
        yclid: "1234567890",
      }),
    });
  });
});


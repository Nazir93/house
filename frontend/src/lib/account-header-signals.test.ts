import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  };
});

const paymentCount = vi.fn();
const ticketCount = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    clientPayment: { count: (...args: unknown[]) => paymentCount(...args) },
    clientSupportTicket: { count: (...args: unknown[]) => ticketCount(...args) },
  },
}));

import { getAccountHeaderSignals } from "@/lib/account-header-signals";

describe("getAccountHeaderSignals", () => {
  beforeEach(() => {
    paymentCount.mockResolvedValue(2);
    ticketCount.mockResolvedValue(3);
  });

  it("агрегирует платежи и обращения", async () => {
    const r = await getAccountHeaderSignals("project-id");
    expect(r.paymentsDue).toBe(2);
    expect(r.ticketsActive).toBe(3);
    expect(r.attentionCount).toBe(5);
    expect(paymentCount).toHaveBeenCalledOnce();
    expect(ticketCount).toHaveBeenCalledOnce();
  });
});

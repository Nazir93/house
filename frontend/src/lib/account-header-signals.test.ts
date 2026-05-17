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
const notificationCount = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    clientPayment: { count: (...args: unknown[]) => paymentCount(...args) },
    clientSupportTicket: { count: (...args: unknown[]) => ticketCount(...args) },
    clientNotification: { count: (...args: unknown[]) => notificationCount(...args) },
  },
}));

import { getAccountHeaderSignals } from "@/lib/account-header-signals";

describe("getAccountHeaderSignals", () => {
  beforeEach(() => {
    paymentCount.mockResolvedValue(2);
    ticketCount.mockResolvedValue(3);
    notificationCount.mockResolvedValue(1);
  });

  it("агрегирует уведомления, платежи и обращения", async () => {
    const r = await getAccountHeaderSignals("project-id");
    expect(r.notificationsUnread).toBe(1);
    expect(r.paymentsDue).toBe(2);
    expect(r.ticketsActive).toBe(3);
    expect(r.attentionCount).toBe(6);
    expect(paymentCount).toHaveBeenCalledOnce();
    expect(ticketCount).toHaveBeenCalledOnce();
    expect(notificationCount).toHaveBeenCalledOnce();
  });
});

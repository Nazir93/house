import { describe, expect, it } from "vitest";

import {
  countTicketsNeedingStaffReply,
  lastTicketMessage,
  previewTicketBody,
  ticketNeedsStaffReply,
} from "@/lib/admin-ticket-inbox";

describe("admin-ticket-inbox", () => {
  const base = {
    id: "t1",
    subject: "Вопрос",
    status: "OPEN" as const,
    staffLastReadAt: null,
    updatedAt: "2026-06-08T12:00:00Z",
  };

  it("lastTicketMessage picks latest by date", () => {
    const last = lastTicketMessage([
      { id: "1", authorType: "CLIENT", body: "a", createdAt: "2026-06-08T10:00:00Z" },
      { id: "2", authorType: "STAFF", body: "b", createdAt: "2026-06-08T11:00:00Z" },
    ]);
    expect(last?.id).toBe("2");
  });

  it("ticketNeedsStaffReply when last message is from client", () => {
    expect(
      ticketNeedsStaffReply({
        ...base,
        messages: [{ id: "1", authorType: "CLIENT", body: "hi", createdAt: "2026-06-08T12:00:00Z" }],
      })
    ).toBe(true);
  });

  it("ticketNeedsStaffReply is false after staff reply", () => {
    expect(
      ticketNeedsStaffReply({
        ...base,
        messages: [{ id: "1", authorType: "STAFF", body: "ok", createdAt: "2026-06-08T12:00:00Z" }],
      })
    ).toBe(false);
  });

  it("ticketNeedsStaffReply is false when staff read after client message", () => {
    expect(
      ticketNeedsStaffReply({
        ...base,
        staffLastReadAt: "2026-06-08T13:00:00Z",
        messages: [{ id: "1", authorType: "CLIENT", body: "hi", createdAt: "2026-06-08T12:00:00Z" }],
      })
    ).toBe(false);
  });

  it("countTicketsNeedingStaffReply", () => {
    const n = countTicketsNeedingStaffReply([
      {
        ...base,
        messages: [{ id: "1", authorType: "CLIENT", body: "a", createdAt: "2026-06-08T12:00:00Z" }],
      },
      {
        ...base,
        id: "t2",
        status: "CLOSED",
        messages: [{ id: "2", authorType: "CLIENT", body: "b", createdAt: "2026-06-08T12:00:00Z" }],
      },
    ]);
    expect(n).toBe(1);
  });

  it("previewTicketBody truncates long text", () => {
    expect(previewTicketBody("коротко")).toBe("коротко");
    expect(previewTicketBody("а".repeat(200)).length).toBeLessThanOrEqual(120);
  });
});

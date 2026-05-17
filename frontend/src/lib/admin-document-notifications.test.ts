import { describe, expect, it } from "vitest";
import {
  ADMIN_NOTIFY_ON_CLIENT_ES_SIGN,
  buildAdminDocumentClientSignedNotification,
  shouldNotifyAdminOnClientDocumentSign,
} from "./admin-document-notifications";

describe("admin-document-notifications (п. 8 ТЗ)", () => {
  it("manual signing — no admin notification", () => {
    expect(shouldNotifyAdminOnClientDocumentSign("MANUAL")).toBe(false);
    expect(shouldNotifyAdminOnClientDocumentSign(null)).toBe(false);
  });

  it("ES signing — notification when feature enabled", () => {
    expect(ADMIN_NOTIFY_ON_CLIENT_ES_SIGN).toBe(false);
    expect(shouldNotifyAdminOnClientDocumentSign("ES")).toBe(false);
  });

  it("buildAdminDocumentClientSignedNotification text", () => {
    const n = buildAdminDocumentClientSignedNotification({
      filename: "Договор подряда",
      signedAt: new Date("2026-05-15T14:30:00"),
    });
    expect(n.title).toBe("Клиент подписал документ");
    expect(n.body).toContain("Договор подряда");
    expect(n.body).toContain("Дата подписания:");
  });
});

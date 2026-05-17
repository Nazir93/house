import { describe, expect, it } from "vitest";
import {
  clientNotificationReadLabel,
  clientNotificationTargetHref,
  clientNotificationTypeLabel,
  isClientNotificationUnread,
} from "./client-notification-routes";

describe("client-notification-routes (п. 10 ТЗ)", () => {
  it("clientNotificationTargetHref", () => {
    expect(clientNotificationTargetHref("PAYMENT_EXPECTED")).toBe("/account/payments");
    expect(clientNotificationTargetHref("DOCUMENT_NEW")).toBe("/account/documents");
    expect(clientNotificationTargetHref("STAGE_IN_PROGRESS")).toBe("/account/stages");
    expect(clientNotificationTargetHref("STAGE_DONE")).toBe("/account/stages");
    expect(clientNotificationTargetHref("PHOTO_NEW")).toBe("/account/photos");
  });

  it("clientNotificationReadLabel", () => {
    expect(clientNotificationReadLabel(null)).toBe("Не прочитано");
    expect(clientNotificationReadLabel("2026-05-01T00:00:00Z")).toBe("Прочитано");
  });

  it("isClientNotificationUnread", () => {
    expect(isClientNotificationUnread(null)).toBe(true);
    expect(isClientNotificationUnread(new Date())).toBe(false);
  });

  it("clientNotificationTypeLabel", () => {
    expect(clientNotificationTypeLabel("DOCUMENT_NEW")).toBe("Документ");
    expect(clientNotificationTypeLabel("PAYMENT_EXPECTED")).toBe("Платёж");
    expect(clientNotificationTypeLabel("PHOTO_NEW")).toBe("Фотоотчёт");
  });
});

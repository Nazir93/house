import { describe, expect, it } from "vitest";
import { DOCUMENT_NEW_NOTIFICATION_TITLE } from "@/lib/client-notification-messages";
import { clientNotificationTargetHref } from "@/lib/client-notification-routes";
import { collectMediaPublishNotifications } from "@/lib/client-project-draft-media";

/**
 * Публикация раздела «Документы» / «Фото» в админке (PUT draftSection=documents|photos).
 */
describe("collectMediaPublishNotifications (section publish)", () => {
  const filename = "Акт приёмки";
  const url = "/uploads/akt.pdf";

  it("новый документ → DOCUMENT_NEW для клиента", () => {
    const specs = collectMediaPublishNotifications([], [{ url, filename }], [], []);
    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({
      type: "DOCUMENT_NEW",
      title: DOCUMENT_NEW_NOTIFICATION_TITLE,
    });
    expect(specs[0]?.body).toContain(filename);
    expect(clientNotificationTargetHref("DOCUMENT_NEW")).toBe("/account/documents");
  });

  it("без новых URL — уведомление не создаётся", () => {
    const doc = { url, filename };
    expect(collectMediaPublishNotifications([doc], [doc], [], [])).toHaveLength(0);
  });

  it("несколько новых документов — отдельное уведомление на каждый", () => {
    const specs = collectMediaPublishNotifications(
      [],
      [
        { url: "/uploads/a.pdf", filename: "A" },
        { url: "/uploads/b.pdf", filename: "B" },
      ],
      [],
      []
    );
    expect(specs).toHaveLength(2);
    expect(specs.every((s) => s.type === "DOCUMENT_NEW")).toBe(true);
  });

  it("новое фото → PHOTO_NEW", () => {
    const specs = collectMediaPublishNotifications(
      [],
      [],
      [],
      [{ url: "/uploads/photo.jpg", caption: "Фундамент" }]
    );
    expect(specs).toHaveLength(1);
    expect(specs[0]?.type).toBe("PHOTO_NEW");
  });
});

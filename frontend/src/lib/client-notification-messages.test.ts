import { describe, expect, it } from "vitest";
import {
  DOCUMENT_NEW_NOTIFICATION_TITLE,
  PHOTO_NEW_NOTIFICATION_TITLE,
  buildDocumentNewNotification,
  buildPhotoNewNotification,
  documentNewNotificationBodyElectronic,
  documentNewNotificationBodyManual,
  photoNewNotificationBody,
} from "./client-notification-messages";

describe("document notifications", () => {
  it("manual signing texts", () => {
    expect(DOCUMENT_NEW_NOTIFICATION_TITLE).toContain("ознакомления и подписания");
    expect(documentNewNotificationBodyManual("Договор")).toBe(
      "Вам доступен документ: Договор. Пожалуйста, скачайте документ, ознакомьтесь с ним и подпишите его в офисе."
    );
    const n = buildDocumentNewNotification({ filename: "Акт" });
    expect(n.title).toBe(DOCUMENT_NEW_NOTIFICATION_TITLE);
    expect(n.body).toBe(documentNewNotificationBodyManual("Акт"));
    expect(n.payload.signingMode).toBe("manual");
  });

  it("electronic signing text (future)", () => {
    expect(documentNewNotificationBodyElectronic("Смета")).toContain("электронной подписью");
    const n = buildDocumentNewNotification({ filename: "Смета", electronicSign: true });
    expect(n.payload.signingMode).toBe("es");
    expect(n.body).toBe(documentNewNotificationBodyElectronic("Смета"));
  });
});

describe("photo notifications", () => {
  it("buildPhotoNewNotification — с подписью и без", () => {
    expect(PHOTO_NEW_NOTIFICATION_TITLE).toContain("фотоотчёт");
    expect(photoNewNotificationBody("Май 2026")).toContain("Май 2026");
    const withCaption = buildPhotoNewNotification({ caption: "Май 2026" });
    expect(withCaption.type).toBe("PHOTO_NEW");
    expect(withCaption.payload).toEqual({ kind: "photo", caption: "Май 2026" });

    const plain = buildPhotoNewNotification({});
    expect(plain.body).toBe(photoNewNotificationBody(null));
  });
});

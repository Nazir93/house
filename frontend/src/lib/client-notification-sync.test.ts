import { describe, expect, it } from "vitest";
import {
  collectNotificationsForPublish,
  detectNewDocumentNotifications,
  detectNewPhotoNotifications,
  detectPaymentExpectedNotifications,
  detectStageStatusNotifications,
  paymentMatchKey,
} from "./client-notification-sync";

describe("client-notification-sync", () => {
  it("paymentMatchKey нормализует пробелы и регистр", () => {
    expect(paymentMatchKey(0, "  Фундамент ")).toBe(paymentMatchKey(0, "фундамент"));
  });

  it("detectPaymentExpectedNotifications — только переход к EXPECTED", () => {
    const old = [{ order: 0, label: "Аванс", status: "NOT_ISSUED" as const }];
    const neu = [
      {
        order: 0,
        label: "Аванс",
        status: "EXPECTED" as const,
        amountKopeks: 1_000_000,
        dueDate: new Date("2026-06-01"),
      },
    ];
    const specs = detectPaymentExpectedNotifications(old, neu);
    expect(specs).toHaveLength(1);
    expect(specs[0]?.type).toBe("PAYMENT_EXPECTED");
    expect(specs[0]?.payload).toMatchObject({ label: "Аванс", status: "EXPECTED" });
  });

  it("detectPaymentExpectedNotifications — без дубля при повторном EXPECTED", () => {
    const row = { order: 0, label: "Аванс", status: "EXPECTED" as const };
    const neu = [{ ...row, amountKopeks: 100, dueDate: null }];
    expect(detectPaymentExpectedNotifications([row], neu)).toHaveLength(0);
  });

  it("detectStageStatusNotifications — этап в работе и сдан", () => {
    const old = [
      { id: "s1", title: "Кровля", status: "NOT_STARTED" as const },
      { id: "s2", title: "Окна", status: "IN_PROGRESS" as const },
    ];
    const incoming = [
      { clientKey: "s1", order: 0, title: "Кровля", iconKey: "roof", status: "IN_PROGRESS" },
      { clientKey: "s2", order: 1, title: "Окна", iconKey: "window", status: "DONE" },
    ];
    const specs = detectStageStatusNotifications(old, incoming);
    expect(specs.map((s) => s.type)).toEqual(["STAGE_IN_PROGRESS", "STAGE_DONE"]);
  });

  it("collectNotificationsForPublish — без платежей в черновике не шлёт по оплате", () => {
    const specs = collectNotificationsForPublish({
      oldPayments: [{ order: 0, label: "Аванс", status: "NOT_ISSUED" }],
      oldStages: [],
    });
    expect(specs).toHaveLength(0);
  });

  it("collectNotificationsForPublish — этап и платёж при публикации", () => {
    const specs = collectNotificationsForPublish({
      oldPayments: [{ order: 0, label: "Аванс", status: "NOT_ISSUED" }],
      newPayments: [
        {
          order: 0,
          label: "Аванс",
          status: "EXPECTED",
          amountKopeks: 100,
          dueDate: null,
        },
      ],
      oldStages: [{ id: "s1", title: "Кровля", status: "NOT_STARTED" }],
      draftStages: [{ clientKey: "s1", order: 0, title: "Кровля", iconKey: "roof", status: "IN_PROGRESS" }],
    });
    expect(specs.length).toBeGreaterThanOrEqual(2);
  });

  it("detectNewDocumentNotifications — только новые URL", () => {
    const old = [{ url: "/uploads/a.pdf", filename: "Договор" }];
    const neu = [
      { url: "/uploads/a.pdf", filename: "Договор" },
      { url: "/uploads/b.pdf", filename: "Акт" },
    ];
    const specs = detectNewDocumentNotifications(old, neu);
    expect(specs).toHaveLength(1);
    expect(specs[0]?.type).toBe("DOCUMENT_NEW");
    expect(specs[0]?.body).toContain("Вам доступен документ: Акт");
    expect(specs[0]?.body).toContain("в офисе");
  });

  it("collectNotificationsForPublish — новый документ", () => {
    const specs = collectNotificationsForPublish({
      oldPayments: [],
      oldStages: [],
      oldDocuments: [],
      newDocuments: [{ url: "/u/1.pdf", filename: "Смета" }],
    });
    expect(specs).toHaveLength(1);
    expect(specs[0]?.type).toBe("DOCUMENT_NEW");
  });

  it("detectNewPhotoNotifications — только новые URL", () => {
    const old = [{ url: "/uploads/a.jpg", caption: "Апрель" }];
    const neu = [
      { url: "/uploads/a.jpg", caption: "Апрель" },
      { url: "/uploads/b.jpg", caption: "Май" },
    ];
    const specs = detectNewPhotoNotifications(old, neu);
    expect(specs).toHaveLength(1);
    expect(specs[0]?.type).toBe("PHOTO_NEW");
    expect(specs[0]?.body).toContain("Май");
  });

  it("collectNotificationsForPublish — новый фотоотчёт", () => {
    const specs = collectNotificationsForPublish({
      oldPayments: [],
      oldStages: [],
      oldPhotos: [],
      newPhotos: [{ url: "/p/1.jpg", caption: null }],
    });
    expect(specs).toHaveLength(1);
    expect(specs[0]?.type).toBe("PHOTO_NEW");
  });

  it("detectStageStatusNotifications — новый подэтап в работе", () => {
    const specs = detectStageStatusNotifications([], [
      {
        clientKey: "new-1",
        parentClientKey: "parent",
        order: 0,
        title: "Разводка",
        iconKey: "circle",
        status: "IN_PROGRESS",
      },
    ]);
    expect(specs).toHaveLength(1);
    expect(specs[0]?.body).toContain("Разводка");
  });
});

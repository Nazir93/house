/**
 * Сводная проверка личного кабинета (всё из чата) — чистая логика, без UI/БД.
 */
import { describe, expect, it } from "vitest";
import { CLIENT_CABINET_NOTIFICATIONS_HREF } from "@/lib/client-cabinet-bell";
import { shouldNotifyAdminOnClientDocumentSign } from "@/lib/admin-document-notifications";
import {
  DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS,
  resolveAdminDocumentPatch,
  resolveSignedByNameForManualSign,
} from "@/lib/client-document-admin-patch";
import { clientDocumentDownloadUpdate } from "@/lib/client-document-download";
import {
  formatDocumentClientStatusLine,
  signatureStatusAfterClientDownload,
} from "@/lib/client-document-signature";
import { formatDocumentSignedAtRu, parseAdminSignedDateInput } from "@/lib/client-document-signed-date";
import {
  buildDocumentNewNotification,
  buildPaymentExpectedNotification,
  buildStageStatusNotification,
} from "@/lib/client-notification-messages";
import {
  clientNotificationReadLabel,
  clientNotificationTargetHref,
} from "@/lib/client-notification-routes";
import {
  collectNotificationsForPublish,
  detectNewDocumentNotifications,
  detectNewPhotoNotifications,
} from "@/lib/client-notification-sync";
import {
  buildUpcomingPaymentSummary,
  pickDashboardPaymentPreview,
} from "@/lib/client-payments-dashboard";
import { hasUnpublishedDraft } from "@/lib/client-project-draft";
import { getCurrentStagesInProgress } from "@/lib/client-project-stage-status";
import { paymentStatusLabel } from "@/lib/client-portal-labels";
import { moveItemInArray } from "@/lib/reorder-list";

describe("личный кабинет — сводка по ТЗ (чат)", () => {
  describe("п.6–7 карточка объекта и этапы", () => {
    it("getCurrentStagesInProgress — этап «В работе»", () => {
      const stages = getCurrentStagesInProgress([
        { id: "1", parentId: null, status: "IN_PROGRESS", title: "Кровля", iconKey: "roof", order: 0 },
        { id: "2", parentId: null, status: "DONE", title: "Фундамент", iconKey: "f", order: 1 },
      ]);
      expect(stages.map((s) => s.title)).toContain("Кровля");
    });
  });

  describe("п.8 платежи", () => {
    it("статусы платежей на русском", () => {
      expect(paymentStatusLabel("EXPECTED")).toBe("Ожидает оплаты");
      expect(paymentStatusLabel("PAID")).toBe("Оплачен");
    });

    it("главная: ближайший платёж + 2 строки", () => {
      const rows = [
        { id: "1", label: "Аванс", amountKopeks: 100, dueDate: new Date("2026-06-01"), status: "PAID" as const, paidAt: null, order: 0 },
        { id: "2", label: "Фундамент", amountKopeks: 200, dueDate: new Date("2026-04-10"), status: "EXPECTED" as const, paidAt: null, order: 1 },
        { id: "3", label: "Стены", amountKopeks: 300, dueDate: null, status: "NOT_ISSUED" as const, paidAt: null, order: 2 },
      ];
      const upcoming = buildUpcomingPaymentSummary(rows);
      expect(upcoming?.payments.map((p) => p.label)).toEqual(["Фундамент"]);
      expect(upcoming?.payments.some((p) => p.status === "NOT_ISSUED")).toBe(false);
      expect(pickDashboardPaymentPreview(rows, 2)).toHaveLength(2);
    });
  });

  describe("п.7–9 уведомления клиента", () => {
    it("звоночек → /account/notifications", () => {
      expect(CLIENT_CABINET_NOTIFICATIONS_HREF).toBe("/account/notifications");
    });

    it("маршруты из уведомлений", () => {
      expect(clientNotificationTargetHref("PAYMENT_EXPECTED")).toBe("/account/payments");
      expect(clientNotificationTargetHref("STAGE_IN_PROGRESS")).toBe("/account/stages");
      expect(clientNotificationTargetHref("DOCUMENT_NEW")).toBe("/account/documents");
      expect(clientNotificationTargetHref("PHOTO_NEW")).toBe("/account/photos");
    });

    it("прочитано / не прочитано", () => {
      expect(clientNotificationReadLabel(null)).toBe("Не прочитано");
      expect(clientNotificationReadLabel("2026-01-01")).toBe("Прочитано");
    });

    it("уведомления при публикации", () => {
      const pay = buildPaymentExpectedNotification({
        label: "Этап 1",
        amountKopeks: 100_00,
        dueDate: new Date("2026-05-01"),
      });
      const stage = buildStageStatusNotification({ title: "Кровля", status: "IN_PROGRESS" });
      const doc = buildDocumentNewNotification({ filename: "Договор.pdf" });
      const specs = collectNotificationsForPublish({
        oldPayments: [],
        newPayments: [{ order: 0, label: "Этап 1", status: "EXPECTED", amountKopeks: 100_00, dueDate: new Date("2026-05-01") }],
        oldStages: [],
        draftStages: [{ clientKey: "s1", order: 0, title: "Кровля", iconKey: "r", status: "IN_PROGRESS" }],
        oldDocuments: [],
        newDocuments: [{ url: "/a.pdf", filename: "Договор.pdf" }],
      });
      expect(specs.some((s) => s.type === pay.type)).toBe(true);
      expect(specs.some((s) => s.type === stage.type)).toBe(true);
      expect(specs.some((s) => s.type === doc.type)).toBe(true);
    });
  });

  describe("п.9 фото и порядок", () => {
    it("reorder-list", () => {
      const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
      expect(moveItemInArray(items, 0, 2).map((x) => x.id)).toEqual(["b", "c", "a"]);
    });

    it("новый фотоотчёт → уведомление PHOTO_NEW", () => {
      expect(detectNewPhotoNotifications([], [{ url: "/p/1.jpg", caption: "Июнь" }])).toHaveLength(1);
    });
  });

  describe("черновик / публикация", () => {
    it("hasUnpublishedDraft", () => {
      expect(hasUnpublishedDraft({ draftData: {}, draftSavedAt: new Date() })).toBe(true);
      expect(hasUnpublishedDraft({ draftData: null, draftSavedAt: null })).toBe(false);
    });
  });

  describe("документы: статусы, подписание, дата", () => {
    it("загрузка → ожидает ознакомления", () => {
      expect(DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS).toBe("AWAITING_REVIEW");
    });

    it("скачивание → ожидает подписания", () => {
      expect(signatureStatusAfterClientDownload("AWAITING_REVIEW")).toBe("AWAITING_SIGNATURE");
      const u = clientDocumentDownloadUpdate({
        id: "d1",
        signatureStatus: "AWAITING_REVIEW",
        downloadedAt: null,
      });
      expect(u?.signatureStatus).toBe("AWAITING_SIGNATURE");
    });

    it("подписан только админом + дата вручную", () => {
      const plan = resolveAdminDocumentPatch(
        { signatureStatus: "AWAITING_SIGNATURE" },
        { signatureStatus: "SIGNED", signedAt: "2026-05-16", signedByName: "Иванов" },
        { defaultClientName: "Клиент" }
      );
      expect(plan).toMatchObject({
        action: "mark_signed",
        data: { signatureStatus: "SIGNED", signedByName: "Иванов" },
      });
      expect(resolveSignedByNameForManualSign("", "Клиент")).toBe("Клиент");
    });

    it("отображение «Подписан 16.05.2026»", () => {
      const d = parseAdminSignedDateInput("2026-05-16");
      expect(formatDocumentClientStatusLine("SIGNED", d)).toMatch(/^Подписан /);
      expect(formatDocumentSignedAtRu(d)).toMatch(/16[./]05[./]2026/);
    });

    it("новый документ → уведомление", () => {
      expect(detectNewDocumentNotifications([], [{ url: "/x", filename: "Акт" }])).toHaveLength(1);
    });

    it("ручное подписание — без уведомления админу", () => {
      expect(shouldNotifyAdminOnClientDocumentSign("MANUAL")).toBe(false);
    });
  });
});

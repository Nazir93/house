import { describe, expect, it } from "vitest";
import { shouldNotifyAdminOnClientDocumentSign } from "@/lib/admin-document-notifications";
import { resolveAdminDocumentPatch } from "@/lib/client-document-admin-patch";
import { clientDocumentDownloadUpdate } from "@/lib/client-document-download";
import {
  buildDocumentNewNotification,
  DOCUMENT_NEW_NOTIFICATION_TITLE,
} from "@/lib/client-notification-messages";
import {
  documentNotificationMatchesDeletedDoc,
  documentRowMatchesDeleteAnchor,
  filterActiveClientNotifications,
} from "@/lib/client-document-delete";
import {
  collectNotificationsForPublish,
  detectNewDocumentNotifications,
} from "@/lib/client-notification-sync";
import {
  documentSignatureLabel,
  formatDocumentClientStatusLine,
  isDocumentSigned,
  signatureStatusAfterClientDownload,
} from "@/lib/client-document-signature";
import {
  formatDocumentSignedAtRu,
  parseAdminSignedDateInput,
} from "@/lib/client-document-signed-date";

/**
 * Сквозной сценарий без ЭП (п. 1–8 ТЗ) — только чистая логика, без БД.
 */
describe("client-document-workflow (TZ manual signing)", () => {
  const filename = "Договор подряда";
  const url = "/uploads/contract.pdf";

  it("п.1–2: загрузка → «Ожидает ознакомления»", () => {
    const status = "AWAITING_REVIEW" as const;
    expect(documentSignatureLabel(status)).toBe("Ожидает ознакомления");
    expect(isDocumentSigned(status)).toBe(false);
  });

  it("п.3–4: публикация → уведомление клиенту", () => {
    const specs = collectNotificationsForPublish({
      oldPayments: [],
      oldStages: [],
      oldDocuments: [],
      newDocuments: [{ url, filename }],
    });
    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({
      type: "DOCUMENT_NEW",
      title: DOCUMENT_NEW_NOTIFICATION_TITLE,
    });
    expect(detectNewDocumentNotifications([], [{ url, filename }])[0]?.body).toContain(filename);
    expect(buildDocumentNewNotification({ filename }).payload.signingMode).toBe("manual");
  });

  it("п.3–4: сохранение раздела «Документы» → уведомление клиенту", async () => {
    const { collectMediaPublishNotifications } = await import("@/lib/client-project-draft-media");
    const specs = collectMediaPublishNotifications([], [{ url, filename }], [], []);
    expect(specs[0]?.type).toBe("DOCUMENT_NEW");
    expect(specs[0]?.title).toBe(DOCUMENT_NEW_NOTIFICATION_TITLE);
  });

  it("п.5: скачивание → «Ожидает подписания»", () => {
    expect(signatureStatusAfterClientDownload("AWAITING_REVIEW")).toBe("AWAITING_SIGNATURE");
    const update = clientDocumentDownloadUpdate({
      id: "doc-1",
      signatureStatus: "AWAITING_REVIEW",
      downloadedAt: null,
    });
    expect(update?.signatureStatus).toBe("AWAITING_SIGNATURE");
    expect(update?.downloadedAt).toBeInstanceOf(Date);
    expect(clientDocumentDownloadUpdate({
      id: "doc-1",
      signatureStatus: "AWAITING_SIGNATURE",
      downloadedAt: new Date(),
    })).toBeNull();
  });

  it("п.6–7: подписание в офисе — только админ, статус «Подписан»", () => {
    const plan = resolveAdminDocumentPatch(
      { signatureStatus: "AWAITING_SIGNATURE" },
      { signatureStatus: "SIGNED", signedAt: "2026-05-16", signedByName: "Клиент" }
    );
    expect(plan).toMatchObject({
      action: "mark_signed",
      data: { signatureStatus: "SIGNED", signedByName: "Клиент" },
    });
    expect(isDocumentSigned("SIGNED")).toBe(true);
    expect(documentSignatureLabel("SIGNED")).toBe("Подписан");
  });

  it("п.7: «Подписан» не выставляется автоматически при скачивании", () => {
    const update = clientDocumentDownloadUpdate({
      id: "doc-1",
      signatureStatus: "AWAITING_REVIEW",
      downloadedAt: null,
    });
    expect(update?.signatureStatus).not.toBe("SIGNED");
  });

  it("п.8: при ручном подписании админу уведомление не уходит", () => {
    expect(shouldNotifyAdminOnClientDocumentSign("MANUAL")).toBe(false);
  });

  it("п.8: дата подписания — вручную админом, отображение в ЛК", () => {
    const signedAt = parseAdminSignedDateInput("2026-05-16");
    expect(signedAt).not.toBeNull();
    expect(formatDocumentSignedAtRu(signedAt)).toMatch(/16[./]05[./]2026/);
    expect(formatDocumentClientStatusLine("SIGNED", signedAt)).toMatch(/^Подписан /);
  });

  it("п.10: удаление — черновик и ЛК, уведомление снимается", () => {
    const anchor = { url, filename, order: 0 };
    expect(
      documentRowMatchesDeleteAnchor({ url, filename, order: 0 }, anchor)
    ).toBe(true);
    expect(
      documentNotificationMatchesDeletedDoc(
        { kind: "document", filename, url, signingMode: "manual" },
        anchor
      )
    ).toBe(true);
    expect(
      filterActiveClientNotifications(
        [
          {
            id: "n1",
            type: "DOCUMENT_NEW",
            payload: { kind: "document", filename, signingMode: "manual" },
          },
        ],
        []
      )
    ).toHaveLength(0);
  });

  it("повторная публикация без нового URL — без уведомления", () => {
    const doc = { url, filename };
    expect(
      collectNotificationsForPublish({
        oldPayments: [],
        oldStages: [],
        oldDocuments: [doc],
        newDocuments: [doc],
      })
    ).toHaveLength(0);
  });
});

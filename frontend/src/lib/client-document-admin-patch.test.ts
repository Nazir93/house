import { describe, expect, it } from "vitest";
import {
  DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS,
  MANUAL_SIGNATURE_METHOD,
  resolveAdminDocumentPatch,
  resolveSignedByNameForManualSign,
} from "./client-document-admin-patch";

describe("client-document-admin-patch", () => {
  it("DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS — п.2 ТЗ", () => {
    expect(DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS).toBe("AWAITING_REVIEW");
  });

  it("resolveSignedByNameForManualSign", () => {
    expect(resolveSignedByNameForManualSign("Иванов И.И.", "Петров")).toBe("Иванов И.И.");
    expect(resolveSignedByNameForManualSign("", "Петров")).toBe("Петров");
    expect(resolveSignedByNameForManualSign(undefined, null)).toBe("Клиент");
  });

  it("mark_signed — дата, статус, кто подписал, способ MANUAL", () => {
    const plan = resolveAdminDocumentPatch(
      { signatureStatus: "AWAITING_SIGNATURE" },
      { signatureStatus: "SIGNED", signedAt: "2026-05-20", signedByName: "Сидоров" },
      { defaultClientName: "Клиентов" }
    );
    expect(plan).toEqual({
      action: "mark_signed",
      data: {
        signedAt: expect.any(Date),
        signatureStatus: "SIGNED",
        signatureMethod: MANUAL_SIGNATURE_METHOD,
        signedByName: "Сидоров",
      },
    });
  });

  it("reject mark without signedAt", () => {
    expect(
      resolveAdminDocumentPatch(
        { signatureStatus: "AWAITING_SIGNATURE" },
        { signatureStatus: "SIGNED" }
      )
    ).toEqual({ error: "signedAt required (YYYY-MM-DD)", status: 400 });
  });

  it("reject auto status change without SIGNED", () => {
    expect(
      resolveAdminDocumentPatch(
        { signatureStatus: "AWAITING_SIGNATURE" },
        { signedAt: "2026-05-20" }
      )
    ).toEqual({ error: "Only manual SIGNED status is allowed", status: 400 });
  });

  it("update_signed_at when already SIGNED", () => {
    const plan = resolveAdminDocumentPatch(
      { signatureStatus: "SIGNED" },
      { signedAt: "2026-06-01", signedByName: "Новое имя" }
    );
    expect(plan).toEqual({
      action: "update_signed_at",
      signedAt: expect.any(Date),
      signedByName: "Новое имя",
    });
  });

  it("reject downgrade from SIGNED", () => {
    expect(
      resolveAdminDocumentPatch(
        { signatureStatus: "SIGNED" },
        { signatureStatus: "AWAITING_REVIEW", signedAt: "2026-06-01" }
      )
    ).toEqual({ error: "Cannot change status after signed", status: 400 });
  });
});

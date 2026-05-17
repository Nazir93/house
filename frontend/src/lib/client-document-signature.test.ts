import { describe, expect, it } from "vitest";
import {
  documentSignatureLabel,
  documentSigningHint,
  formatDocumentClientStatusLine,
  isDocumentSigned,
  signatureStatusAfterClientDownload,
} from "./client-document-signature";

describe("client-document-signature", () => {
  it("documentSignatureLabel", () => {
    expect(documentSignatureLabel("AWAITING_REVIEW")).toBe("Ожидает ознакомления");
    expect(documentSignatureLabel("AWAITING_SIGNATURE")).toBe("Ожидает подписания");
    expect(documentSignatureLabel("SIGNED")).toBe("Подписан");
  });

  it("isDocumentSigned", () => {
    expect(isDocumentSigned("AWAITING_REVIEW")).toBe(false);
    expect(isDocumentSigned("AWAITING_SIGNATURE")).toBe(false);
    expect(isDocumentSigned("SIGNED")).toBe(true);
  });

  it("signatureStatusAfterClientDownload", () => {
    expect(signatureStatusAfterClientDownload("AWAITING_REVIEW")).toBe("AWAITING_SIGNATURE");
    expect(signatureStatusAfterClientDownload("AWAITING_SIGNATURE")).toBeNull();
    expect(signatureStatusAfterClientDownload("SIGNED")).toBeNull();
  });

  it("formatDocumentClientStatusLine — макет ЛК", () => {
    expect(formatDocumentClientStatusLine("AWAITING_SIGNATURE", null)).toBe("Ожидает подписания");
    expect(formatDocumentClientStatusLine("SIGNED", new Date("2026-05-15T12:00:00"))).toMatch(
      /^Подписан \d{2}\.\d{2}\.\d{4}$/
    );
  });

  it("documentSigningHint", () => {
    expect(documentSigningHint("AWAITING_REVIEW")).toContain("Скачайте");
    expect(documentSigningHint("AWAITING_SIGNATURE")).toContain("офисе");
    expect(documentSigningHint("SIGNED")).toContain("подписан");
  });
});

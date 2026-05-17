import { describe, expect, it } from "vitest";
import { clientDocumentDownloadUpdate } from "./client-document-download";

describe("clientDocumentDownloadUpdate", () => {
  const now = new Date("2026-05-16T12:00:00Z");

  it("advances AWAITING_REVIEW to AWAITING_SIGNATURE", () => {
    expect(
      clientDocumentDownloadUpdate(
        { id: "1", signatureStatus: "AWAITING_REVIEW", downloadedAt: null },
        now
      )
    ).toEqual({
      signatureStatus: "AWAITING_SIGNATURE",
      downloadedAt: now,
    });
  });

  it("does not change AWAITING_SIGNATURE or SIGNED", () => {
    expect(
      clientDocumentDownloadUpdate(
        { id: "1", signatureStatus: "AWAITING_SIGNATURE", downloadedAt: now },
        now
      )
    ).toBeNull();
    expect(
      clientDocumentDownloadUpdate({ id: "1", signatureStatus: "SIGNED", downloadedAt: null }, now)
    ).toBeNull();
  });

  it("keeps existing downloadedAt on repeat download from review", () => {
    const first = new Date("2026-05-15T10:00:00Z");
    const update = clientDocumentDownloadUpdate(
      { id: "1", signatureStatus: "AWAITING_REVIEW", downloadedAt: first },
      now
    );
    expect(update?.downloadedAt).toBe(first);
  });
});

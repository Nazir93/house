import { describe, expect, it } from "vitest";
import {
  contentDispositionAttachment,
  normalizeClientUploadPath,
  resolveClientUploadFile,
} from "./client-upload-file";

describe("client-upload-file", () => {
  it("normalizeClientUploadPath", () => {
    expect(normalizeClientUploadPath("/uploads/a.pdf")).toBe("/uploads/a.pdf");
    expect(normalizeClientUploadPath("uploads/a.pdf")).toBe("/uploads/a.pdf");
    expect(normalizeClientUploadPath("https://example.com/uploads/b.pdf")).toBe("/uploads/b.pdf");
    expect(normalizeClientUploadPath("https://other.com/file.pdf")).toBeNull();
    expect(normalizeClientUploadPath("")).toBeNull();
  });

  it("resolveClientUploadFile rejects path traversal", () => {
    expect(resolveClientUploadFile("/uploads/../secret")).toBeNull();
  });

  it("contentDispositionAttachment keeps cyrillic via filename*", () => {
    const h = contentDispositionAttachment("Договор.pdf");
    expect(h).toContain("filename*=");
    expect(h).toContain(encodeURIComponent("Договор.pdf"));
  });
});

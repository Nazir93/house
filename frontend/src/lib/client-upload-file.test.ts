import path from "path";
import { describe, expect, it } from "vitest";
import { normalizeClientUploadPath, resolveClientUploadFile } from "./client-upload-file";

describe("client-upload-file", () => {
  it("normalizes public and private upload paths", () => {
    expect(normalizeClientUploadPath("/uploads/a.pdf")).toBe("/uploads/a.pdf");
    expect(normalizeClientUploadPath("uploads/a.pdf")).toBe("/uploads/a.pdf");
    expect(normalizeClientUploadPath("/private-uploads/client-documents/a.pdf")).toBe(
      "/private-uploads/client-documents/a.pdf"
    );
  });

  it("resolves private client documents outside public uploads", () => {
    const resolved = resolveClientUploadFile("/private-uploads/client-documents/contract.pdf");
    expect(resolved?.filePath).toBe(
      path.join(process.cwd(), "storage", "private", "client-documents", "contract.pdf")
    );
  });

  it("rejects traversal and unsupported paths", () => {
    expect(resolveClientUploadFile("/private-uploads/client-documents/../secret.pdf")).toBeNull();
    expect(resolveClientUploadFile("/api/uploads/contract.pdf")).toBeNull();
  });
});
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

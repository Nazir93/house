import { describe, expect, it } from "vitest";
import { isAllowedClientDocumentUrl, validateUploadMagicBytes } from "./upload-file-validation";

describe("validateUploadMagicBytes", () => {
  it("accepts PDF magic bytes", () => {
    const buffer = Buffer.from("%PDF-1.4\n");
    expect(validateUploadMagicBytes(buffer, "pdf", "document")).toEqual({ ok: true });
  });

  it("rejects mismatched extension", () => {
    const buffer = Buffer.from("%PDF-1.4\n");
    expect(validateUploadMagicBytes(buffer, "png", "image").ok).toBe(false);
  });

  it("rejects SVG with script", () => {
    const buffer = Buffer.from('<svg><script>alert(1)</script></svg>', "utf-8");
    expect(validateUploadMagicBytes(buffer, "svg", "image").ok).toBe(false);
  });
});

describe("isAllowedClientDocumentUrl", () => {
  it("allows private client document paths only", () => {
    expect(isAllowedClientDocumentUrl("/private-uploads/client-documents/contract.pdf")).toBe(true);
    expect(isAllowedClientDocumentUrl("/uploads/contract.pdf")).toBe(false);
    expect(isAllowedClientDocumentUrl("https://evil.com/uploads/contract.pdf")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { safeAccountCallbackUrl } from "./safe-account-callback-url";

describe("safeAccountCallbackUrl", () => {
  it("returns dashboard by default", () => {
    expect(safeAccountCallbackUrl(undefined)).toBe("/account/dashboard");
    expect(safeAccountCallbackUrl(null)).toBe("/account/dashboard");
    expect(safeAccountCallbackUrl("")).toBe("/account/dashboard");
  });

  it("allows account paths", () => {
    expect(safeAccountCallbackUrl("/account")).toBe("/account");
    expect(safeAccountCallbackUrl("/account/documents")).toBe("/account/documents");
  });

  it("rejects external and non-account paths", () => {
    expect(safeAccountCallbackUrl("//evil.com")).toBe("/account/dashboard");
    expect(safeAccountCallbackUrl("https://evil.com")).toBe("/account/dashboard");
    expect(safeAccountCallbackUrl("/admin")).toBe("/account/dashboard");
    expect(safeAccountCallbackUrl("/")).toBe("/account/dashboard");
  });
});

import { describe, expect, it } from "vitest";
import { safeAdminCallbackUrl } from "./safe-admin-callback-url";

describe("safeAdminCallbackUrl", () => {
  it("returns admin root by default", () => {
    expect(safeAdminCallbackUrl(undefined)).toBe("/admin");
    expect(safeAdminCallbackUrl(null)).toBe("/admin");
    expect(safeAdminCallbackUrl("")).toBe("/admin");
  });

  it("allows admin paths", () => {
    expect(safeAdminCallbackUrl("/admin")).toBe("/admin");
    expect(safeAdminCallbackUrl("/admin/leads")).toBe("/admin/leads");
  });

  it("rejects external and non-admin paths", () => {
    expect(safeAdminCallbackUrl("//evil.com")).toBe("/admin");
    expect(safeAdminCallbackUrl("https://evil.com")).toBe("/admin");
    expect(safeAdminCallbackUrl("/account/dashboard")).toBe("/admin");
    expect(safeAdminCallbackUrl("/")).toBe("/admin");
  });
});

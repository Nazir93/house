import { describe, expect, it } from "vitest";

import {
  ADMIN_EDITABLE_SERVICE_TYPE_OPTIONS,
  CODE_OWNED_SERVICE_TYPE,
  isCodeOwnedAdminService,
} from "@/lib/admin-managed-services";

describe("isCodeOwnedAdminService", () => {
  it("ловит slug и тип проектирования", () => {
    expect(isCodeOwnedAdminService({ slug: "proektirovanie" })).toBe(true);
    expect(isCodeOwnedAdminService({ slug: "/services/proektirovanie" })).toBe(true);
    expect(isCodeOwnedAdminService({ serviceType: "HOUSE_DESIGN" })).toBe(true);
  });

  it("не блокирует остальные услуги", () => {
    expect(isCodeOwnedAdminService({ slug: "fundament", serviceType: "HOUSE_FOUNDATION" })).toBe(false);
  });
});

describe("ADMIN_EDITABLE_SERVICE_TYPE_OPTIONS", () => {
  it("не содержит HOUSE_DESIGN", () => {
    expect(ADMIN_EDITABLE_SERVICE_TYPE_OPTIONS.some((o) => o.value === CODE_OWNED_SERVICE_TYPE)).toBe(
      false,
    );
    expect(ADMIN_EDITABLE_SERVICE_TYPE_OPTIONS.some((o) => o.value === "HOUSE_FOUNDATION")).toBe(true);
  });
});

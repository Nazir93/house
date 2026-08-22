import { describe, expect, it } from "vitest";

import {
  parseProjectsCatalogTypeParam,
  projectMatchesCatalogType,
  projectsCatalogTypeQueryValue,
} from "@/lib/project-catalog-type-filter";

describe("project-catalog-type-filter", () => {
  it("parseProjectsCatalogTypeParam", () => {
    expect(parseProjectsCatalogTypeParam(null)).toBe("all");
    expect(parseProjectsCatalogTypeParam("author")).toBe("author");
    expect(parseProjectsCatalogTypeParam("partner")).toBe("partner");
    expect(parseProjectsCatalogTypeParam("typical")).toBe("partner");
  });

  it("projectsCatalogTypeQueryValue", () => {
    expect(projectsCatalogTypeQueryValue("all")).toBeNull();
    expect(projectsCatalogTypeQueryValue("author")).toBe("author");
    expect(projectsCatalogTypeQueryValue("partner")).toBe("partner");
  });

  it("projectMatchesCatalogType", () => {
    const author = { catalogKind: "author" as const, published: true };
    const partner = { catalogKind: "partner" as const, published: true };
    expect(projectMatchesCatalogType(author as never, "all")).toBe(true);
    expect(projectMatchesCatalogType(author as never, "author")).toBe(true);
    expect(projectMatchesCatalogType(author as never, "partner")).toBe(false);
    expect(projectMatchesCatalogType(partner as never, "partner")).toBe(true);
  });
});

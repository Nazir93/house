import { describe, expect, it } from "vitest";

import {
  normalizePageSkeletonPath,
  resolvePageSkeletonVariant,
} from "@/lib/page-skeleton-config";

describe("page-skeleton-config", () => {
  it("normalizes empty and root paths", () => {
    expect(normalizePageSkeletonPath("")).toBe("/");
    expect(normalizePageSkeletonPath("/")).toBe("/");
    expect(normalizePageSkeletonPath("projects")).toBe("/projects");
    expect(normalizePageSkeletonPath("/projects/")).toBe("/projects");
  });

  it("resolves home skeleton for root", () => {
    expect(resolvePageSkeletonVariant("/")).toBe("home");
  });

  it("resolves catalog skeleton for list pages", () => {
    expect(resolvePageSkeletonVariant("/projects")).toBe("catalog");
    expect(resolvePageSkeletonVariant("/portfolio")).toBe("catalog");
    expect(resolvePageSkeletonVariant("/blog")).toBe("catalog");
    expect(resolvePageSkeletonVariant("/services")).toBe("catalog");
  });

  it("resolves detail skeleton for slug pages", () => {
    expect(resolvePageSkeletonVariant("/projects/dom-120")).toBe("detail");
    expect(resolvePageSkeletonVariant("/portfolio/object-1")).toBe("detail");
    expect(resolvePageSkeletonVariant("/blog/novost")).toBe("detail");
    expect(resolvePageSkeletonVariant("/services/proektirovanie")).toBe("detail");
  });

  it("resolves content skeleton for other public pages", () => {
    expect(resolvePageSkeletonVariant("/about")).toBe("content");
    expect(resolvePageSkeletonVariant("/contacts")).toBe("content");
    expect(resolvePageSkeletonVariant("/calculator")).toBe("content");
    expect(resolvePageSkeletonVariant("/mortgage")).toBe("content");
  });

  it("does not treat nested admin paths as catalog", () => {
    expect(resolvePageSkeletonVariant("/admin/projects")).toBe("content");
  });
});

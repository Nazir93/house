import { describe, expect, it } from "vitest";

import {
  isSsrProgressiveItemVisible,
  listServiceHubCrawlableHrefs,
  resolveSsrInitialVisibleCount,
  serviceHubItemHref,
  ssrProgressiveDisclosureKeepsAllLinks,
} from "@/lib/seo/ssr-seo-html";

describe("ssr-seo-html (ТЗ SEO §20)", () => {
  it("progressive disclosure: первые N видимы, остальные остаются в DOM (не unmount)", () => {
    expect(resolveSsrInitialVisibleCount(12, 4)).toBe(4);
    expect(isSsrProgressiveItemVisible(0, 4)).toBe(true);
    expect(isSsrProgressiveItemVisible(3, 4)).toBe(true);
    expect(isSsrProgressiveItemVisible(4, 4)).toBe(false);
    expect(ssrProgressiveDisclosureKeepsAllLinks()).toBe(true);
  });

  it("хаб услуг даёт crawlable /services/... для каждой услуги", () => {
    expect(serviceHubItemHref("proektirovanie")).toBe("/services/proektirovanie");
    expect(serviceHubItemHref("/services/fundament")).toBe("/services/fundament");
    expect(
      listServiceHubCrawlableHrefs([
        { slug: "proektirovanie" },
        { slug: "/services/krovlya" },
      ]),
    ).toEqual(["/services/proektirovanie", "/services/krovlya"]);
  });
});

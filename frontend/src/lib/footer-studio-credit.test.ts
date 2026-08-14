import { describe, expect, it } from "vitest";

import { footerStudioCreditSnippetAttrs } from "@/lib/footer-studio-credit";

describe("footerStudioCreditSnippetAttrs", () => {
  it("исключает кредит студии из сниппетов поиска", () => {
    const attrs = footerStudioCreditSnippetAttrs();
    expect(attrs["data-nosnippet"]).toBe("");
    expect(attrs.wrapWithYandexNoindex).toBe(true);
    expect(attrs.linkRel).toContain("nofollow");
  });
});

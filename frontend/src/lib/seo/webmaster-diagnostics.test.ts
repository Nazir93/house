import { describe, expect, it } from "vitest";

import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";
import { getAuthorProjectsCatalogSeo } from "@/lib/seo/project-catalog-hub-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import { getServiceSeoBySlug } from "@/lib/seo/service-seo-defaults";
import {
  descriptionSatisfiesWebmaster,
  viewportLooksMobileFriendly,
  WEBMASTER_DIAGNOSTICS,
} from "@/lib/seo/webmaster-diagnostics";

describe("webmaster-diagnostics", () => {
  it("целевые SEO-описания достаточны для рекомендации Description", () => {
    const samples = [
      getCommercialPageSeo("home").description,
      getAuthorProjectsCatalogSeo().description,
      ...getProjectMaterialSeoPages().map((p) => p.description),
      getServiceSeoBySlug("proektirovanie")!.description,
    ];
    for (const d of samples) {
      expect(descriptionSatisfiesWebmaster(d), d.slice(0, 60)).toBe(true);
    }
    expect(descriptionSatisfiesWebmaster("коротко")).toBe(false);
  });

  it("viewport policy: device-width, zoom разрешён", () => {
    expect(viewportLooksMobileFriendly("width=device-width, initial-scale=1")).toBe(true);
    expect(
      viewportLooksMobileFriendly("width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"),
    ).toBe(true);
    expect(viewportLooksMobileFriendly("width=device-width, user-scalable=no")).toBe(false);
    expect(viewportLooksMobileFriendly("width=1024")).toBe(false);
    expect(WEBMASTER_DIAGNOSTICS.missingDescription.id).toBe("missing_description");
  });
});

import { describe, expect, it } from "vitest";
import { enrichProektirovanieLandingDocument, PROEKTROVANIE_HERO_SUBTITLE, PROEKTROVANIE_HERO_TITLE, PROEKTROVANIE_TIMELINE_ITEMS } from "@/lib/service-proektirovanie-landing";
import type { ServiceLandingDocument } from "@/lib/service-landing-schema";

describe("enrichProektirovanieLandingDocument", () => {
  it("другие slug не меняет", () => {
    const doc: ServiceLandingDocument = {
      sections: [{ type: "hero", title: "T", subtitle: "S", serviceKey: "x", tag: "", features: [], goals: "" }],
    };
    expect(enrichProektirovanieLandingDocument("fundament", doc)).toBe(doc);
  });

  it("proektirovanie: hero → cinematic + timeline", () => {
    const doc: ServiceLandingDocument = {
      sections: [
        {
          type: "hero",
          title: "Заголовок",
          subtitle: "Подзаголовок",
          serviceKey: "proektirovanie",
          tag: "Тег",
          features: ["a"],
          goals: "g",
        },
        { type: "faq", serviceKey: "proektirovanie", items: [] },
      ],
    };
    const out = enrichProektirovanieLandingDocument("proektirovanie", doc);
    expect(out.sections[0]?.type).toBe("heroCinematic");
    if (out.sections[0]?.type === "heroCinematic") {
      expect(out.sections[0].title).toBe(PROEKTROVANIE_HERO_TITLE);
      expect(out.sections[0].subtitle).toBe(PROEKTROVANIE_HERO_SUBTITLE);
    }
    expect(out.sections[1]?.type).toBe("storyTimeline");
    if (out.sections[1]?.type === "storyTimeline") {
      expect(out.sections[1].items).toEqual(PROEKTROVANIE_TIMELINE_ITEMS);
    }
    expect(out.sections.some((s) => s.type === "faq")).toBe(false);
  });
});

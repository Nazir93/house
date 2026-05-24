import { describe, expect, it } from "vitest";
import { enrichProektirovanieLandingDocument } from "@/lib/service-proektirovanie-landing";
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
    expect(out.sections[1]?.type).toBe("storyTimeline");
    if (out.sections[1]?.type === "storyTimeline") {
      expect(out.sections[1].items.length).toBeGreaterThan(0);
    }
  });
});

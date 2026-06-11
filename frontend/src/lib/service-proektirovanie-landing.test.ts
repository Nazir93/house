import { describe, expect, it } from "vitest";
import {
  enrichProektirovanieLandingDocument,
  PROEKTROVANIE_HERO_BANNER,
  PROEKTROVANIE_HERO_FALLBACK_BANNER,
  PROEKTROVANIE_HERO_SUBTITLE,
  PROEKTROVANIE_HERO_TITLE,
  PROEKTROVANIE_TIMELINE_ITEMS,
} from "@/lib/service-proektirovanie-landing";
import type { ServiceLandingDocument } from "@/lib/service-landing-schema";

describe("enrichProektirovanieLandingDocument", () => {
  it("другие slug не меняет", () => {
    const doc: ServiceLandingDocument = {
      sections: [{ type: "hero", title: "T", subtitle: "S", serviceKey: "x", tag: "", features: [], goals: "" }],
    };
    expect(enrichProektirovanieLandingDocument("fundament", doc)).toBe(doc);
  });

  it("proektirovanie: hero → cinematic + calculator + timeline + viewer", () => {
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
          bannerImageDesktop: "/custom.png",
        },
        { type: "faq", serviceKey: "proektirovanie", items: [] },
      ],
    };
    const out = enrichProektirovanieLandingDocument("proektirovanie", doc);
    expect(out.sections[0]?.type).toBe("heroCinematic");
    if (out.sections[0]?.type === "heroCinematic") {
      expect(out.sections[0].title).toBe(PROEKTROVANIE_HERO_TITLE);
      expect(out.sections[0].subtitle).toBe(PROEKTROVANIE_HERO_SUBTITLE);
      expect(out.sections[0].bannerImageDesktop).toBe("/custom.png");
    }
    expect(out.sections[1]?.type).toBe("designCalculator");
    expect(out.sections[2]?.type).toBe("storyTimeline");
    if (out.sections[2]?.type === "storyTimeline") {
      expect(out.sections[2].items).toEqual(PROEKTROVANIE_TIMELINE_ITEMS);
    }
    expect(out.sections[3]?.type).toBe("projectTemplateViewer");
    expect(out.sections.some((s) => s.type === "faq")).toBe(false);
  });

  it("proektirovanie: подставляет fallback hero, если изображения нет", () => {
    const doc: ServiceLandingDocument = {
      sections: [{ type: "hero", title: "T", subtitle: "S", serviceKey: "proektirovanie", tag: "", features: [], goals: "" }],
    };
    const out = enrichProektirovanieLandingDocument("proektirovanie", doc);
    expect(out.sections[0]?.type).toBe("heroCinematic");
    if (out.sections[0]?.type === "heroCinematic") {
      expect(out.sections[0].bannerImageDesktop).toBe(PROEKTROVANIE_HERO_FALLBACK_BANNER);
      expect(out.sections[0].bannerImageMobile).toBe(PROEKTROVANIE_HERO_FALLBACK_BANNER);
    }
  });

  it("proektirovanie: mobile баннер совпадает с desktop (карточка v2 → cinematic hero)", () => {
    const doc: ServiceLandingDocument = {
      sections: [
        {
          type: "hero",
          title: "T",
          subtitle: "S",
          serviceKey: "proektirovanie",
          tag: "",
          features: [],
          goals: "",
          bannerImageDesktop: PROEKTROVANIE_HERO_BANNER,
          bannerImageMobile: PROEKTROVANIE_HERO_BANNER,
        },
      ],
    };
    const out = enrichProektirovanieLandingDocument("proektirovanie", doc);
    const hero = out.sections[0];
    expect(hero?.type).toBe("heroCinematic");
    if (hero?.type === "heroCinematic") {
      expect(hero.bannerImageDesktop).toBe(PROEKTROVANIE_HERO_FALLBACK_BANNER);
      expect(hero.bannerImageMobile).toBe(hero.bannerImageDesktop);
    }
  });
});

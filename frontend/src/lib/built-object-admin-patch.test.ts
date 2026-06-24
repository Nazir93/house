import { describe, expect, it } from "vitest";

import { builtObjectSectionUpdateData, parseBuiltObjectDraftSection } from "@/lib/built-object-admin-patch";

describe("built-object-admin-patch", () => {
  it("parseBuiltObjectDraftSection defaults to main", () => {
    expect(parseBuiltObjectDraftSection({ draftSection: "media" })).toBe("media");
    expect(parseBuiltObjectDraftSection({})).toBe("main");
  });

  it("builtObjectSectionUpdateData updates only main fields", () => {
    const data = builtObjectSectionUpdateData(
      {
        title: "Новый дом",
        slug: "novyi-dom",
        description: "<p>Текст</p>",
        renders: ["/uploads/a.webp"],
      },
      "main",
    );
    expect(data).toMatchObject({
      title: "Новый дом",
      slug: "novyi-dom",
      description: "<p>Текст</p>",
    });
    expect(data).not.toHaveProperty("media");
  });

  it("builtObjectSectionUpdateData updates phases block", () => {
    const data = builtObjectSectionUpdateData(
      {
        caseStudyPhasesJson: [{ id: "custom-1", title: "Мой этап", order: 0 }],
        phaseMedia: { "custom-1": ["/uploads/a.webp"] },
        renders: ["/uploads/render.webp"],
      },
      "phases",
    );
    expect(data.caseStudyPhasesJson).toEqual([{ id: "custom-1", title: "Мой этап", order: 0 }]);
    expect(data.media).toBeDefined();
  });

  it("builtObjectSectionUpdateData updates media block with client review", () => {
    const data = builtObjectSectionUpdateData(
      {
        renders: ["/uploads/a.webp"],
        clientReviewText: "Спасибо!",
        clientReviewVideoUrl: "/uploads/review.mp4",
        telegramUrl: "https://t.me/test",
      },
      "media",
    );
    expect(data.clientReviewText).toBe("Спасибо!");
    expect(data.clientReviewVideoUrl).toBe("/uploads/review.mp4");
    expect(data.telegramUrl).toBe("https://t.me/test");
    expect(data.media).toBeDefined();
  });
});

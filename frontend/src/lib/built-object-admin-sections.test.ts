import { describe, expect, it } from "vitest";

import {
  buildBuiltObjectSectionPayload,
  builtObjectSectionPayloadString,
  hasUnpublishedBuiltObjectSiteDraft,
  parseBuiltObjectAdminSection,
} from "@/lib/built-object-admin-sections";

const sampleForm = {
  title: "Дом в Вырице",
  slug: "vyritsa",
  material: "GAS_BLOCK",
  area: "247",
  rooms: "4",
  bathrooms: "2",
  buildTerm: "211",
  floors: "2",
  location: "д. Вырица",
  latitude: "59.407",
  longitude: "30.346",
  regionSlug: "lo",
  district: "vyritsa",
  siteStatus: "COMPLETED",
  description: "<p>Описание</p>",
  worksDescription: "<p>Работы</p>",
  houseProjectId: "",
  order: "0",
  telegramUrl: "",
  vkUrl: "",
  clientReviewText: "Отличный дом!",
  clientReviewVideoUrl: "",
  renders: ["/uploads/a.webp"],
  plans: [{ url: "/uploads/plan.webp", label: "1 этаж" }],
  phaseMedia: { foundation: ["/uploads/f.webp"] },
  videos: [],
  historyStages: [{ id: "h1", title: "2024", description: "Старт" }],
  caseStudyPhases: [{ id: "foundation", title: "Фундамент", order: 0 }],
};

describe("built-object-admin-sections", () => {
  it("parseBuiltObjectAdminSection accepts known sections", () => {
    expect(parseBuiltObjectAdminSection("main")).toBe("main");
    expect(parseBuiltObjectAdminSection("history")).toBe("history");
    expect(parseBuiltObjectAdminSection("media")).toBe("media");
    expect(parseBuiltObjectAdminSection("phases")).toBe("phases");
    expect(parseBuiltObjectAdminSection("other")).toBeNull();
  });

  it("buildBuiltObjectSectionPayload splits fields by section", () => {
    expect(buildBuiltObjectSectionPayload("main", sampleForm)).toMatchObject({
      title: "Дом в Вырице",
      slug: "vyritsa",
      order: "0",
    });
    expect(buildBuiltObjectSectionPayload("history", sampleForm)).toEqual({
      constructionHistoryJson: [{ id: "h1", title: "2024", description: "Старт" }],
    });
    expect(buildBuiltObjectSectionPayload("phases", sampleForm)).toMatchObject({
      caseStudyPhasesJson: [{ id: "foundation", title: "Фундамент", order: 0 }],
      renders: ["/uploads/a.webp"],
    });
    expect(buildBuiltObjectSectionPayload("media", sampleForm)).toMatchObject({
      renders: ["/uploads/a.webp"],
      clientReviewText: "Отличный дом!",
      clientReviewVideoUrl: null,
      telegramUrl: "",
    });
    expect(buildBuiltObjectSectionPayload("media", sampleForm)).not.toHaveProperty("stages");
  });

  it("builtObjectSectionPayloadString is stable for dirty tracking", () => {
    const a = builtObjectSectionPayloadString("main", sampleForm);
    const b = builtObjectSectionPayloadString("main", { ...sampleForm });
    expect(a).toBe(b);
    expect(builtObjectSectionPayloadString("main", { ...sampleForm, title: "Другой" })).not.toBe(a);
  });

  it("hasUnpublishedBuiltObjectSiteDraft when not published", () => {
    expect(
      hasUnpublishedBuiltObjectSiteDraft({
        published: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
        sitePublishedAt: null,
      }),
    ).toBe(true);
  });

  it("hasUnpublishedBuiltObjectSiteDraft when saved after publish", () => {
    expect(
      hasUnpublishedBuiltObjectSiteDraft({
        published: true,
        updatedAt: "2026-06-20T12:00:00.000Z",
        sitePublishedAt: "2026-06-19T12:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("hasUnpublishedBuiltObjectSiteDraft false when in sync with site", () => {
    const at = "2026-06-20T12:00:00.000Z";
    expect(
      hasUnpublishedBuiltObjectSiteDraft({
        published: true,
        updatedAt: at,
        sitePublishedAt: at,
      }),
    ).toBe(false);
  });
});

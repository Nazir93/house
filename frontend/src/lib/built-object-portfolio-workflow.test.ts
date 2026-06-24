import { describe, expect, it } from "vitest";

import { builtObjectSectionUpdateData } from "@/lib/built-object-admin-patch";
import { builtObjectMediaCreatePayload } from "@/lib/built-object-admin-media";
import { buildBuiltObjectSectionPayload } from "@/lib/built-object-admin-sections";
import { hasBuiltObjectClientReview } from "@/lib/built-object-client-review";
import { getBuiltObjectNavItems } from "@/lib/built-object-detail";
import { buildBuiltObjectLocationFieldsFromInputs } from "@/lib/built-object-location-from-coords";
import { getCaseStudyPhasesForObject } from "@/lib/portfolio-case-study";
import {
  defaultCaseStudyPhaseDefinitions,
  remapLegacyPhaseMedia,
} from "@/lib/portfolio-case-study-phases";
import type { BuiltObjectItem } from "@/lib/construction-shared";

/**
 * Сквозной сценарий админки портфолио: координаты → этапы → отзыв → публикация.
 */
describe("built-object-portfolio-workflow", () => {
  const defaultPhases = defaultCaseStudyPhaseDefinitions();

  const adminForm = {
    title: "Дом в Токсово",
    slug: "toksovo",
    material: "GAS_BLOCK",
    area: "200",
    rooms: "4",
    bathrooms: "2",
    buildTerm: "180",
    floors: "2",
    location: "д. Токсово",
    latitude: "59.731536",
    longitude: "33.298553",
    regionSlug: "lo",
    district: "vsevolozhsk",
    siteStatus: "COMPLETED",
    description: "<p>Описание</p>",
    worksDescription: "",
    houseProjectId: "",
    order: "0",
    telegramUrl: "",
    vkUrl: "",
    clientReviewText: "Всё сделали в срок, рекомендуем!",
    clientReviewVideoUrl: "/uploads/review.mp4",
    renders: ["/uploads/cover.webp"],
    plans: [],
    phaseMedia: {
      foundation: ["/uploads/f.webp"],
      engineering: ["/uploads/e.webp"],
    },
    videos: ["/uploads/tour.mp4"],
    historyStages: [{ id: "h1", title: "2025", description: "Старт" }],
    caseStudyPhases: defaultPhases,
  };

  it("координаты → район Всеволожск", () => {
    expect(buildBuiltObjectLocationFieldsFromInputs("59.731536", "33.298553")).toMatchObject({
      regionSlug: "lo",
      district: "vsevolozhsk",
    });
  });

  it("7 этапов по умолчанию, инженерные объединены", () => {
    expect(defaultPhases.map((p) => p.id)).toEqual([
      "foundation",
      "walls",
      "roof",
      "facade",
      "engineering",
      "drainage-blind-area",
      "external-networks",
    ]);
    expect(
      remapLegacyPhaseMedia({ power: ["/p.jpg"], mep: ["/m.jpg"], "blind-area": ["/b.jpg"] }),
    ).toEqual({
      engineering: ["/p.jpg", "/m.jpg"],
      "drainage-blind-area": ["/b.jpg"],
    });
  });

  it("сохранение media: отзыв клиента + фото этапов без legacy stages", () => {
    const patch = builtObjectSectionUpdateData(buildBuiltObjectSectionPayload("media", adminForm), "media");
    expect(patch.clientReviewText).toBe("Всё сделали в срок, рекомендуем!");
    expect(patch.clientReviewVideoUrl).toBe("/uploads/review.mp4");

    const mediaRows = builtObjectMediaCreatePayload(buildBuiltObjectSectionPayload("media", adminForm));
    expect(mediaRows.some((r) => r.type === "BUILD_STAGE" && r.phaseKey === "foundation")).toBe(true);
    expect(mediaRows.some((r) => r.type === "BUILD_STAGE" && r.phaseKey === "engineering")).toBe(true);
    expect(mediaRows.every((r) => !("phaseKey" in r) || r.phaseKey)).toBe(true);
  });

  it("на сайте: отзыв в навигации, legacy прочие этапы не в таймлайне", () => {
    const object: BuiltObjectItem = {
      id: "1",
      slug: "toksovo",
      title: "Дом в Токсово",
      material: "GAS_BLOCK",
      description: "<p>Описание</p>",
      published: true,
      order: 0,
      clientReviewText: adminForm.clientReviewText,
      clientReviewVideoUrl: adminForm.clientReviewVideoUrl,
      caseStudyPhasesJson: defaultPhases,
      media: [
        { id: "r1", type: "RENDER", url: "/uploads/cover.webp", alt: "", order: 0 },
        { id: "f1", type: "BUILD_STAGE", url: "/uploads/f.webp", alt: "", order: 0, phaseKey: "foundation" },
        { id: "legacy", type: "BUILD_STAGE", url: "/uploads/old.webp", alt: "", order: 1 },
        { id: "v1", type: "VIDEO", url: "/uploads/tour.mp4", alt: "", order: 0 },
      ],
    };

    expect(hasBuiltObjectClientReview(object)).toBe(true);
    expect(getBuiltObjectNavItems(object).map((i) => i.id)).toContain("client-review");

    const timelineIds = getCaseStudyPhasesForObject(object).map((p) => p.id);
    expect(timelineIds).toContain("foundation");
    expect(timelineIds).not.toContain("_build_stages");
  });
});

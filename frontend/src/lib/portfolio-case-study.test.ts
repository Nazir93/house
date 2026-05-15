import { describe, expect, it } from "vitest";
import { getCaseStudyPhasesForObject } from "@/lib/portfolio-case-study";
import type { BuiltObjectItem } from "@/lib/construction-shared";

function object(partial: Partial<BuiltObjectItem>): BuiltObjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Test",
    material: "GAS_BLOCK",
    description: "",
    published: true,
    order: 0,
    media: [],
    ...partial,
  };
}

describe("getCaseStudyPhasesForObject", () => {
  it("не показывает разделы стройки без фото", () => {
    const phases = getCaseStudyPhasesForObject(object({}));
    expect(phases.map((p) => p.id)).toEqual([]);
  });

  it("показывает только разделы с загруженными фото", () => {
    const phases = getCaseStudyPhasesForObject(
      object({
        media: [
          { id: "r1", type: "RENDER", url: "/a.jpg", alt: "", order: 0 },
          { id: "f1", type: "BUILD_STAGE", url: "/f.jpg", alt: "", order: 0, phaseKey: "foundation" },
        ],
      })
    );
    expect(phases.map((p) => p.id)).toEqual(["_cms_renders", "foundation"]);
  });

  it("показывает рендеры при описании без фото", () => {
    const phases = getCaseStudyPhasesForObject(object({ description: "<p>Описание</p>" }));
    expect(phases.map((p) => p.id)).toEqual(["_cms_renders"]);
  });
});

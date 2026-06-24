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

  it("shows custom phase title from json", () => {
    const phases = getCaseStudyPhasesForObject(
      object({
        caseStudyPhasesJson: [{ id: "foundation", title: "Монолитная плита", order: 0 }],
        media: [
          { id: "f1", type: "BUILD_STAGE", url: "/f.jpg", alt: "", order: 0, phaseKey: "foundation" },
        ],
      }),
    );
    expect(phases.find((p) => p.id === "foundation")?.title).toBe("Монолитная плита");
  });

  it("показывает рендеры при описании без фото", () => {
    const phases = getCaseStudyPhasesForObject(object({ description: "<p>Описание</p>" }));
    expect(phases.map((p) => p.id)).toEqual(["_cms_renders"]);
  });

  it("legacy BUILD_STAGE без phaseKey не попадает в таймлайн кейса", () => {
    const phases = getCaseStudyPhasesForObject(
      object({
        media: [{ id: "legacy", type: "BUILD_STAGE", url: "/old.jpg", alt: "", order: 0 }],
      }),
    );
    expect(phases.map((p) => p.id)).not.toContain("_build_stages");
    expect(phases).toHaveLength(0);
  });
});

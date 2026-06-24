import { describe, expect, it } from "vitest";

import {
  createCaseStudyPhaseDefinition,
  defaultCaseStudyPhaseDefinitions,
  normalizeCaseStudyPhaseKey,
  parseCaseStudyPhasesJson,
  remapLegacyPhaseMedia,
} from "@/lib/portfolio-case-study-phases";

describe("portfolio-case-study-phases", () => {
  it("returns seven default phases when json is empty", () => {
    const defaults = parseCaseStudyPhasesJson(null);
    expect(defaults).toHaveLength(7);
    expect(defaults.map((p) => p.id)).toEqual([
      "foundation",
      "walls",
      "roof",
      "facade",
      "engineering",
      "drainage-blind-area",
      "external-networks",
    ]);
  });

  it("parses custom phases from json", () => {
    expect(
      parseCaseStudyPhasesJson([
        { id: "custom-1", title: "Мой этап", order: 0 },
        { id: "custom-2", title: "Второй", order: 1 },
      ]),
    ).toEqual([
      { id: "custom-1", title: "Мой этап", order: 0 },
      { id: "custom-2", title: "Второй", order: 1 },
    ]);
  });

  it("createCaseStudyPhaseDefinition generates unique id", () => {
    const phase = createCaseStudyPhaseDefinition("Тест");
    expect(phase.title).toBe("Тест");
    expect(phase.id.startsWith("phase-")).toBe(true);
  });

  it("defaultCaseStudyPhaseDefinitions keeps known ids", () => {
    const ids = defaultCaseStudyPhaseDefinitions().map((p) => p.id);
    expect(ids).toContain("foundation");
    expect(ids).toContain("engineering");
    expect(ids).toHaveLength(7);
  });

  it("remapLegacyPhaseMedia merges drainage and blind-area", () => {
    expect(remapLegacyPhaseMedia({ "blind-area": ["/b.jpg"], landscaping: ["/l.jpg"] })).toEqual({
      "drainage-blind-area": ["/b.jpg", "/l.jpg"],
    });
  });

  it("normalizeCaseStudyPhaseKey maps legacy ids", () => {
    expect(normalizeCaseStudyPhaseKey("partitions")).toBe("walls");
    expect(normalizeCaseStudyPhaseKey("power")).toBe("engineering");
    expect(normalizeCaseStudyPhaseKey("foundation")).toBe("foundation");
    expect(normalizeCaseStudyPhaseKey(null)).toBeNull();
  });

  it("external-networks stays separate from engineering remap", () => {
    expect(
      remapLegacyPhaseMedia({
        power: ["/p.jpg"],
        "external-networks": ["/n.jpg"],
      }),
    ).toEqual({
      engineering: ["/p.jpg"],
      "external-networks": ["/n.jpg"],
    });
  });
});

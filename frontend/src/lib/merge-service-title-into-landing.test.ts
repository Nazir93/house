import { describe, expect, it } from "vitest";

import { mergeServiceTitleIntoLandingJson } from "@/lib/merge-service-title-into-landing";

describe("mergeServiceTitleIntoLandingJson", () => {
  it("подставляет название в hero", () => {
    const out = mergeServiceTitleIntoLandingJson(
      {
        sections: [
          { type: "schema", serviceName: "A", serviceDescription: "B", slug: "/services/x" },
          { type: "hero", title: "Старое", subtitle: "L", serviceKey: "x", tag: "T", features: [], goals: "G" },
        ],
      },
      "Новое название",
    ) as { sections: Array<{ type: string; title?: string }> };
    expect(out.sections[1]?.title).toBe("Новое название");
  });

  it("подставляет название в heroCinematic", () => {
    const out = mergeServiceTitleIntoLandingJson(
      {
        sections: [{ type: "heroCinematic", title: "Старое", subtitle: "L" }],
      },
      "Новый H1",
    ) as { sections: Array<{ type: string; title?: string }> };
    expect(out.sections[0]?.title).toBe("Новый H1");
  });
});

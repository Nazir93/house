import { describe, expect, it } from "vitest";

import {
  builtObjectFormHasMediaPayload,
  builtObjectMediaCreatePayload,
  mapBuiltObjectMediaToForm,
} from "@/lib/built-object-admin-media";
import { defaultCaseStudyPhaseDefinitions } from "@/lib/portfolio-case-study-phases";

describe("built-object-admin-media", () => {
  it("builtObjectMediaCreatePayload writes phase photos with phaseKey", () => {
    const rows = builtObjectMediaCreatePayload({
      caseStudyPhasesJson: [{ id: "foundation", title: "Фундамент", order: 0 }],
      phaseMedia: { foundation: ["/uploads/f1.webp", "/uploads/f2.webp"] },
    });
    expect(rows).toEqual([
      { type: "BUILD_STAGE", url: "/uploads/f1.webp", order: 0, phaseKey: "foundation" },
      { type: "BUILD_STAGE", url: "/uploads/f2.webp", order: 1, phaseKey: "foundation" },
    ]);
  });

  it("builtObjectMediaCreatePayload assigns global order across phases", () => {
    const rows = builtObjectMediaCreatePayload({
      caseStudyPhasesJson: [
        { id: "foundation", title: "Фундамент", order: 0 },
        { id: "walls", title: "Стены", order: 1 },
      ],
      phaseMedia: {
        foundation: ["/uploads/f1.webp", "/uploads/f2.webp"],
        walls: ["/uploads/w1.webp"],
      },
    });
    expect(rows.filter((r) => r.type === "BUILD_STAGE")).toEqual([
      { type: "BUILD_STAGE", url: "/uploads/f1.webp", order: 0, phaseKey: "foundation" },
      { type: "BUILD_STAGE", url: "/uploads/f2.webp", order: 1, phaseKey: "foundation" },
      { type: "BUILD_STAGE", url: "/uploads/w1.webp", order: 2, phaseKey: "walls" },
    ]);
  });

  it("builtObjectMediaCreatePayload does not include legacy stages field", () => {
    const rows = builtObjectMediaCreatePayload({
      renders: ["/uploads/r.webp"],
      stages: ["/uploads/legacy.webp"],
      phaseMedia: { foundation: ["/uploads/f.webp"] },
      caseStudyPhasesJson: [{ id: "foundation", title: "Фундамент", order: 0 }],
    });
    expect(rows.some((r) => r.url === "/uploads/legacy.webp")).toBe(false);
    expect(rows.some((r) => r.url === "/uploads/f.webp" && r.phaseKey === "foundation")).toBe(true);
  });

  it("builtObjectFormHasMediaPayload ignores removed stages field", () => {
    expect(builtObjectFormHasMediaPayload({ stages: ["/x.webp"] })).toBe(false);
    expect(builtObjectFormHasMediaPayload({ phaseMedia: { foundation: [] } })).toBe(true);
  });

  it("mapBuiltObjectMediaToForm groups media by phase id", () => {
    const form = mapBuiltObjectMediaToForm(
      [
        { type: "RENDER", url: "/r.webp" },
        { type: "BUILD_STAGE", url: "/f.webp", phaseKey: "foundation", order: 0 },
        { type: "BUILD_STAGE", url: "/w.webp", phaseKey: "walls", order: 0 },
        { type: "VIDEO", url: "/v.mp4" },
      ],
      defaultCaseStudyPhaseDefinitions(),
    );
    expect(form.renders).toEqual(["/r.webp"]);
    expect(form.phaseMedia.foundation).toEqual(["/f.webp"]);
    expect(form.phaseMedia.walls).toEqual(["/w.webp"]);
    expect(form.videos).toEqual(["/v.mp4"]);
    expect(form).not.toHaveProperty("stages");
  });

  it("mapBuiltObjectMediaToForm preserves order within phase", () => {
    const form = mapBuiltObjectMediaToForm(
      [
        { type: "BUILD_STAGE", url: "/f2.webp", phaseKey: "foundation", order: 1 },
        { type: "BUILD_STAGE", url: "/f1.webp", phaseKey: "foundation", order: 0 },
      ],
      defaultCaseStudyPhaseDefinitions(),
    );
    expect(form.phaseMedia.foundation).toEqual(["/f1.webp", "/f2.webp"]);
  });
});

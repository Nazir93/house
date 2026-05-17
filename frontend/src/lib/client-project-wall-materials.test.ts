import { describe, expect, it } from "vitest";
import { buildWallMaterialSelectOptions, normalizeWallMaterialLabel } from "./client-project-wall-materials";

describe("client-project-wall-materials", () => {
  it("normalizeWallMaterialLabel trims and collapses spaces", () => {
    expect(normalizeWallMaterialLabel("  газобетон  ")).toBe("газобетон");
    expect(normalizeWallMaterialLabel("керамо  блок")).toBe("керамо блок");
  });

  it("buildWallMaterialSelectOptions lists presets, custom, and current", () => {
    const opts = buildWallMaterialSelectOptions("Монолит", ["Пеноблок"]);
    expect(opts.map((o) => o.label)).toEqual(["Газобетон", "Керамоблок", "Кирпич", "Пеноблок", "Монолит"]);
  });

  it("does not duplicate preset when current matches case-insensitively", () => {
    const opts = buildWallMaterialSelectOptions("газобетон", []);
    expect(opts.map((o) => o.label)).toEqual(["Газобетон", "Керамоблок", "Кирпич"]);
  });
});

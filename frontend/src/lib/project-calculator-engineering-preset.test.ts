import { describe, expect, it } from "vitest";
import {
  ENGINEERING_NETWORKS_PRESET_SLUGS,
  PREFINISH_CONSTRUCTION_PRESET_SLUGS,
  applyEngineeringNetworksOnlyPreset,
  applyEngineeringNetworksPreset,
  applyPrefinishFinishPreset,
} from "@/lib/project-calculator-engineering-preset";

describe("project-calculator-engineering-preset", () => {
  it("кнопка «Инженерные сети» выбирает 6 опций без тёплого пола", () => {
    const selected = applyEngineeringNetworksPreset();
    expect([...selected].sort()).toEqual([...ENGINEERING_NETWORKS_PRESET_SLUGS].sort());
    expect(selected).toEqual(
      new Set(["electric", "water", "radiators", "sewer", "bio", "boiler"]),
    );
    expect(selected.has("heatedFloor")).toBe(false);
  });

  it("кнопка «Инженерные сети» сбрасывает стройопции предчистовой", () => {
    const afterPrefinish = applyPrefinishFinishPreset();
    expect(afterPrefinish.construction.size).toBeGreaterThan(0);

    const onlyEng = applyEngineeringNetworksOnlyPreset();
    expect(onlyEng.engineering).toEqual(applyEngineeringNetworksPreset());
    expect(onlyEng.construction.size).toBe(0);
    for (const slug of PREFINISH_CONSTRUCTION_PRESET_SLUGS) {
      expect(onlyEng.construction.has(slug)).toBe(false);
    }
  });

  it("кнопка «Предчистовая отделка» = инженерия + штукатурка, утепление 200, софиты, водосток", () => {
    const preset = applyPrefinishFinishPreset();
    expect(preset.engineering).toEqual(applyEngineeringNetworksPreset());
    expect([...preset.construction].sort()).toEqual([...PREFINISH_CONSTRUCTION_PRESET_SLUGS].sort());
    expect(preset.construction.has("roof_insulation_250")).toBe(false);
  });
});

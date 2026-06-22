import { describe, expect, it } from "vitest";
import {
  computePartOfSoulAddonRub,
  computePartOfSoulShellTotalRub,
  engineeringAddonRub,
  facadeAddonTotalRub,
  inferPartOfSoulFloors,
  partOfSoulRoofOptions,
  resolveProjectRoofPitch,
  shellRubPerSqm,
  tierIdToWallMaterial,
} from "./part-of-soul-pricing";

describe("part-of-soul-pricing", () => {
  it("inferPartOfSoulFloors: integer этажности", () => {
    expect(inferPartOfSoulFloors(1)).toBe(1);
    expect(inferPartOfSoulFloors(2)).toBe(2);
    expect(inferPartOfSoulFloors(1, 1.5)).toBe(1.5);
  });

  it("partOfSoulRoofOptions: допустимые кровли по этажности", () => {
    expect(partOfSoulRoofOptions(1)).toEqual(["dual", "triple", "quad", "flat"]);
    expect(partOfSoulRoofOptions(1.5)).toEqual(["dual", "triple"]);
    expect(partOfSoulRoofOptions(2)).toEqual(["dual", "triple", "quad", "flat"]);
  });

  it("resolveProjectRoofPitch: плоская доступна только на 1 и 2 этажах", () => {
    expect(resolveProjectRoofPitch(1, "flat")).toBe("flat");
    expect(resolveProjectRoofPitch(2, "flat")).toBe("flat");
    expect(resolveProjectRoofPitch(1.5, "flat")).toBe("dual");
  });

  it("resolveProjectRoofPitch: defaultRoof из проекта или первая допустимая", () => {
    expect(resolveProjectRoofPitch(1, "triple")).toBe("triple");
    expect(resolveProjectRoofPitch(1.5, "quad")).toBe("dual");
    expect(resolveProjectRoofPitch(2, undefined)).toBe("quad");
  });

  it("shellRubPerSqm: 1 эт. двускат, газоблок (PDF)", () => {
    expect(shellRubPerSqm(1, "dual", "gas")).toBe(65_825);
  });

  it("shellRubPerSqm: плоская кровля как четырёхскатная", () => {
    expect(shellRubPerSqm(1, "flat", "gas")).toBe(shellRubPerSqm(1, "quad", "gas"));
    expect(shellRubPerSqm(2, "flat", "brick")).toBe(shellRubPerSqm(2, "quad", "brick"));
  });

  it("computePartOfSoulShellTotalRub: Aurora 128 м² без надбавки", () => {
    const total =
      computePartOfSoulShellTotalRub({
        areaSqm: 128,
        pf: 1,
        roof: "dual",
        wall: "gas",
        smallThresholdSqm: 100,
        shellSurchargeIfSmall: 0.15,
      }) ?? 0;
    expect(total).toBe(65_825 * 128);
  });

  it("computePartOfSoulShellTotalRub: малая площадь +15%", () => {
    const total =
      computePartOfSoulShellTotalRub({
        areaSqm: 90,
        pf: 1,
        roof: "dual",
        wall: "gas",
        smallThresholdSqm: 100,
        shellSurchargeIfSmall: 0.15,
      }) ?? 0;
    expect(total).toBe(Math.round(65_825 * 90 * 1.15));
  });

  it("engineeringAddonRub: электро 1 этаж за м²", () => {
    expect(engineeringAddonRub("electric", 1, 128)).toBe(3_839 * 128);
    expect(engineeringAddonRub("boiler", 1, 128)).toBe(295_495);
  });

  it("computePartOfSoulAddonRub: сумма инж. и фасада", () => {
    const el = computePartOfSoulAddonRub(
      { kind: "engineering", code: "electric" },
      { areaSqm: 100, pf: 1, roof: "dual" }
    );
    expect(el).toBe(383_900);
    const facade = computePartOfSoulAddonRub(
      { kind: "facade", variant: "plaster" },
      { areaSqm: 100, pf: 1, roof: "dual" }
    );
    expect(facade).toBe(764_300);
  });

  it("facadeAddonTotalRub: трёхскатная дороже двускатной (кирпич)", () => {
    const dual = facadeAddonTotalRub("brick", 100, "dual", 1) ?? 0;
    const triple = facadeAddonTotalRub("brick", 100, "triple", 1) ?? 0;
    expect(triple).toBeGreaterThan(dual);
  });

  it("facade для pf=2 не задаётся в PDF", () => {
    expect(facadeAddonTotalRub("brick", 100, "quad", 2)).toBeNull();
  });

  it("tierIdToWallMaterial по label", () => {
    expect(tierIdToWallMaterial("x", "Газоблок")).toBe("gas");
    expect(tierIdToWallMaterial("x", "Керамоблок")).toBe("ceramic");
    expect(tierIdToWallMaterial("x", "Кирпич")).toBe("brick");
  });
});

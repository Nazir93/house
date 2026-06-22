/**
 * Ориентиры ценообразования из PDF «Для сайта / калькулятор» (Часть души).
 * Цена коробки: ₽ за м² строительной площади × площадь; дом &lt; 100 м² — +15%.
 * Инженерия и отделка фасада (добавочные блоки): +10% к сумме этих опций при площади &lt; 100 м².
 */

export type PartOfSoulRoofPitch = "dual" | "triple" | "quad" | "flat";
export type PartOfSoulPricingFloors = 1 | 1.5 | 2;
export type PartOfSoulWallMaterial = "gas" | "ceramic" | "brick";

/** Код строки калькулятора доп. опций (PDF). */
export type PartOfSoulEngineeringCode =
  | "electric"
  | "radiators"
  | "water"
  | "heatedFloor"
  | "sewer"
  | "boiler"
  | "bio";

export type PartOfSoulFacadeVariant = "brick" | "plaster" | "thermo" | "brick_insulated";

const SHELL_MATRIX: Partial<Record<`${PartOfSoulPricingFloors}_${PartOfSoulRoofPitch}_${PartOfSoulWallMaterial}`, number>> = {
  "1_dual_gas": 65_825,
  "1_dual_ceramic": 68_054,
  "1_dual_brick": 71_462,
  "1_triple_gas": 66_123,
  "1_triple_ceramic": 70_161,
  "1_triple_brick": 73_527,
  "1_quad_gas": 65_126,
  "1_quad_ceramic": 68_680,
  "1_quad_brick": 72_480,
  "1_flat_gas": 65_126,
  "1_flat_ceramic": 68_680,
  "1_flat_brick": 72_480,
  "1.5_dual_gas": 50_890,
  "1.5_dual_ceramic": 53_078,
  "1.5_dual_brick": 55_409,
  "1.5_triple_gas": 51_894,
  "1.5_triple_ceramic": 54_259,
  "1.5_triple_brick": 56_781,
  "2_dual_gas": 55_446,
  "2_dual_ceramic": 56_725,
  "2_dual_brick": 60_299,
  "2_triple_gas": 55_446,
  "2_triple_ceramic": 56_725,
  "2_triple_brick": 60_299,
  "2_quad_gas": 55_446,
  "2_quad_ceramic": 56_725,
  "2_quad_brick": 60_299,
  "2_flat_gas": 55_446,
  "2_flat_ceramic": 56_725,
  "2_flat_brick": 60_299,
};

const ENG: Record<PartOfSoulPricingFloors, Record<Exclude<PartOfSoulEngineeringCode, "boiler" | "bio">, number>> &
  Record<PartOfSoulPricingFloors, { boiler: number; bio: number }> = {
  1: {
    electric: 3_839,
    radiators: 4_698,
    water: 667,
    heatedFloor: 7_418,
    sewer: 556,
    boiler: 295_495,
    bio: 351_458,
  },
  1.5: {
    electric: 3_730,
    radiators: 4_564,
    water: 648,
    heatedFloor: 7_418,
    sewer: 540,
    boiler: 295_495,
    bio: 351_458,
  },
  2: {
    electric: 3_730,
    radiators: 4_564,
    water: 648,
    heatedFloor: 7_418,
    sewer: 540,
    boiler: 295_495,
    bio: 351_458,
  },
};

const FACADE_DUAL: Record<PartOfSoulFacadeVariant, number> = {
  brick: 19_478,
  plaster: 7_643,
  thermo: 12_309,
  brick_insulated: 22_400,
};

const FACADE_TRIPLE: Record<PartOfSoulFacadeVariant, number> = {
  brick: 19_554,
  plaster: 7_673,
  thermo: 12_357,
  brick_insulated: 22_487,
};

export function inferPartOfSoulFloors(projectFloorsInt: number, override?: PartOfSoulPricingFloors): PartOfSoulPricingFloors {
  if (override === 1 || override === 1.5 || override === 2) return override;
  if (projectFloorsInt >= 2) return 2;
  return 1;
}

export function partOfSoulRoofOptions(pf: PartOfSoulPricingFloors): PartOfSoulRoofPitch[] {
  if (pf === 1) return ["dual", "triple", "quad", "flat"];
  if (pf === 1.5) return ["dual", "triple"];
  return ["dual", "triple", "quad", "flat"];
}

/**
 * Кровля для расчёта привязана к проекту: `partOfSoul.defaultRoof` в calculatorJson.
 * Если не задано или не совместимо с этажностью — первая допустимая из матрицы.
 */
export function resolveProjectRoofPitch(
  pricingFloors: PartOfSoulPricingFloors,
  projectDefault?: PartOfSoulRoofPitch
): PartOfSoulRoofPitch {
  const choices = partOfSoulRoofOptions(pricingFloors);
  if (choices.length === 0) return "dual";
  if (projectDefault && choices.includes(projectDefault)) return projectDefault;
  if (pricingFloors === 2) return "quad";
  return choices[0];
}

export function partOfSoulRoofLabels(r: PartOfSoulRoofPitch): string {
  const m: Record<PartOfSoulRoofPitch, string> = {
    dual: "Двухскатная",
    triple: "Трёхскатная",
    quad: "Четырёхскатная",
    flat: "Плоская",
  };
  return m[r];
}

export function shellRubPerSqm(
  pf: PartOfSoulPricingFloors,
  roof: PartOfSoulRoofPitch,
  wall: PartOfSoulWallMaterial
): number | null {
  const key =
    `${pf}_${roof}_${wall}` as `${PartOfSoulPricingFloors}_${PartOfSoulRoofPitch}_${PartOfSoulWallMaterial}`;
  const v = SHELL_MATRIX[key];
  return v != null ? v : null;
}

export function computePartOfSoulShellTotalRub(params: {
  areaSqm: number;
  pf: PartOfSoulPricingFloors;
  roof: PartOfSoulRoofPitch;
  wall: PartOfSoulWallMaterial;
  smallThresholdSqm: number;
  /** Доля надбавки к коробке при площади меньше порога (PDF: 0,15). */
  shellSurchargeIfSmall?: number;
}): number | null {
  const rate = shellRubPerSqm(params.pf, params.roof, params.wall);
  if (rate == null) return null;
  let total = rate * Math.max(params.areaSqm, 0);
  if (params.areaSqm < params.smallThresholdSqm) {
    total *= 1 + (params.shellSurchargeIfSmall ?? 0.15);
  }
  return Math.round(total);
}

export function tierIdToWallMaterial(id: string, label: string): PartOfSoulWallMaterial {
  const s = `${id} ${label}`.toLowerCase();
  if (s.includes("кирпич")) return "brick";
  if (s.includes("керам")) return "ceramic";
  return "gas";
}

export function engineeringAddonRub(code: PartOfSoulEngineeringCode, pf: PartOfSoulPricingFloors, areaSqm: number): number {
  const row = ENG[pf];
  if (!row) return 0;
  if (code === "boiler") return row.boiler;
  if (code === "bio") return row.bio;
  const rate = row[code as Exclude<PartOfSoulEngineeringCode, "boiler" | "bio">];
  return Math.round(rate * Math.max(areaSqm, 0));
}

/** ₽ за м² строительной площади (PDF: отделка фасада, 1-й этаж). Для четырёх-/плоской по 1 эт. в документе нет строк — берём ближе к двухскатной. */
export function facadeRubPerSqm(roof: PartOfSoulRoofPitch, variant: PartOfSoulFacadeVariant, pf: PartOfSoulPricingFloors): number | null {
  if (pf !== 1) return null;
  const table = roof === "triple" ? FACADE_TRIPLE : FACADE_DUAL;
  return table[variant] ?? null;
}

export function facadeAddonTotalRub(
  variant: PartOfSoulFacadeVariant,
  areaSqm: number,
  roof: PartOfSoulRoofPitch,
  pf: PartOfSoulPricingFloors
): number | null {
  const unit = facadeRubPerSqm(roof, variant, pf);
  if (unit == null) return null;
  return Math.round(unit * Math.max(areaSqm, 0));
}

export type PartOfSoulConstructionCode =
  | "blind_area"
  | "drainage"
  | "soffits"
  | "gutter"
  | "roof_folding"
  | "roof_soft"
  | "roof_insulation_200"
  | "roof_insulation_250"
  | "monolithic_stairs"
  | "monolithic_overlap";

export type PartOfSoulAddonPricingSpec =
  | { kind: "engineering"; code: PartOfSoulEngineeringCode }
  | { kind: "facade"; variant: PartOfSoulFacadeVariant }
  | { kind: "construction"; code: PartOfSoulConstructionCode }
  | { kind: "fixed"; rub: number };

/** Сумма по строке галереи доп. опций (для таблицы и «Итого»). */
export function computePartOfSoulAddonRub(
  spec: PartOfSoulAddonPricingSpec,
  ctx: { areaSqm: number; pf: PartOfSoulPricingFloors; roof: PartOfSoulRoofPitch }
): number {
  if (spec.kind === "fixed") return Math.round(spec.rub);
  if (spec.kind === "engineering") return engineeringAddonRub(spec.code, ctx.pf, ctx.areaSqm);
  if (spec.kind === "facade") {
    const total = facadeAddonTotalRub(spec.variant, ctx.areaSqm, ctx.roof, ctx.pf);
    return total ?? 0;
  }
  return 0;
}

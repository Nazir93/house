/**
 * Ориентировочный расчёт строительства по прайсу.
 * Константы по умолчанию можно переопределить из админки (SiteSettings JSON).
 * Террасы/крыльца с коэффициентом 0.5 к площади — вручную при смете.
 */

export type WallMaterialId = "gas" | "ceramic" | "brick";

export type RoofTypeId = "dual" | "triple" | "quad" | "flat";

/** Этажность из прайса */
export type CatalogFloorId = "1" | "1.5" | "2";

export const WALL_MATERIAL_LABELS: Record<WallMaterialId, string> = {
  gas: "Газобетон",
  ceramic: "Керамоблок",
  brick: "Кирпич",
};

export const ROOF_LABELS: Record<RoofTypeId, string> = {
  dual: "Двухскатная",
  triple: "Трёхскатная",
  quad: "Четырёхскатная",
  flat: "Плоская",
};

export const CATALOG_FLOOR_LABELS: Record<CatalogFloorId, string> = {
  "1": "1 этаж",
  "1.5": "1,5 этажа",
  "2": "2 этажа",
};

const MATERIAL_ORDER: WallMaterialId[] = ["gas", "ceramic", "brick"];

function materialIndex(id: WallMaterialId): number {
  return MATERIAL_ORDER.indexOf(id);
}

export type BaseRubTriple = [number, number, number];

export type BaseRubMatrix = Record<CatalogFloorId, Partial<Record<RoofTypeId, BaseRubTriple>>>;

export type EngineeringRatesBlock = {
  electricPerM2: number;
  waterPerM2: number;
  sewagePerM2: number;
  radiatorsPerM2: number;
  warmFloorFirstPerM2: number;
  boilerFixed: number;
  bioFixed: number;
};

export type FacadeRatesDualTriple = Record<
  "dual" | "triple",
  Record<"brick" | "plaster" | "thermo" | "brick_insulated", number>
>;

export interface HouseConstructionCalculatorConfig {
  baseRubPerM2: BaseRubMatrix;
  smallArea: {
    baseThresholdM2: number;
    baseSurcharge: number;
    engineeringThresholdM2: number;
    engineeringSurcharge: number;
  };
  engineering: {
    one: EngineeringRatesBlock;
    one_half_or_two: EngineeringRatesBlock;
  };
  facadeRubPerM2: FacadeRatesDualTriple;
}

function finiteOr(defaultVal: number, v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : defaultVal;
}

function mergeTriple(def: BaseRubTriple, v: unknown): BaseRubTriple {
  if (!Array.isArray(v) || v.length !== 3) return def;
  return [
    finiteOr(def[0], v[0]),
    finiteOr(def[1], v[1]),
    finiteOr(def[2], v[2]),
  ];
}

function mergeBaseMatrix(def: BaseRubMatrix, raw: unknown): BaseRubMatrix {
  if (!raw || typeof raw !== "object") return def;
  const out: BaseRubMatrix = structuredClone(def);
  for (const cf of Object.keys(def) as CatalogFloorId[]) {
    const floorPatch = (raw as Record<string, unknown>)[cf];
    if (!floorPatch || typeof floorPatch !== "object") continue;
    for (const roof of Object.keys(def[cf] ?? {}) as RoofTypeId[]) {
      const cell = (floorPatch as Record<string, unknown>)[roof];
      const d = def[cf]?.[roof];
      if (d && cell !== undefined) {
        const merged = mergeTriple(d, cell);
        if (!out[cf]) out[cf] = {};
        (out[cf] as Record<string, BaseRubTriple>)[roof] = merged;
      }
    }
  }
  return out;
}

function mergeEngBlock(def: EngineeringRatesBlock, raw: unknown): EngineeringRatesBlock {
  if (!raw || typeof raw !== "object") return def;
  const o = raw as Record<string, unknown>;
  return {
    electricPerM2: finiteOr(def.electricPerM2, o.electricPerM2),
    waterPerM2: finiteOr(def.waterPerM2, o.waterPerM2),
    sewagePerM2: finiteOr(def.sewagePerM2, o.sewagePerM2),
    radiatorsPerM2: finiteOr(def.radiatorsPerM2, o.radiatorsPerM2),
    warmFloorFirstPerM2: finiteOr(def.warmFloorFirstPerM2, o.warmFloorFirstPerM2),
    boilerFixed: finiteOr(def.boilerFixed, o.boilerFixed),
    bioFixed: finiteOr(def.bioFixed, o.bioFixed),
  };
}

function mergeFacade(def: FacadeRatesDualTriple, raw: unknown): FacadeRatesDualTriple {
  if (!raw || typeof raw !== "object") return def;
  const out: FacadeRatesDualTriple = structuredClone(def);
  for (const k of ["dual", "triple"] as const) {
    const patch = (raw as Record<string, unknown>)[k];
    if (!patch || typeof patch !== "object") continue;
    for (const fin of ["brick", "plaster", "thermo", "brick_insulated"] as const) {
      const val = (patch as Record<string, unknown>)[fin];
      if (val !== undefined) {
        out[k][fin] = finiteOr(out[k][fin], val);
      }
    }
  }
  return out;
}

/** Прайс по умолчанию (PDF / исходная сетка). */
export const DEFAULT_HOUSE_CONSTRUCTION_CONFIG: HouseConstructionCalculatorConfig = {
  baseRubPerM2: {
    "1": {
      dual: [65_825, 68_054, 71_462],
      triple: [66_123, 70_161, 73_527],
      quad: [65_126, 68_680, 72_480],
      flat: [65_126, 68_680, 72_480],
    },
    "1.5": {
      dual: [50_890, 53_078, 55_409],
      triple: [51_894, 54_259, 56_781],
    },
    "2": {
      quad: [55_446, 56_725, 60_299],
      flat: [55_446, 56_725, 60_299],
    },
  },
  smallArea: {
    baseThresholdM2: 100,
    baseSurcharge: 0.15,
    engineeringThresholdM2: 100,
    engineeringSurcharge: 0.1,
  },
  engineering: {
    one: {
      electricPerM2: 3_839,
      waterPerM2: 667,
      sewagePerM2: 556,
      radiatorsPerM2: 4_698,
      warmFloorFirstPerM2: 7_418,
      boilerFixed: 295_495,
      bioFixed: 351_458,
    },
    one_half_or_two: {
      electricPerM2: 3_730,
      waterPerM2: 648,
      sewagePerM2: 540,
      radiatorsPerM2: 4_564,
      warmFloorFirstPerM2: 7_418,
      boilerFixed: 295_495,
      bioFixed: 351_458,
    },
  },
  facadeRubPerM2: {
    dual: {
      brick: 19_478,
      plaster: 7_643,
      thermo: 12_309,
      brick_insulated: 22_400,
    },
    triple: {
      brick: 19_554,
      plaster: 7_673,
      thermo: 12_357,
      brick_insulated: 22_487,
    },
  },
};

/** Слияние JSON из админки с дефолтом (безопасные числа). */
export function mergeHouseConstructionConfig(raw: unknown): HouseConstructionCalculatorConfig {
  const def = DEFAULT_HOUSE_CONSTRUCTION_CONFIG;
  if (!raw || typeof raw !== "object") return structuredClone(def);

  const o = raw as Record<string, unknown>;
  let smallArea = { ...def.smallArea };
  if (o.smallArea && typeof o.smallArea === "object") {
    const s = o.smallArea as Record<string, unknown>;
    smallArea = {
      baseThresholdM2: finiteOr(def.smallArea.baseThresholdM2, s.baseThresholdM2),
      baseSurcharge: finiteOr(def.smallArea.baseSurcharge, s.baseSurcharge),
      engineeringThresholdM2: finiteOr(def.smallArea.engineeringThresholdM2, s.engineeringThresholdM2),
      engineeringSurcharge: finiteOr(def.smallArea.engineeringSurcharge, s.engineeringSurcharge),
    };
  }

  let engineering = { ...def.engineering, one: { ...def.engineering.one }, one_half_or_two: { ...def.engineering.one_half_or_two } };
  if (o.engineering && typeof o.engineering === "object") {
    const e = o.engineering as Record<string, unknown>;
    engineering = {
      one: mergeEngBlock(def.engineering.one, e.one),
      one_half_or_two: mergeEngBlock(def.engineering.one_half_or_two, e.one_half_or_two),
    };
  }

  return {
    baseRubPerM2: mergeBaseMatrix(def.baseRubPerM2, o.baseRubPerM2),
    smallArea,
    engineering,
    facadeRubPerM2: mergeFacade(def.facadeRubPerM2, o.facadeRubPerM2),
  };
}

export function formatCalculatorConfigJson(config: HouseConstructionCalculatorConfig): string {
  return JSON.stringify(config, null, 2);
}

export type EngineeringFloorTier = "one" | "one_half_or_two";

export function engineeringFloorTier(catalogFloor: CatalogFloorId): EngineeringFloorTier {
  return catalogFloor === "1" ? "one" : "one_half_or_two";
}

export type FacadeFinishId = "none" | "brick" | "plaster" | "thermo" | "brick_insulated";

export const FACADE_FINISH_LABELS: Record<Exclude<FacadeFinishId, "none">, string> = {
  brick: "Облицовка кирпичом",
  plaster: "Штукатурка с утеплением",
  thermo: "Термопанели",
  brick_insulated: "Облицовка кирпичом с утеплением",
};

export type EngineeringSelection = {
  electric: boolean;
  water: boolean;
  sewage: boolean;
  radiators: boolean;
  warmFloor: boolean;
  boiler: boolean;
  bio: boolean;
};

/** Подписи опций инженерии — для заявки, админки, Telegram */
export const ENGINEERING_OPTION_LABELS: Record<keyof EngineeringSelection, string> = {
  electric: "Электроснабжение",
  water: "Разводка воды по дому",
  sewage: "Канализация",
  radiators: "Радиаторы",
  warmFloor: "Тёплый пол (1-й этаж)",
  boiler: "Котельная (фикс.)",
  bio: "Станция биоочистки (фикс.)",
};

export const defaultEngineeringSelection = (): EngineeringSelection => ({
  electric: false,
  water: false,
  sewage: false,
  radiators: false,
  warmFloor: false,
  boiler: false,
  bio: false,
});

/** Частичный объект из формы (RHF) → полный набор флагов для расчёта. */
export function normalizeEngineeringSelection(
  partial?: Partial<EngineeringSelection> | null
): EngineeringSelection {
  const defaults = defaultEngineeringSelection();
  if (!partial) return defaults;
  return (Object.keys(defaults) as (keyof EngineeringSelection)[]).reduce(
    (acc, key) => {
      acc[key] = partial[key] === true;
      return acc;
    },
    { ...defaults }
  );
}

function getBaseMatrix(cfg: HouseConstructionCalculatorConfig): BaseRubMatrix {
  return cfg.baseRubPerM2;
}

export function validRoofsForFloor(
  catalogFloor: CatalogFloorId,
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): RoofTypeId[] {
  const keys = getBaseMatrix(cfg)[catalogFloor];
  return (Object.keys(keys) as RoofTypeId[]).filter((r) => keys[r] != null);
}

export function isValidHouseConfiguration(
  catalogFloor: CatalogFloorId,
  roof: RoofTypeId,
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): boolean {
  const row = getBaseMatrix(cfg)[catalogFloor]?.[roof];
  return row != null;
}

export function getBaseRubPerM2(
  catalogFloor: CatalogFloorId,
  roof: RoofTypeId,
  wall: WallMaterialId,
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): number | null {
  const triple = getBaseMatrix(cfg)[catalogFloor]?.[roof];
  if (!triple) return null;
  return triple[materialIndex(wall)] ?? null;
}

export function defaultRoofForFloor(
  catalogFloor: CatalogFloorId,
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): RoofTypeId {
  const v = validRoofsForFloor(catalogFloor, cfg);
  return v[0] ?? "dual";
}

export function facadeAvailable(params: { catalogFloor: CatalogFloorId; roof: RoofTypeId }): boolean {
  if (params.catalogFloor !== "1") return false;
  return params.roof === "dual" || params.roof === "triple";
}

export function getFacadeRubPerM2(
  roof: RoofTypeId,
  finish: Exclude<FacadeFinishId, "none">,
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): number | null {
  if (roof !== "dual" && roof !== "triple") return null;
  return cfg.facadeRubPerM2[roof][finish] ?? null;
}

export interface LineItem {
  id: string;
  label: string;
  amountRub: number;
}

export interface HouseConstructionQuote {
  areaM2: number;
  catalogFloor: CatalogFloorId;
  roof: RoofTypeId;
  wall: WallMaterialId;
  validConfiguration: boolean;
  baseRubPerM2: number | null;
  baseSubtotalRub: number | null;
  smallHouseBaseApplied: boolean;
  smallHouseBaseExtraRub: number;
  baseTotalRub: number | null;
  engineeringLines: LineItem[];
  engineeringSubtotalRub: number;
  smallHouseEngineeringApplied: boolean;
  smallHouseEngineeringExtraRub: number;
  engineeringTotalRub: number;
  facadeLines: LineItem[];
  facadeTotalRub: number;
  grandTotalRub: number | null;
}

function roundRub(n: number): number {
  return Math.round(n);
}

export function computeHouseConstructionQuote(
  params: {
    areaM2: number;
    catalogFloor: CatalogFloorId;
    roof: RoofTypeId;
    wall: WallMaterialId;
    engineering: EngineeringSelection;
    facadeFinish: FacadeFinishId;
  },
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): HouseConstructionQuote {
  const area = Number.isFinite(params.areaM2) && params.areaM2 > 0 ? params.areaM2 : 0;
  const valid = isValidHouseConfiguration(params.catalogFloor, params.roof, cfg);
  const baseRubPerM2 = valid ? getBaseRubPerM2(params.catalogFloor, params.roof, params.wall, cfg) : null;
  const baseSubtotal =
    valid && baseRubPerM2 != null && area > 0 ? roundRub(area * baseRubPerM2) : null;

  const thBase = cfg.smallArea.baseThresholdM2;
  const surBase = cfg.smallArea.baseSurcharge;
  const smallHouseBase = area > 0 && area < thBase && baseSubtotal != null && baseSubtotal > 0;
  const smallHouseBaseExtra =
    smallHouseBase && baseSubtotal != null ? roundRub(baseSubtotal * surBase) : 0;
  const baseTotal =
    baseSubtotal != null ? roundRub(baseSubtotal + smallHouseBaseExtra) : null;

  const engineering = normalizeEngineeringSelection(params.engineering);
  const engTier = engineeringFloorTier(params.catalogFloor);
  const rates = cfg.engineering[engTier === "one" ? "one" : "one_half_or_two"];
  const engLines: LineItem[] = [];

  const addPerM2 = (id: string, label: string, on: boolean, rate: number) => {
    if (!on || area <= 0) return;
    engLines.push({ id, label, amountRub: roundRub(area * rate) });
  };

  if (engineering.electric) addPerM2("eng-el", "Электроснабжение", true, rates.electricPerM2);
  if (engineering.water) addPerM2("eng-water", "Разводка воды по дому", true, rates.waterPerM2);
  if (engineering.sewage) addPerM2("eng-sew", "Канализация", true, rates.sewagePerM2);
  if (engineering.radiators) addPerM2("eng-rad", "Радиаторы", true, rates.radiatorsPerM2);
  if (engineering.warmFloor) addPerM2("eng-warm", "Тёплый пол (1-й этаж)", true, rates.warmFloorFirstPerM2);
  if (engineering.boiler) {
    engLines.push({ id: "eng-boiler", label: "Котельная", amountRub: rates.boilerFixed });
  }
  if (engineering.bio) {
    engLines.push({ id: "eng-bio", label: "Станция биоочистки", amountRub: rates.bioFixed });
  }

  const engSubtotalRaw = engLines.reduce((s, x) => s + x.amountRub, 0);
  const thEng = cfg.smallArea.engineeringThresholdM2;
  const surEng = cfg.smallArea.engineeringSurcharge;
  const smallHouseEng = area > 0 && area < thEng && engSubtotalRaw > 0;
  const engExtra = smallHouseEng ? roundRub(engSubtotalRaw * surEng) : 0;
  const engTotal = roundRub(engSubtotalRaw + engExtra);

  const facadeLines: LineItem[] = [];
  let facadeTotal = 0;
  if (
    params.facadeFinish !== "none" &&
    facadeAvailable({ catalogFloor: params.catalogFloor, roof: params.roof }) &&
    area > 0
  ) {
    const r = params.roof === "dual" || params.roof === "triple" ? params.roof : null;
    if (r) {
      const rate = getFacadeRubPerM2(r, params.facadeFinish as Exclude<FacadeFinishId, "none">, cfg);
      if (rate != null) {
        const amount = roundRub(area * rate);
        facadeLines.push({
          id: "facade",
          label: FACADE_FINISH_LABELS[params.facadeFinish as Exclude<FacadeFinishId, "none">],
          amountRub: amount,
        });
        facadeTotal = amount;
      }
    }
  }

  let grand: number | null = null;
  if (baseTotal != null) {
    grand = baseTotal + engTotal + facadeTotal;
  } else if (engTotal > 0 || facadeTotal > 0) {
    grand = engTotal + facadeTotal;
  }

  return {
    areaM2: area,
    catalogFloor: params.catalogFloor,
    roof: params.roof,
    wall: params.wall,
    validConfiguration: valid,
    baseRubPerM2,
    baseSubtotalRub: baseSubtotal,
    smallHouseBaseApplied: smallHouseBase,
    smallHouseBaseExtraRub: smallHouseBaseExtra,
    baseTotalRub: baseTotal,
    engineeringLines: engLines,
    engineeringSubtotalRub: engSubtotalRaw,
    smallHouseEngineeringApplied: smallHouseEng,
    smallHouseEngineeringExtraRub: engExtra,
    engineeringTotalRub: engTotal,
    facadeLines,
    facadeTotalRub: facadeTotal,
    grandTotalRub: grand != null && grand > 0 ? grand : grand === 0 ? 0 : null,
  };
}

export function minCatalogRubPerM2ByMaterial(
  cfg: HouseConstructionCalculatorConfig = DEFAULT_HOUSE_CONSTRUCTION_CONFIG
): Record<WallMaterialId, number> {
  const mins: Record<WallMaterialId, number> = {
    gas: Infinity,
    ceramic: Infinity,
    brick: Infinity,
  };
  const BASE = getBaseMatrix(cfg);
  (Object.keys(BASE) as CatalogFloorId[]).forEach((cf) => {
    const roofs = BASE[cf];
    (Object.keys(roofs) as RoofTypeId[]).forEach((roof) => {
      const triple = roofs[roof];
      if (!triple) return;
      MATERIAL_ORDER.forEach((mat, i) => {
        mins[mat] = Math.min(mins[mat], triple[i]);
      });
    });
  });
  return mins;
}

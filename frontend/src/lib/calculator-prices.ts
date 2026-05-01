/**
 * Ориентировочный расчёт в модалке: ₽/м² по этапам строительства дома (эконом / стандарт / премиум).
 */

export const CALC_SERVICE_IDS = [
  "projecting",
  "foundation",
  "shell",
  "roofing",
  "engineering",
  "finishing",
] as const;

export type CalcServiceId = (typeof CALC_SERVICE_IDS)[number];

export type WorkMode = "rough" | "finish" | "design";

type Triple = [number, number, number];

type MatRow = { noMat: Triple; withMat: Triple };

/** Черновой этап (строительные работы) */
export const PRICES_ROUGH: Record<CalcServiceId, MatRow> = {
  projecting: { noMat: [1200, 2200, 3800], withMat: [1200, 2200, 3800] },
  foundation: { noMat: [6500, 9500, 14000], withMat: [11000, 16000, 24000] },
  shell: { noMat: [12000, 18000, 26000], withMat: [22000, 32000, 48000] },
  roofing: { noMat: [4500, 7500, 12000], withMat: [8000, 13000, 21000] },
  engineering: { noMat: [3500, 6500, 11000], withMat: [6500, 12000, 20000] },
  finishing: { noMat: [8000, 14000, 24000], withMat: [14000, 26000, 42000] },
};

/** Чистовой этап */
export const PRICES_FINISH: Record<CalcServiceId, MatRow> = {
  projecting: { noMat: [800, 1500, 2500], withMat: [800, 1500, 2500] },
  foundation: { noMat: [800, 1200, 1800], withMat: [1200, 1800, 2600] },
  shell: { noMat: [2500, 4500, 7500], withMat: [4500, 8000, 13000] },
  roofing: { noMat: [1200, 2200, 4000], withMat: [2200, 4000, 7000] },
  engineering: { noMat: [1800, 3500, 6000], withMat: [3200, 6000, 10000] },
  finishing: { noMat: [12000, 22000, 38000], withMat: [22000, 40000, 65000] },
};

/** Проектирование — условные ставки на документацию (материал не учитывается) */
export const PRICES_DESIGN: Record<CalcServiceId, Triple> = {
  projecting: [2500, 4500, 7500],
  foundation: [400, 800, 1400],
  shell: [600, 1200, 2200],
  roofing: [350, 700, 1200],
  engineering: [500, 1000, 1800],
  finishing: [450, 900, 1600],
};

const TIERS = ["econom", "standard", "premium"] as const;

export function tierIndex(tier: string): number {
  const i = TIERS.indexOf(tier as (typeof TIERS)[number]);
  return i >= 0 ? i : 1;
}

/** Коробка многоэтажного дома: лёгкая корректировка на этажи после первого */
export function shellFloorMultiplier(floorCount: number): number {
  const n = Math.max(1, Math.floor(floorCount));
  if (n <= 1) return 1;
  return 0.96 ** (n - 1);
}

export function parseFloorCount(raw: string | undefined): number {
  if (!raw || raw.trim() === "") return 1;
  if (raw.includes("+")) return Math.max(1, parseInt(raw, 10) || 5);
  return Math.max(1, parseInt(raw, 10) || 1);
}

export function computeCalculatorEstimate(params: {
  workMode: WorkMode;
  services: string[];
  tier: string;
  withMaterials: boolean;
  areaRaw: number;
  floorsRaw: string | undefined;
}): { total: number; areaUsed: number; shellMultiplier: number } | null {
  const areaUsed = params.areaRaw > 0 ? Math.max(params.areaRaw, 30) : 0;
  if (areaUsed <= 0 || params.services.length === 0) return null;

  const t = tierIndex(params.tier);
  const floors = parseFloorCount(params.floorsRaw);
  const shellMult = shellFloorMultiplier(floors);

  let sumPerSqm = 0;

  for (const s of params.services) {
    if (!CALC_SERVICE_IDS.includes(s as CalcServiceId)) continue;

    const id = s as CalcServiceId;

    if (params.workMode === "design") {
      sumPerSqm += PRICES_DESIGN[id][t];
      continue;
    }

    const table = params.workMode === "rough" ? PRICES_ROUGH : PRICES_FINISH;
    const row = table[id];
    const triple = params.withMaterials ? row.withMat : row.noMat;
    let rate = triple[t];

    if (id === "shell") {
      rate *= shellMult;
    }

    sumPerSqm += rate;
  }

  return {
    total: Math.round(areaUsed * sumPerSqm),
    areaUsed,
    shellMultiplier: shellMult,
  };
}

/** Нормализация полей перед сохранением калькулятора из админки. */

export type AdminCalculatorSettingsInput = {
  smallAreaThresholdM2: number;
  /** Доля надбавки: 0.15 = 15% */
  smallAreaSurcharge: number;
  blindAreaWidthM: number;
};

export type AdminCalculatorCategoryPatch = {
  id: string;
  facadeCoef: number;
  perimeterCoef: number;
  roofCoef: number;
  insulationCoef: number;
  gutterCoef: number;
  soffitCoef: number;
  overlapCoef: number;
  crossCoef: number;
  shellPrices: { gas: number; ceramic: number; brick: number };
};

export type AdminCalculatorFacadePatch = {
  id: string;
  name: string;
  pricePerM2: number;
};

export type AdminCalculatorOptionPatch = {
  id: string;
  pricePerUnit: number;
  isActive: boolean;
};

export function parsePositiveInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n);
}

export function parsePositiveFloat(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/** Проценты из поля ввода (15) → доля (0.15). */
export function percentInputToFraction(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, percent) / 100;
}

/** Доля (0.15) → проценты для поля (15). */
export function fractionToPercentInput(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  return Math.round(fraction * 1000) / 10;
}

export function normalizeSettingsInput(raw: {
  smallAreaThresholdM2?: unknown;
  smallAreaSurchargePercent?: unknown;
  blindAreaWidthM?: unknown;
}): AdminCalculatorSettingsInput {
  const threshold = parsePositiveInt(raw.smallAreaThresholdM2, 100);
  const surchargePercent = parsePositiveFloat(raw.smallAreaSurchargePercent, 15);
  const blind = parsePositiveFloat(raw.blindAreaWidthM, 0.8);
  return {
    smallAreaThresholdM2: threshold,
    smallAreaSurcharge: percentInputToFraction(surchargePercent),
    blindAreaWidthM: blind,
  };
}

export function applyBulkPricePercent(price: number, percent: number): number {
  if (!Number.isFinite(price) || price < 0) return 0;
  if (!Number.isFinite(percent)) return Math.round(price);
  return Math.max(0, Math.round(price * (1 + percent / 100)));
}

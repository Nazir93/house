import type { CalculatorTransportBand } from "@/lib/project-calculator-types";

/** Зоны по PDF / ТЗ: надбавка за транспорт — доля от базы (коробка + опции). */
export const DEFAULT_TRANSPORT_BANDS: CalculatorTransportBand[] = [
  { id: "unk", label: "Неизвестно (индив. расчёт в смете)", percent: 0 },
  { id: "30", label: "до 30 км", percent: 1.5 },
  { id: "40", label: "до 40 км", percent: 2.25 },
  { id: "50", label: "до 50 км", percent: 3 },
  { id: "100", label: "до 100 км", percent: 6.5 },
];

const PERCENT_BY_ID: Record<string, number> = {
  unk: 0,
  "30": 1.5,
  "40": 2.25,
  "50": 3,
  "100": 6.5,
};

/** Подставляет проценты из пресета, если в JSON админки указан только surcharge: 0. */
export function normalizeTransportBands(
  bands: CalculatorTransportBand[] | undefined,
): CalculatorTransportBand[] {
  if (!bands?.length) return DEFAULT_TRANSPORT_BANDS;
  return bands.map((b) => {
    const fallbackPercent = PERCENT_BY_ID[b.id];
    const percent =
      typeof b.percent === "number" ?
        b.percent
      : fallbackPercent !== undefined ?
        fallbackPercent
      : undefined;
    return {
      ...b,
      percent,
      surcharge: b.surcharge ?? 0,
    };
  });
}

export function transportBandIndex(bands: CalculatorTransportBand[], id: string): number {
  const i = bands.findIndex((b) => b.id === id);
  return i >= 0 ? i : 0;
}

/** База для процента транспорта: коробка + выбранные опции. */
export function computeTransportSurchargeRub(
  baseRub: number,
  band: CalculatorTransportBand | undefined,
): number {
  if (!band || band.id === "unk") return 0;
  const base = Math.max(0, baseRub);
  if (typeof band.percent === "number" && band.percent > 0) {
    return Math.round((base * band.percent) / 100);
  }
  return Math.max(0, band.surcharge ?? 0);
}

export function transportBandPercentLabel(band: CalculatorTransportBand | undefined): string | null {
  if (!band || band.id === "unk") return null;
  if (typeof band.percent === "number" && band.percent > 0) {
    const s = String(band.percent);
    return s.includes(".") ? `${s.replace(/\.?0+$/, "")}%` : `${s}%`;
  }
  return null;
}

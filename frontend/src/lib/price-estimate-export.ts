/** Заглушка: отдельная страница прайса не используется; тип для совместимости со старыми записями в админке. */

export type EstimateLine = {
  id: number;
  sectionTitle: string;
  name: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  lineTotal: number;
};

export type PriceEstimatePayload = {
  lines: EstimateLine[];
  total: number;
  withVat: boolean;
  positionCount: number;
};

export function buildEstimateLines(): EstimateLine[] {
  return [];
}

export function downloadEstimateCsv(): void {}

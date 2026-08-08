/**
 * Этажность типового проекта: допускаем 1 / 1.5 / 2 (шаг 0.5).
 * Раньше в БД был Int — 1.5 обрезалось и «не сохранялось».
 */

export function parseHouseProjectFloors(value: unknown, fallback = 1): number {
  if (value == null || value === "") return fallback;
  const raw = typeof value === "number" ? value : Number(String(value).trim().replace(",", "."));
  if (!Number.isFinite(raw) || raw <= 0) return fallback;
  const snapped = Math.round(raw * 2) / 2;
  return snapped > 0 ? snapped : fallback;
}

export function formatHouseProjectFloorsLabel(floors: number | null | undefined): string {
  if (floors == null || !Number.isFinite(floors) || floors <= 0) return "—";
  if (Math.abs(floors - 1.5) < 0.01) return "1,5";
  if (Number.isInteger(floors)) return String(floors);
  return String(floors).replace(".", ",");
}

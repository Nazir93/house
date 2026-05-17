/** Пресеты материала стен в админке личного кабинета (п. 1 ТЗ). */
export const CLIENT_WALL_MATERIAL_PRESETS = [
  "Газобетон",
  "Керамоблок",
  "Кирпич",
] as const;

export const CLIENT_WALL_MATERIAL_CUSTOM_STORAGE_KEY = "carcas-admin-client-wall-materials-custom";

export function normalizeWallMaterialLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function labelKey(label: string): string {
  return normalizeWallMaterialLabel(label).toLowerCase();
}

export function readCustomWallMaterials(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLIENT_WALL_MATERIAL_CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .map(normalizeWallMaterialLabel)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function persistCustomWallMaterial(label: string): string[] {
  const next = normalizeWallMaterialLabel(label);
  if (!next) return readCustomWallMaterials();
  const presetKeys = new Set(CLIENT_WALL_MATERIAL_PRESETS.map(labelKey));
  if (presetKeys.has(labelKey(next))) return readCustomWallMaterials();

  const existing = readCustomWallMaterials();
  const keys = new Set(existing.map(labelKey));
  if (keys.has(labelKey(next))) return existing;

  const merged = [...existing, next];
  try {
    localStorage.setItem(CLIENT_WALL_MATERIAL_CUSTOM_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore quota / private mode */
  }
  return merged;
}

export type WallMaterialSelectOption = { value: string; label: string };

/** Список для select: пресеты → сохранённые кастомные → текущее значение объекта. */
export function buildWallMaterialSelectOptions(
  currentValue: string,
  customLabels: string[]
): WallMaterialSelectOption[] {
  const seen = new Set<string>();
  const items: WallMaterialSelectOption[] = [];

  const push = (label: string) => {
    const normalized = normalizeWallMaterialLabel(label);
    if (!normalized) return;
    const key = labelKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ value: normalized, label: normalized });
  };

  for (const p of CLIENT_WALL_MATERIAL_PRESETS) push(p);
  for (const c of customLabels) push(c);
  if (currentValue.trim()) push(currentValue);

  return items;
}

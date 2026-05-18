/** PNG-иконки этапов (public/icons/stages). */
export const STAGE_ICON_ASSET_FILES = {
  foundation: "foundation.png",
  walls: "walls.png",
  roof: "roof.png",
  windows: "windows.png",
  engineering: "engineering.png",
  facade: "facade.png",
  interior: "interior.png",
  landscaping: "landscaping.png",
} as const;

export type StageIconAssetKey = keyof typeof STAGE_ICON_ASSET_FILES;

const ICON_KEY_TO_ASSET: Record<string, StageIconAssetKey> = {
  foundation: "foundation",
  walls: "walls",
  roof: "roof",
  windows: "windows",
  engineering: "engineering",
  facade: "facade",
  interior: "interior",
  landscaping: "landscaping",
  finish: "interior",
  house: "facade",
  electric: "engineering",
  water: "engineering",
  "floor-heating": "engineering",
  radiators: "engineering",
  boiler: "engineering",
  septic: "engineering",
  well: "engineering",
  hammer: "engineering",
  driveway: "landscaping",
  "retaining-wall": "landscaping",
  "landscape-plan": "landscaping",
};

export const CLIENT_STAGE_ICON_PICKER_KEYS: StageIconAssetKey[] = [
  "foundation",
  "walls",
  "roof",
  "windows",
  "engineering",
  "facade",
  "interior",
  "landscaping",
];

export const ADMIN_STAGE_ICON_SELECT_OPTIONS: { value: StageIconAssetKey; label: string }[] = [
  { value: "foundation", label: "foundation — Фундамент" },
  { value: "walls", label: "walls — Стены" },
  { value: "roof", label: "roof — Кровля" },
  { value: "windows", label: "windows — Окна" },
  { value: "engineering", label: "engineering — Инж. сети" },
  { value: "facade", label: "facade — Фасад" },
  { value: "interior", label: "interior — Внутр. отделка" },
  { value: "landscaping", label: "landscaping — Благоустройство" },
];

export function resolveStageIconAssetKey(iconKey: string): StageIconAssetKey | null {
  return ICON_KEY_TO_ASSET[iconKey] ?? null;
}

export function stageIconAssetUrl(assetKey: StageIconAssetKey): string {
  return `/icons/stages/${STAGE_ICON_ASSET_FILES[assetKey]}`;
}

export function resolveStageIconAssetUrl(iconKey: string): string | null {
  const assetKey = resolveStageIconAssetKey(iconKey);
  return assetKey ? stageIconAssetUrl(assetKey) : null;
}

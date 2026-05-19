/** Ключи Lucide-иконок для этапов (админка + личный кабинет). */
export const CLIENT_STAGE_ICON_PICKER_KEYS = [
  "foundation",
  "walls",
  "roof",
  "windows",
  "engineering",
  "facade",
  "interior",
  "landscaping",
  "electric",
  "water",
  "ventilation",
  "floor-heating",
  "radiators",
  "boiler",
  "septic",
  "well",
  "driveway",
  "retaining-wall",
  "landscape-plan",
] as const;

export type StageIconPickerKey = (typeof CLIENT_STAGE_ICON_PICKER_KEYS)[number];

const STAGE_ICON_LABELS: Record<StageIconPickerKey, string> = {
  foundation: "Фундамент",
  walls: "Стены",
  roof: "Кровля",
  windows: "Окна",
  engineering: "Инж. сети",
  facade: "Фасад",
  interior: "Внутр. отделка",
  landscaping: "Благоустройство",
  electric: "Электрика",
  water: "Водоснабжение",
  ventilation: "Вентиляция",
  "floor-heating": "Тёплый пол",
  radiators: "Радиаторы",
  boiler: "Котельная",
  septic: "Канализация",
  well: "Скважина",
  driveway: "Подъезд",
  "retaining-wall": "Подпорная стена",
  "landscape-plan": "Ландшафт",
};

export const ADMIN_STAGE_ICON_SELECT_OPTIONS: { value: StageIconPickerKey; label: string }[] =
  CLIENT_STAGE_ICON_PICKER_KEYS.map((value) => ({
    value,
    label: `${value} — ${STAGE_ICON_LABELS[value]}`,
  }));

const PICKER_KEY_SET = new Set<string>(CLIENT_STAGE_ICON_PICKER_KEYS);

/** Старые alias в БД → ключ из пикера. */
const LEGACY_ICON_KEY_ALIASES: Record<string, StageIconPickerKey> = {
  circle: "foundation",
  default: "foundation",
  check: "foundation",
  finish: "interior",
  house: "facade",
  hammer: "engineering",
};

/** Значение для пикера в админке (сохраняем исходный ключ, если он в списке). */
export function resolveStageIconPickerKey(iconKey: string): StageIconPickerKey {
  if (PICKER_KEY_SET.has(iconKey)) return iconKey as StageIconPickerKey;
  const alias = LEGACY_ICON_KEY_ALIASES[iconKey];
  if (alias) return alias;
  return "foundation";
}

import type { StageIconPickerKey } from "@/lib/client-stage-icon-assets";
import { resolveStageIconPickerKey } from "@/lib/client-stage-icon-assets";
import {
  buildDefaultClientProjectStagesPayload,
  ENGINEERING_SUB_STAGES,
  LANDSCAPING_SUB_STAGES,
  STANDARD_TOP_LEVEL_STAGES,
} from "@/lib/client-project-default-stages";
import type { AdminStageRow } from "@/lib/admin-client-stage-rows";

/** Нормализация названия для сопоставления с шаблоном. */
export function normalizeStageTitleKey(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

const TOP_LEVEL_BY_TITLE = new Map(
  STANDARD_TOP_LEVEL_STAGES.map((s) => [normalizeStageTitleKey(s.title), s.iconKey])
);

const SUB_STAGE_BY_TITLE = new Map<string, StageIconPickerKey>([
  ...ENGINEERING_SUB_STAGES.map((s) => [normalizeStageTitleKey(s.title), s.iconKey] as const),
  ...LANDSCAPING_SUB_STAGES.map((s) => [normalizeStageTitleKey(s.title), s.iconKey] as const),
]);

/** Варианты старых названий в БД → иконка стандартного этапа. */
const LEGACY_TITLE_ICON: Array<{ test: (n: string) => boolean; iconKey: StageIconPickerKey }> = [
  { test: (n) => n.includes("стен") && (n.includes("этаж") || n === "стены"), iconKey: "walls" },
  { test: (n) => n.includes("отделка") && n.includes("внутр"), iconKey: "interior" },
  { test: (n) => n.includes("отделка") && n.includes("фасад"), iconKey: "facade" },
  { test: (n) => n.includes("благоустрой"), iconKey: "landscaping" },
  { test: (n) => n.includes("инженер"), iconKey: "engineering" },
  { test: (n) => n.includes("фундамент"), iconKey: "foundation" },
  { test: (n) => n.includes("кровл"), iconKey: "roof" },
  { test: (n) => n === "окна" || n.includes("окон"), iconKey: "windows" },
  { test: (n) => n.includes("электр"), iconKey: "electric" },
  { test: (n) => n.includes("водоснаб"), iconKey: "water" },
  { test: (n) => n.includes("тепл") && n.includes("пол"), iconKey: "floor-heating" },
  { test: (n) => n.includes("радиатор"), iconKey: "radiators" },
  { test: (n) => n.includes("котельн"), iconKey: "boiler" },
  { test: (n) => n.includes("септик"), iconKey: "septic" },
  { test: (n) => n.includes("колод"), iconKey: "well" },
  { test: (n) => n.includes("заезд"), iconKey: "driveway" },
  { test: (n) => n.includes("подпорн"), iconKey: "retaining-wall" },
  { test: (n) => n.includes("планировк") && n.includes("благоустрой"), iconKey: "landscape-plan" },
];

/**
 * Иконка по названию этапа (8 стандартных + типовые подэтапы).
 * Для произвольных новых этапов — null (выбор вручную позже).
 */
export function resolveDefaultIconKeyForStageTitle(title: string): StageIconPickerKey | null {
  const key = normalizeStageTitleKey(title);
  if (!key) return null;

  const exactTop = TOP_LEVEL_BY_TITLE.get(key);
  if (exactTop) return exactTop;

  const exactSub = SUB_STAGE_BY_TITLE.get(key);
  if (exactSub) return exactSub;

  for (const { test, iconKey } of LEGACY_TITLE_ICON) {
    if (test(key)) return iconKey;
  }

  return null;
}

/** Иконка при сохранении: сначала по названию, иначе из поля iconKey (с legacy). */
export function resolveStageIconKeyForPersist(title: string, iconKey: string): StageIconPickerKey {
  return resolveDefaultIconKeyForStageTitle(title) ?? resolveStageIconPickerKey(iconKey);
}

/** Иконка в личном кабинете: те же правила, что при сохранении (название + legacy iconKey). */
export const resolveStageIconKeyForDisplay = resolveStageIconKeyForPersist;

export function isStandardStageTitle(title: string): boolean {
  return resolveDefaultIconKeyForStageTitle(title) !== null;
}

/** Строки этапов для админ-редактора (типовой набор). */
export function buildDefaultAdminStageRows(): AdminStageRow[] {
  return buildDefaultClientProjectStagesPayload().map((s) => ({
    clientKey: String(s.clientKey),
    parentClientKey: s.parentClientKey ? String(s.parentClientKey) : null,
    order: typeof s.order === "number" ? s.order : 0,
    title: String(s.title),
    iconKey: resolveStageIconKeyForPersist(String(s.title), String(s.iconKey ?? "circle")),
    status: String(s.status ?? "NOT_STARTED"),
  }));
}

/** Следующий типовой верхнеуровневый этап при добавлении по кнопке «Этап». */
export function standardTopLevelStageTemplate(order: number): Pick<AdminStageRow, "title" | "iconKey" | "order"> | null {
  const stage = STANDARD_TOP_LEVEL_STAGES.find((s) => s.order === order);
  if (!stage) return null;
  return { title: stage.title, iconKey: stage.iconKey, order: stage.order };
}

/** Иконка и название для нового подэтапа инженерии / благоустройства. */
export function standardSubStageTemplate(
  parentIconKey: string,
  subOrder: number
): Pick<AdminStageRow, "title" | "iconKey" | "order"> | null {
  if (parentIconKey === "engineering") {
    const sub = ENGINEERING_SUB_STAGES[subOrder];
    if (!sub) return { title: "", iconKey: "engineering", order: subOrder };
    return { title: sub.title, iconKey: sub.iconKey, order: sub.order };
  }
  if (parentIconKey === "landscaping") {
    const sub = LANDSCAPING_SUB_STAGES[subOrder];
    if (!sub) return { title: "", iconKey: "landscaping", order: subOrder };
    return { title: sub.title, iconKey: sub.iconKey, order: sub.order };
  }
  return { title: "", iconKey: parentIconKey, order: subOrder };
}

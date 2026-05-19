import type { AdminStagePayload } from "@/lib/client-project-stages-persist";
import type { StageIconPickerKey } from "@/lib/client-stage-icon-assets";

/** 8 стандартных верхнеуровневых этапов (п. ТЗ) — заголовок и иконка закреплены. */
export const STANDARD_TOP_LEVEL_STAGES = [
  { clientKey: "stage-foundation", order: 0, title: "Фундамент", iconKey: "foundation" },
  { clientKey: "stage-walls", order: 1, title: "Стены", iconKey: "walls" },
  { clientKey: "stage-roof", order: 2, title: "Кровля", iconKey: "roof" },
  { clientKey: "stage-windows", order: 3, title: "Окна", iconKey: "windows" },
  { clientKey: "stage-engineering", order: 4, title: "Инженерные сети", iconKey: "engineering" },
  { clientKey: "stage-facade", order: 5, title: "Отделка фасада", iconKey: "facade" },
  { clientKey: "stage-interior", order: 6, title: "Внутренняя отделка", iconKey: "interior" },
  {
    clientKey: "stage-landscaping",
    order: 7,
    title: "Благоустройство участка и въездная группа",
    iconKey: "landscaping",
  },
] as const satisfies ReadonlyArray<{
  clientKey: string;
  order: number;
  title: string;
  iconKey: StageIconPickerKey;
}>;

export const ENGINEERING_SUB_STAGES: ReadonlyArray<{
  order: number;
  title: string;
  iconKey: StageIconPickerKey;
}> = [
  { order: 0, title: "Электроснабжение", iconKey: "electric" },
  { order: 1, title: "Водоснабжение", iconKey: "water" },
  { order: 2, title: "Тёплый пол", iconKey: "floor-heating" },
  { order: 3, title: "Радиаторы", iconKey: "radiators" },
  { order: 4, title: "Котельная", iconKey: "boiler" },
  { order: 5, title: "Септик", iconKey: "septic" },
  { order: 6, title: "Колодец", iconKey: "well" },
];

export const LANDSCAPING_SUB_STAGES: ReadonlyArray<{
  order: number;
  title: string;
  iconKey: StageIconPickerKey;
}> = [
  { order: 0, title: "Устройство заезда на участок", iconKey: "driveway" },
  { order: 1, title: "Устройство подпорной стены", iconKey: "retaining-wall" },
  { order: 2, title: "Планировка и благоустройство территории", iconKey: "landscape-plan" },
];

/**
 * Типовые этапы нового объекта ЛК (п. 5 ТЗ).
 * 8 основных этапов; у «Инженерные сети» и «Благоустройство» — подэтапы.
 */
export function buildDefaultClientProjectStagesPayload(): AdminStagePayload[] {
  const rows: AdminStagePayload[] = [];

  for (const stage of STANDARD_TOP_LEVEL_STAGES) {
    rows.push({
      clientKey: stage.clientKey,
      parentClientKey: null,
      order: stage.order,
      title: stage.title,
      iconKey: stage.iconKey,
      status: "NOT_STARTED",
    });
  }

  for (const sub of ENGINEERING_SUB_STAGES) {
    rows.push({
      clientKey: `stage-engineering-sub-${sub.order}`,
      parentClientKey: "stage-engineering",
      order: sub.order,
      title: sub.title,
      iconKey: sub.iconKey,
      status: "NOT_STARTED",
    });
  }

  for (const sub of LANDSCAPING_SUB_STAGES) {
    rows.push({
      clientKey: `stage-landscaping-sub-${sub.order}`,
      parentClientKey: "stage-landscaping",
      order: sub.order,
      title: sub.title,
      iconKey: sub.iconKey,
      status: "NOT_STARTED",
    });
  }

  return rows;
}

export const DEFAULT_CLIENT_PROJECT_TOP_LEVEL_COUNT = STANDARD_TOP_LEVEL_STAGES.length;

export const DEFAULT_CLIENT_PROJECT_STAGE_COUNT = buildDefaultClientProjectStagesPayload().length;

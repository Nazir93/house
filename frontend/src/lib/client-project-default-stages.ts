import type { AdminStagePayload } from "@/lib/client-project-stages-persist";

/**
 * Типовые этапы нового объекта ЛК (п. 5 ТЗ).
 * 8 основных этапов; у «Инженерные сети» и «Благоустройство» — подэтапы.
 */
export function buildDefaultClientProjectStagesPayload(): AdminStagePayload[] {
  const rows: AdminStagePayload[] = [];

  const top = (clientKey: string, order: number, title: string, iconKey: string) => {
    rows.push({
      clientKey,
      parentClientKey: null,
      order,
      title,
      iconKey,
      status: "NOT_STARTED",
    });
  };

  const sub = (parentClientKey: string, order: number, title: string, iconKey: string) => {
    rows.push({
      clientKey: `${parentClientKey}-sub-${order}`,
      parentClientKey,
      order,
      title,
      iconKey,
      status: "NOT_STARTED",
    });
  };

  top("stage-foundation", 0, "Фундамент", "foundation");
  top("stage-walls", 1, "Стены 1–2-й этажи", "walls");
  top("stage-roof", 2, "Кровля", "roof");
  top("stage-windows", 3, "Окна", "windows");

  top("stage-engineering", 4, "Инженерные сети", "engineering");
  sub("stage-engineering", 0, "Электроснабжение", "electric");
  sub("stage-engineering", 1, "Водоснабжение", "water");
  sub("stage-engineering", 2, "Тёплый пол", "floor-heating");
  sub("stage-engineering", 3, "Радиаторы", "radiators");
  sub("stage-engineering", 4, "Котельная", "boiler");
  sub("stage-engineering", 5, "Септик", "septic");
  sub("stage-engineering", 6, "Колодец", "well");

  top("stage-facade", 5, "Отделка фасада", "facade");
  top("stage-interior", 6, "Отделка внутренняя", "interior");
  top("stage-landscaping", 7, "Благоустройство участка и въездная группа", "landscaping");
  sub("stage-landscaping", 0, "Устройство заезда на участок", "driveway");
  sub("stage-landscaping", 1, "Устройство подпорной стены", "retaining-wall");
  sub("stage-landscaping", 2, "Планировка и благоустройство территории", "landscape-plan");

  return rows;
}

export const DEFAULT_CLIENT_PROJECT_TOP_LEVEL_COUNT = 8;

export const DEFAULT_CLIENT_PROJECT_STAGE_COUNT = buildDefaultClientProjectStagesPayload().length;

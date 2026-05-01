/**
 * Ориентировочный расчёт стоимости проектирования (АР).
 * Коэффициенты можно вынести в админку позже; сейчас — константы под типовую политику.
 */

export const DESIGN_MAIN_DOCUMENTATION_ITEMS = [
  "Привязка объекта к участку (арендный / полученный)",
  "План фундамента, разрезы и узлы",
  "Архитектурные планы этажей, фасады, разрезы",
  "Спецификация основных материалов и объёмов",
  "Ведомость окон и дверей",
] as const;

export type DesignProjectExtras = {
  model3d: boolean;
  constructive: boolean;
  audit: boolean;
};

const AREA_MIN = 40;
const AREA_MAX = 600;

/** Основная документация: ₽/м² (на 100 м² ≈ 140 000 ₽ по ТЗ-примеру) */
const MAIN_PER_M2 = 1400;

/** Дополнительные услуги */
const EXTRA_3D_PER_M2 = 450;
const EXTRA_CONSTRUCT_PER_M2 = 900;
const EXTRA_AUDIT_FIXED = 45_000;

export function clampDesignArea(raw: number): number {
  if (!Number.isFinite(raw) || raw < AREA_MIN) return AREA_MIN;
  if (raw > AREA_MAX) return AREA_MAX;
  return Math.round(raw);
}

export function calculateDesignProjectQuote(areaInput: number, extras: DesignProjectExtras) {
  const area = clampDesignArea(areaInput);
  const mainDocumentation = Math.round(area * MAIN_PER_M2);

  const additional3d = extras.model3d ? Math.round(area * EXTRA_3D_PER_M2) : 0;
  const additionalConstructive = extras.constructive ? Math.round(area * EXTRA_CONSTRUCT_PER_M2) : 0;
  const additionalAudit = extras.audit ? EXTRA_AUDIT_FIXED : 0;
  const additionalDocumentation = additional3d + additionalConstructive + additionalAudit;

  const total = mainDocumentation + additionalDocumentation;

  return {
    area,
    mainDocumentation,
    additionalDocumentation,
    breakdown: {
      model3d: additional3d,
      constructive: additionalConstructive,
      audit: additionalAudit,
    },
    total,
  };
}

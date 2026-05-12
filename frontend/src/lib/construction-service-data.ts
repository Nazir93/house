/**
 * Внутренние ключи услуг (Lead.source: service-{key}, service-consult-{key}).
 * Совпадают с id в `SERVICES` в constants, кроме коробки — там id `shell`.
 */
export const CONSTRUCTION_SERVICE_SLUGS = [
  "projecting",
  "foundation",
  "shell",
  "roofing",
  "engineering",
  "finishing",
] as const;

export type ConstructionServiceSlug = (typeof CONSTRUCTION_SERVICE_SLUGS)[number];

/** Короткие подписи для админки и getLeadSourceLabel. */
export const CONSTRUCTION_SERVICES: Record<ConstructionServiceSlug, { title: string }> = {
  projecting: { title: "Проектирование" },
  foundation: { title: "Фундамент под ключ" },
  shell: { title: "Коробка дома" },
  roofing: { title: "Монтаж кровли" },
  engineering: { title: "Инженерные сети" },
  finishing: { title: "Отделка под ключ" },
};

/**
 * Типы услуг для загородного строительства (Prisma ServiceType) — основной список в админке и в селекте проекта.
 */
export const SERVICE_TYPE_ADMIN_OPTIONS: { value: string; label: string }[] = [
  { value: "HOUSE_DESIGN", label: "Проектирование" },
  { value: "HOUSE_FOUNDATION", label: "Фундамент и основание" },
  { value: "HOUSE_STRUCTURE", label: "Коробка: стены и перекрытия" },
  { value: "HOUSE_ROOFING", label: "Кровля" },
  { value: "HOUSE_ENGINEERING", label: "Инженерные сети" },
  { value: "HOUSE_FINISHING", label: "Отделка под ключ" },
];

/**
 * Устаревшие типы с прошлого шаблона сайта — остаются в БД; в селектах ниже основного списка.
 */
export const LEGACY_SERVICE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "ELECTRICAL", label: "Электрика" },
  { value: "ACOUSTICS", label: "Акустика" },
  { value: "STRUCTURED_CABLING", label: "СКС" },
  { value: "SMART_HOME", label: "Умный дом" },
  { value: "SECURITY", label: "Безопасность" },
  { value: "ARCHITECTURAL_LIGHTING", label: "Архитектурная подсветка" },
];

/** Селект «Тип» в CMS услугах, FAQ, отзывах: сначала актуальные, затем архив для совместимости */
export const FULL_SERVICE_TYPE_DROPDOWN_OPTIONS: { value: string; label: string }[] = [
  ...SERVICE_TYPE_ADMIN_OPTIONS,
  ...LEGACY_SERVICE_TYPE_OPTIONS,
];

const labelByValue: Record<string, string> = Object.fromEntries(
  FULL_SERVICE_TYPE_DROPDOWN_OPTIONS.map((o) => [o.value, o.label])
);

/** Подпись по значению ServiceType (в т.ч. устаревшие enum) */
export const SERVICE_TYPE_LABEL_BY_VALUE: Record<string, string> = labelByValue;

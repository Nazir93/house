/**
 * Источники заявок (поле Lead.source при POST /api/leads).
 * Используется в админке: фильтры, подписи, подменю.
 */
export const LEAD_SOURCE_OPTIONS: { value: string; label: string; hint?: string }[] = [
  { value: "banner-hero", label: "Баннер: консультация", hint: "Главный экран, форма телефона" },
  { value: "house-project", label: "Проект дома", hint: "Заявка из карточки типового проекта" },
  { value: "individual-design", label: "Индивидуальное проектирование", hint: "/individual-design, расчет стоимости проекта" },
  { value: "house-project-design", label: "Калькулятор проекта (карточка дома)", hint: "Блок справа от планировок на /projects/[slug]" },
  { value: "mortgage", label: "Ипотека", hint: "/mortgage или ипотечный блок проекта" },
  { value: "portfolio-tour", label: "Экскурсия по объекту", hint: "Портфолио построенных домов" },
  { value: "compare", label: "Сравнение проектов", hint: "/projects/compare" },
  { value: "service-projecting", label: "Услуга: проектирование" },
  { value: "service-foundation", label: "Услуга: фундамент" },
  { value: "service-roofing", label: "Услуга: кровля" },
  { value: "service-engineering", label: "Услуга: инженерные сети" },
  { value: "service-finishing", label: "Услуга: отделка" },
  { value: "price-smeta", label: "Смета с калькулятора прайса (архив)", hint: "Легаси; страница /price удалена" },
  { value: "calculator", label: "Ориентировочный расчёт", hint: "Модалка: калькулятор стоимости" },
  { value: "offer-page", label: "Оффер (архив, редирект)", hint: "Раньше /offer; редирект на контакты" },
  { value: "offer-pizza", label: "Оффер: бонус после таймера (архив)", hint: "Легаси-заявки" },
  { value: "calculator-pizza", label: "Расчёт: пицца / комментарий", hint: "Бонус после ориентировочного расчёта" },
  { value: "partner-partner", label: "Партнёры: подряд", hint: "/partners/partner" },
  { value: "partner-supplier", label: "Партнёры: поставщик", hint: "/partners/supplier" },
];

const LEGACY_SOURCE_LABELS: Record<string, string> = {
  "inspection-request": "Выезд инженера (старое)",
  "project-form": "Описание проекта (старое)",
};

export function getLeadSourceLabel(source: string | null | undefined): string {
  if (source == null || source === "") {
    return "Не указан";
  }
  if (source === "unknown") {
    return "Не указан (unknown)";
  }
  const found = LEAD_SOURCE_OPTIONS.find((o) => o.value === source);
  if (found) return found.label;
  return LEGACY_SOURCE_LABELS[source] ?? source;
}

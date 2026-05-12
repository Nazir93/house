/**
 * Источники заявок (поле Lead.source при POST /api/leads).
 * Список LEAD_SOURCE_OPTIONS — только актуальные формы на сайте (фильтры в админке).
 * Устаревшие значения в БД подписываются в getLeadSourceLabel.
 */
import {
  CONSTRUCTION_SERVICES,
  CONSTRUCTION_SERVICE_SLUGS,
  type ConstructionServiceSlug,
} from "@/lib/construction-service-data";
import { servicePagePathForInternalKey } from "@/lib/service-slug-routes";

function serviceLeadOptions(): { value: string; label: string; hint?: string }[] {
  return CONSTRUCTION_SERVICE_SLUGS.flatMap((slug) => {
    const title = CONSTRUCTION_SERVICES[slug].title;
    const path = servicePagePathForInternalKey(slug);
    return [
      { value: `service-${slug}`, label: `Услуга: ${title}`, hint: path },
      {
        value: `service-consult-${slug}`,
        label: `Консультация: ${title}`,
        hint: `Блок консультации на ${path}`,
      },
    ];
  });
}

export const LEAD_SOURCE_OPTIONS: { value: string; label: string; hint?: string }[] = [
  { value: "promo-qr-banner", label: "Промо: QR с баннера", hint: "Страница /promo только по QR, не в меню сайта" },
  { value: "calculator", label: "Ориентировочный расчёт", hint: "Модалка и страница калькулятора" },
  { value: "individual-design", label: "Индивидуальное проектирование", hint: "/individual-design" },
  { value: "house-project-design", label: "Проект (карточка дома)", hint: "Калькулятор на странице типового проекта" },
  { value: "mortgage", label: "Ипотека", hint: "/mortgage и блок без привязки к проекту" },
  { value: "house-project-mortgage", label: "Ипотека в карточке проекта", hint: "Страница /projects/[slug]" },
  ...serviceLeadOptions(),
  { value: "partner-partner", label: "Партнёрам: подряд", hint: "/partners/partner" },
  { value: "partner-supplier", label: "Партнёрам: поставщик", hint: "/partners/supplier" },
  { value: "about-leadership-feedback", label: "Связь с руководством", hint: "Раздел «О компании»" },
];

const ARCHIVE_SOURCE_LABELS: Record<string, string> = {
  "banner-hero": "Баннер: консультация (архив)",
  "house-project": "Проект дома (архив)",
  "portfolio-tour": "Экскурсия по объекту (архив)",
  compare: "Сравнение проектов (архив)",
  "price-smeta": "Смета с калькулятора прайса (архив)",
  "offer-page": "Оффер (архив)",
  "offer-pizza": "Оффер: бонус (архив)",
  "calculator-pizza": "Расчёт: бонус / комментарий (архив)",
};

const LEGACY_SOURCE_LABELS: Record<string, string> = {
  "inspection-request": "Выезд инженера (старое)",
  "project-form": "Описание проекта (старое)",
};

function labelFromConstructionServiceSource(source: string): string | null {
  const consult = /^service-consult-(.+)$/.exec(source);
  const plain = /^service-(.+)$/.exec(source);
  const slugRaw = consult?.[1] ?? plain?.[1];
  if (!slugRaw) return null;
  if (!(slugRaw in CONSTRUCTION_SERVICES)) return null;
  const slug = slugRaw as ConstructionServiceSlug;
  const title = CONSTRUCTION_SERVICES[slug].title;
  return consult ? `Консультация: ${title}` : `Услуга: ${title}`;
}

export function getLeadSourceLabel(source: string | null | undefined): string {
  if (source == null || source === "") {
    return "Не указан";
  }
  if (source === "unknown") {
    return "Не указан (unknown)";
  }
  const found = LEAD_SOURCE_OPTIONS.find((o) => o.value === source);
  if (found) return found.label;
  const fromService = labelFromConstructionServiceSource(source);
  if (fromService) return fromService;
  return (
    ARCHIVE_SOURCE_LABELS[source] ??
    LEGACY_SOURCE_LABELS[source] ??
    source
  );
}

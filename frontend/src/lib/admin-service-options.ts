import { SERVICE_TYPE_ADMIN_OPTIONS, SERVICE_TYPE_LABEL_BY_VALUE } from "@/lib/service-type-admin-options";

/** Опции поля «Услуга» у проекта (Prisma ServiceType). Совпадают с типом в CMS «Услуги». */
export const ADMIN_PROJECT_SERVICE_OPTIONS = SERVICE_TYPE_ADMIN_OPTIONS;

/** Все известные подписи ServiceType (включая устаревшие enum для старых записей). */
export const SERVICE_TYPE_LABELS_FALLBACK: Record<string, string> = { ...SERVICE_TYPE_LABEL_BY_VALUE };

/** Строка из GET /api/admin/services для селекта «Услуга» у проекта */
export type CmsServiceForProjectSelect = {
  title: string;
  serviceType: string;
  published: boolean;
  order: number;
};

/**
 * Селект «Услуга» в кейсе: названия как на сайте (/services), значение — Prisma ServiceType.
 * Несколько страниц услуг с одним serviceType → одна опция (первое по order среди опубликованных).
 */
export function projectServiceSelectOptionsFromCms(
  services: CmsServiceForProjectSelect[]
): { value: string; label: string }[] {
  if (!Array.isArray(services) || services.length === 0) return [];
  const sorted = [...services].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "ru"));
  const published = sorted.filter((s) => s.published);
  const src = published.length > 0 ? published : sorted;
  const byType = new Map<string, string>();
  for (const s of src) {
    const t = (s.serviceType || "").trim();
    if (!t) continue;
    const title = (s.title || "").trim();
    if (!byType.has(t)) byType.set(t, title || t);
  }
  return Array.from(byType.entries()).map(([value, label]) => ({ value, label }));
}

/** Текущее значение проекта всегда остаётся в списке, даже если такого типа нет среди опубликованных услуг CMS */
export function mergeProjectServiceOptionsForForm(
  cmsOptions: { value: string; label: string }[],
  currentService: string
): { value: string; label: string }[] {
  const cur = (currentService || "").trim();
  const base = cmsOptions.length > 0 ? cmsOptions : ADMIN_PROJECT_SERVICE_OPTIONS;
  if (!cur || base.some((o) => o.value === cur)) return base;
  const label = SERVICE_TYPE_LABEL_BY_VALUE[cur];
  const extra = label ? { value: cur, label } : { value: cur, label: cur };
  return [extra, ...base.filter((o) => o.value !== cur)];
}

/** Подписи serviceType для таблиц админки: приоритет заголовков из CMS, иначе fallback */
export function serviceTypeLabelsWithCms(
  services: CmsServiceForProjectSelect[] | null | undefined
): Record<string, string> {
  const out = { ...SERVICE_TYPE_LABELS_FALLBACK };
  if (!services?.length) return out;
  for (const o of projectServiceSelectOptionsFromCms(services)) {
    out[o.value] = o.label;
  }
  return out;
}

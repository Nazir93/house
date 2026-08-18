import type { CompanyRequisites } from "@/lib/contact-config";

/** Поля с длинными «номерами» — можно рвать по символам. */
const REQUISITE_MONO_LABELS = new Set([
  "ИНН",
  "ОГРН",
  "ОГРНИП",
  "Расчётный счёт",
  "Корр. счёт",
  "БИК",
  "Ссылка",
]);

/** Текстовые поля шире одной колонки — меньше уродливых переносов. */
const REQUISITE_WIDE_LABELS = new Set(["Полное наименование", "Юридический адрес", "Банк"]);

export function isCompanyRequisiteMonoField(label: string): boolean {
  return REQUISITE_MONO_LABELS.has(label);
}

export function isCompanyRequisiteWideField(label: string): boolean {
  return REQUISITE_WIDE_LABELS.has(label);
}

/**
 * Не рвёт бренд посередине: «Часть Души» / Часть Души остаются на одной строке.
 * Пробелы внутри ёлочек и известного бренда → неразрывные.
 */
export function keepBrandNameTogether(text: string): string {
  return text
    .replace(/«([^»]+)»/g, (_m, inner: string) => `«${String(inner).replace(/ +/g, "\u00A0")}»`)
    .replace(/Часть Души/g, "Часть\u00A0Души");
}

/** Нормализация URL для отображения/ссылки в реквизитах. */
export function normalizeCompanyWebsiteUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[\w.-]+(\/.*)?$/i.test(value)) return `https://${value}`;
  return null;
}

/** Подпись регистрационного номера: ОГРН (юрлицо) и/или ОГРНИП. */
export function companyRegistrationLabels(co: Pick<CompanyRequisites, "ogrn" | "ogrnip">): Array<{
  label: string;
  value: string;
}> {
  const rows: Array<{ label: string; value: string }> = [];
  if (co.ogrn.trim()) rows.push({ label: "ОГРН", value: co.ogrn.trim() });
  if (co.ogrnip.trim()) rows.push({ label: "ОГРНИП", value: co.ogrnip.trim() });
  return rows;
}

/** Фрагмент для юридических текстов: «, ОГРН …» / «, ОГРНИП …». */
export function companyRegistrationLegalSuffix(co: Pick<CompanyRequisites, "ogrn" | "ogrnip">): string {
  const parts: string[] = [];
  if (co.ogrn.trim()) parts.push(`ОГРН ${co.ogrn.trim()}`);
  if (co.ogrnip.trim()) parts.push(`ОГРНИП ${co.ogrnip.trim()}`);
  return parts.length ? `, ${parts.join(", ")}` : "";
}

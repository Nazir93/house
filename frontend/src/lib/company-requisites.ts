import type { CompanyRequisites } from "@/lib/contact-config";

/** ОГРН юрлица — 13 цифр; ОГРНИП — 15. */
const COMPANY_OGRN_DIGIT_LEN = 13;
const COMPANY_OGRNIP_DIGIT_LEN = 15;

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
    .replace(/Часть\s+души/gi, (match) => match.replace(/\s+/, "\u00A0"));
}

/** Нормализация URL для отображения/ссылки в реквизитах. */
export function normalizeCompanyWebsiteUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[\w.-]+(\/.*)?$/i.test(value)) return `https://${value}`;
  return null;
}

/**
 * Раскладывает ОГРН/ОГРНИП по полям.
 * До появления `company_ogrn` номер ООО часто сохраняли в `company_ogrnip`.
 */
export function normalizeCompanyRegistration(
  co: Pick<CompanyRequisites, "ogrn" | "ogrnip">,
): Pick<CompanyRequisites, "ogrn" | "ogrnip"> {
  const rawOgrn = co.ogrn.trim();
  const rawOgrnip = co.ogrnip.trim();
  const digitsOgrn = rawOgrn.replace(/\D/g, "");
  const digitsOgrnip = rawOgrnip.replace(/\D/g, "");

  if (!digitsOgrn && digitsOgrnip.length === COMPANY_OGRN_DIGIT_LEN) {
    return { ogrn: digitsOgrnip, ogrnip: "" };
  }
  if (!digitsOgrnip && digitsOgrn.length === COMPANY_OGRNIP_DIGIT_LEN) {
    return { ogrn: "", ogrnip: digitsOgrn };
  }

  return { ogrn: rawOgrn, ogrnip: rawOgrnip };
}

/** Подпись регистрационного номера: ОГРН (юрлицо) и/или ОГРНИП. */
export function companyRegistrationLabels(co: Pick<CompanyRequisites, "ogrn" | "ogrnip">): Array<{
  label: string;
  value: string;
}> {
  const normalized = normalizeCompanyRegistration(co);
  const rows: Array<{ label: string; value: string }> = [];
  if (normalized.ogrn) rows.push({ label: "ОГРН", value: normalized.ogrn });
  if (normalized.ogrnip) rows.push({ label: "ОГРНИП", value: normalized.ogrnip });
  return rows;
}

/** Фрагмент для юридических текстов: «, ОГРН …» / «, ОГРНИП …». */
export function companyRegistrationLegalSuffix(co: Pick<CompanyRequisites, "ogrn" | "ogrnip">): string {
  const normalized = normalizeCompanyRegistration(co);
  const parts: string[] = [];
  if (normalized.ogrn) parts.push(`ОГРН ${normalized.ogrn}`);
  if (normalized.ogrnip) parts.push(`ОГРНИП ${normalized.ogrnip}`);
  return parts.length ? `, ${parts.join(", ")}` : "";
}

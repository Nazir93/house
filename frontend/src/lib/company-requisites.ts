import type { CompanyRequisites } from "@/lib/contact-config";

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

/** Разбор отклика на вакансию из лида (source=partner-vacancy). */

export type VacancyResponseLeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  createdAt: string;
  calcData: unknown;
};

export function vacancyResponsePosition(lead: {
  service: string | null;
  calcData: unknown;
}): string {
  if (lead.calcData && typeof lead.calcData === "object") {
    const pos = (lead.calcData as { position?: unknown }).position;
    if (typeof pos === "string" && pos.trim()) return pos.trim();
  }
  if (typeof lead.service === "string" && lead.service.trim()) return lead.service.trim();
  return "Вакансия";
}

export function vacancyResponseResume(calcData: unknown): string | null {
  if (!calcData || typeof calcData !== "object") return null;
  const resume = (calcData as { resume?: unknown }).resume;
  return typeof resume === "string" && resume.trim() ? resume.trim() : null;
}

export function vacancyResponseMessage(calcData: unknown): string | null {
  if (!calcData || typeof calcData !== "object") return null;
  const message = (calcData as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message.trim() : null;
}

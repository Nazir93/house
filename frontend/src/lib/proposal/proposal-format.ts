/** Число для КП в стиле Braun: пробелы как разделитель тысяч, без символа ₽. */
export function formatProposalAmount(price: number, withRubSuffix = true): string {
  const formatted = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(price));
  return withRubSuffix ? `${formatted} руб.` : formatted;
}

export function formatProposalPrintDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

export function formatAuthorProjectTitle(projectTitle: string): string {
  const trimmed = projectTitle.trim();
  if (!trimmed) return "АВТОРСКИЙ ПРОЕКТ";
  const upper = trimmed.toLocaleUpperCase("ru-RU");
  return `АВТОРСКИЙ ПРОЕКТ «${upper}»`;
}

export function proposalSiteHost(siteUrl: string): string {
  return siteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

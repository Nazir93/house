import type { AdvertisingLandingConfig } from "@/lib/advertising-landing";

/** Метка услуги для модалки контактов на рекламном LP. */
export function lpServiceLabel(config: AdvertisingLandingConfig): string | undefined {
  return config.quizDefaults?.serviceLabel;
}

/**
 * Заявка с карточки проекта: в service видно и лендинг, и конкретный проект
 * (менеджер понимает «Пейнит» / «Тиллит»).
 */
export function lpProjectCardLeadMeta(
  config: AdvertisingLandingConfig,
  project: { slug: string; title: string },
): {
  source: string;
  service: string;
  calcData: { lpSlug: string; projectSlug: string; projectTitle: string };
} {
  const base = lpServiceLabel(config)?.trim() || `Лендинг ${config.slug}`;
  const title = project.title.trim() || project.slug;
  const slug = project.slug.trim() || "project";
  return {
    source: `lp-${config.slug}-project-${slug}`,
    service: `${base} · проект ${title}`,
    calcData: {
      lpSlug: config.slug,
      projectSlug: slug,
      projectTitle: title,
    },
  };
}

/** Есть ли в payload детальный расчёт калькулятора (не просто контакты с LP). */
export function estimatePayloadHasDetailedCalc(calcData: unknown): boolean {
  if (!calcData || typeof calcData !== "object") return false;
  const data = calcData as Record<string, unknown>;
  if (Array.isArray(data.projects) && data.projects.length > 0) return true;
  if (typeof data.grandTotalRub === "number") return true;
  if (typeof data.totalRub === "number") return true;
  if (data.tiers || data.engineering || data.materials) return true;
  // Только метка проекта с LP — не «детальная смета»
  if (data.projectSlug || data.projectTitle) return false;
  return Object.keys(data).length > 0;
}

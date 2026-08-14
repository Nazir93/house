/**
 * Заявка с hero карточки проекта («Получить смету»):
 * окно имя + телефон → лид, без открытия калькулятора.
 */

export type ProjectPageEstimateLeadMeta = {
  source: "project-page-estimate";
  service: string;
  calcData: {
    projectSlug: string;
    projectTitle: string;
    materialLabel?: string;
    priceRub?: number;
  };
};

export function projectPageEstimateLeadMeta(input: {
  slug: string;
  title: string;
  materialLabel?: string | null;
  priceRub?: number | null;
}): ProjectPageEstimateLeadMeta {
  const title = input.title.trim() || input.slug.trim() || "проект";
  const slug = input.slug.trim() || "project";
  const materialLabel = input.materialLabel?.trim() || undefined;
  const priceRub =
    typeof input.priceRub === "number" && Number.isFinite(input.priceRub) && input.priceRub > 0
      ? Math.round(input.priceRub)
      : undefined;

  return {
    source: "project-page-estimate",
    service: `Смета · проект ${title}`,
    calcData: {
      projectSlug: slug,
      projectTitle: title,
      ...(materialLabel ? { materialLabel } : {}),
      ...(priceRub != null ? { priceRub } : {}),
    },
  };
}

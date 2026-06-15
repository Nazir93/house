import type { HouseProjectItem } from "@/lib/construction-data";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";
import type { PartOfSoulPricingFloors, PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";
import { partOfSoulRoofLabels } from "@/lib/part-of-soul-pricing";
import type { ProjectCalculatorQuoteResponse } from "@/lib/use-project-calculator-quote";

export function buildProjectCalculatorLeadPayload(params: {
  project: HouseProjectItem;
  tierId: string;
  tierLabel: string;
  categoryId: HouseCalculatorCategoryId;
  quote: ProjectCalculatorQuoteResponse["quote"];
  facadeSlug: string | null;
  engineeringSlugs: string[];
  constructionSlugs: string[];
  pricingFloors: PartOfSoulPricingFloors;
  roofPitch: PartOfSoulRoofPitch;
}) {
  const lines: string[] = [
    `Проект: ${params.project.title}`,
    `Площадь: ${params.project.area} м²`,
    `Категория дома: ${params.categoryId}`,
    `Кровля: ${partOfSoulRoofLabels(params.roofPitch)}`,
    `Материал стен: ${params.tierLabel}`,
    `Фасад: ${params.facadeSlug ?? "не выбран"}`,
    `Инженерия: ${params.engineeringSlugs.length ? params.quote.engineeringLines.map((l) => l.label).join(", ") : "—"}`,
    `Доп. опции: ${params.constructionSlugs.length ? params.quote.constructionLines.map((l) => l.label).join(", ") : "—"}`,
    `Коробка: ${params.quote.shellTotalRub.toLocaleString("ru-RU")} ₽`,
    ...(params.quote.facadeTotalRub > 0 ?
      [`Фасад: ${params.quote.facadeTotalRub.toLocaleString("ru-RU")} ₽`]
    : []),
    `Итого ориентир: ${params.quote.grandTotalRub.toLocaleString("ru-RU")} ₽`,
  ];

  return {
    kind: "house-project-quote" as const,
    projectSlug: params.project.slug,
    projectTitle: params.project.title,
    area: params.project.area,
    categoryId: params.categoryId,
    tierId: params.tierId,
    tierLabel: params.tierLabel,
    facadeSlug: params.facadeSlug,
    engineeringSlugs: params.engineeringSlugs,
    constructionSlugs: params.constructionSlugs,
    shellTotalRub: params.quote.shellTotalRub,
    facadeTotalRub: params.quote.facadeTotalRub,
    engineeringTotalRub: params.quote.engineeringTotalRub,
    constructionTotalRub: params.quote.constructionTotalRub,
    transportSurchargeRub: params.quote.transportSurchargeRub,
    grandTotalRub: params.quote.grandTotalRub,
    selectionSummaryRu: lines.join("\n"),
  };
}

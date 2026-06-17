import type { HouseProjectItem } from "@/lib/construction-data";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";
import type { PartOfSoulPricingFloors, PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";
import { partOfSoulRoofLabels } from "@/lib/part-of-soul-pricing";
import type { ProjectCalculatorQuoteResponse } from "@/lib/use-project-calculator-quote";
import {
  buildCalcQuoteLineItemsSummarySection,
  formatCalcRubPlain,
  type CalcQuoteLineItem,
} from "@/lib/house-construction-calc-display";

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
  const roofLabel = partOfSoulRoofLabels(params.roofPitch);
  const engineeringLines: CalcQuoteLineItem[] = params.quote.engineeringLines.map(({ label, amountRub }) => ({
    label,
    amountRub,
  }));
  const constructionLines: CalcQuoteLineItem[] = params.quote.constructionLines.map(({ label, amountRub }) => ({
    label,
    amountRub,
  }));

  const lines: string[] = [
    `Проект: ${params.project.title}`,
    `Площадь: ${params.project.area} м²`,
    `Категория дома: ${params.categoryId}`,
    `Кровля: ${roofLabel}`,
    `Материал стен: ${params.tierLabel}`,
    `Фасад: ${params.facadeSlug ?? "не выбран"}`,
    buildCalcQuoteLineItemsSummarySection(
      "Инженерия",
      engineeringLines,
      params.engineeringSlugs.length ? undefined : "—"
    ),
    buildCalcQuoteLineItemsSummarySection(
      "Доп. опции",
      constructionLines,
      params.constructionSlugs.length ? undefined : "—"
    ),
    `Коробка: ${formatCalcRubPlain(params.quote.shellTotalRub)}`,
    ...(params.quote.facadeTotalRub > 0 ? [`Фасад: ${formatCalcRubPlain(params.quote.facadeTotalRub)}`] : []),
    ...(params.quote.transportSurchargeRub > 0 ?
      [`Транспорт: ${formatCalcRubPlain(params.quote.transportSurchargeRub)}`]
    : []),
    `Итого ориентир: ${formatCalcRubPlain(params.quote.grandTotalRub)}`,
  ];

  return {
    kind: "house-project-quote" as const,
    projectSlug: params.project.slug,
    projectTitle: params.project.title,
    area: params.project.area,
    categoryId: params.categoryId,
    tierId: params.tierId,
    tierLabel: params.tierLabel,
    roofLabel,
    facadeSlug: params.facadeSlug,
    engineeringSlugs: params.engineeringSlugs,
    constructionSlugs: params.constructionSlugs,
    engineeringLines,
    constructionLines,
    shellTotalRub: params.quote.shellTotalRub,
    facadeTotalRub: params.quote.facadeTotalRub,
    engineeringTotalRub: params.quote.engineeringTotalRub,
    constructionTotalRub: params.quote.constructionTotalRub,
    transportSurchargeRub: params.quote.transportSurchargeRub,
    grandTotalRub: params.quote.grandTotalRub,
    selectionSummaryRu: lines.join("\n"),
  };
}

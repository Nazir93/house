import {
  FLOORS_STAGE_ROWS_ATTIC_MULTI,
  FLOORS_STAGE_ROWS_MULTI_STORY,
  FLOORS_STAGE_ROWS_SINGLE_STORY,
} from "@/lib/project-calculator-aurora-defaults";
import type { CalculatorStageTable, ProjectCalculatorUi } from "@/lib/project-calculator-types";
import type { PartOfSoulPricingFloors } from "@/lib/part-of-soul-pricing";
import {
  isLegacyStagePlaceholderImage,
  resolveFloorsAtticStageImageUrl,
} from "@/lib/project-calculator-stage-images";

function cloneRows(
  rows: readonly { label: string; value: string }[],
): CalculatorStageTable["rows"] {
  return rows.map((row) => ({ ...row }));
}

/** Строки этапа «Перекрытия»: 1 этаж — балки; 1,5/2 — межэтажные ЖБ плиты + чердачные балки. */
export function resolveFloorsStageRows(
  ui: ProjectCalculatorUi,
  floors: PartOfSoulPricingFloors,
  tierKey: string,
): CalculatorStageTable["rows"] {
  const fromTier = ui.stagesByTier?.[tierKey]?.floors?.rows;
  if (fromTier?.length) return fromTier;

  if (floors === 1) {
    return cloneRows(FLOORS_STAGE_ROWS_SINGLE_STORY);
  }

  const interfloor =
    ui.stages?.floors?.rows?.length ?
      ui.stages.floors.rows
    : cloneRows(FLOORS_STAGE_ROWS_MULTI_STORY);

  return [
    {
      label: "Межэтажное перекрытие",
      value: "Железобетонные плиты заводского изготовления.",
      section: true,
    },
    ...interfloor,
    {
      label: "Чердачное перекрытие",
      value: "По деревянным балкам камерной сушки.",
      section: true,
    },
    ...cloneRows(FLOORS_STAGE_ROWS_ATTIC_MULTI),
  ];
}

export function resolveFloorsStageTable(
  ui: ProjectCalculatorUi,
  floors: PartOfSoulPricingFloors,
  tierKey: string,
  fallbackLines: string[],
): CalculatorStageTable {
  const fromTier = ui.stagesByTier?.[tierKey]?.floors;
  const shared = ui.stages?.floors;
  const rows = resolveFloorsStageRows(ui, floors, tierKey);
  const customSecondary = fromTier?.secondaryImageUrl ?? shared?.secondaryImageUrl;
  const boundAttic = resolveFloorsAtticStageImageUrl({ floors, tierKey });
  const secondaryImageUrl =
    customSecondary && !isLegacyStagePlaceholderImage(customSecondary) ?
      customSecondary
    : boundAttic;

  return {
    imageUrl: fromTier?.imageUrl ?? shared?.imageUrl,
    secondaryImageUrl,
    rows: rows.length ? rows : [{ label: "Состав работ", value: fallbackLines.join("\n\n") }],
  };
}

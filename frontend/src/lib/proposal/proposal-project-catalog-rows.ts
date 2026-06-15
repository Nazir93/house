import {
  computeConstructionOptionRub,
  computeEngineeringOptionRub,
  computeFacadeTotalRub,
  computeRoofInsulationRub,
  computeShellTotalRub,
  deriveMetrics,
  isConstructionOptionAllowed,
  type ConstructionOptionCode,
  type HouseCalculatorCategoryId,
  type HouseProjectCalculatorConfig,
} from "@/lib/house-project-calculator-engine";
import type { PartOfSoulFacadeVariant, PartOfSoulWallMaterial } from "@/lib/part-of-soul-pricing";
import { packageIncludedByGroup, sumPackageTotals } from "@/lib/proposal/proposal-packages";
import { proposalRowLabel } from "@/lib/proposal/proposal-row-labels";
import type { ProposalPackageKey, ProposalPriceRow } from "@/lib/proposal/types";

/** Инженерия в пакетах «С инженер. сетями» и «White Box» (без радиаторов — опция клиента). */
export const PROPOSAL_ENGINEERING_BUNDLE_SLUGS = new Set([
  "electric",
  "water",
  "sewer",
  "heatedFloor",
  "boiler",
  "bio",
]);

/** Фасад по умолчанию в пакете White Box. */
export const PROPOSAL_WHITE_BOX_FACADE_SLUG: PartOfSoulFacadeVariant = "plaster";

/** Доп. работы в пакете White Box. */
export const PROPOSAL_WHITE_BOX_CONSTRUCTION_SLUGS = new Set([
  "interior_plaster",
  "blind_area",
  "soffits",
  "gutter",
]);

/** Позиции, входящие в колонку «С инженер. сетями» (не только инженерия). */
export const PROPOSAL_ENGINEERING_CONSTRUCTION_SLUGS = new Set(["roof_insulation_200"]);

const ENGINEERING_ORDER = ["electric", "water", "sewer", "bio", "radiators", "heatedFloor", "boiler"] as const;

const FACADE_ORDER: PartOfSoulFacadeVariant[] = ["brick", "plaster", "thermo", "brick_insulated"];

const EXTRA_CONSTRUCTION_ORDER = [
  "blind_area",
  "drainage",
  "soffits",
  "gutter",
  "roof_folding",
  "roof_soft",
  "roof_insulation_200",
  "roof_insulation_250",
  "monolithic_overlap",
  "monolithic_stairs",
] as const;

function noneIncluded(): Record<ProposalPackageKey, boolean> {
  return { STANDARD: false, ENGINEERING: false, WHITE_BOX: false, CLIENT_CHOICE: false };
}

function shellIncluded(): Record<ProposalPackageKey, boolean> {
  return packageIncludedByGroup("shell", true);
}

function sectionRow(key: string, label: string): ProposalPriceRow {
  return {
    key,
    rowKind: "section",
    group: "other",
    label,
    amountRub: 0,
    included: noneIncluded(),
  };
}

function inclusionForEngineering(slug: string, selected: Set<string>): Record<ProposalPackageKey, boolean> {
  const inBundle = PROPOSAL_ENGINEERING_BUNDLE_SLUGS.has(slug);
  return {
    STANDARD: false,
    ENGINEERING: inBundle,
    WHITE_BOX: inBundle,
    CLIENT_CHOICE: selected.has(slug),
  };
}

function inclusionForFacade(slug: string, selectedFacade: string | null): Record<ProposalPackageKey, boolean> {
  return {
    STANDARD: false,
    ENGINEERING: false,
    WHITE_BOX: slug === PROPOSAL_WHITE_BOX_FACADE_SLUG,
    CLIENT_CHOICE: selectedFacade === slug,
  };
}

function inclusionForConstruction(slug: string, selected: Set<string>): Record<ProposalPackageKey, boolean> {
  const inEng = PROPOSAL_ENGINEERING_CONSTRUCTION_SLUGS.has(slug);
  const inWb = PROPOSAL_WHITE_BOX_CONSTRUCTION_SLUGS.has(slug);
  return {
    STANDARD: false,
    ENGINEERING: inEng,
    WHITE_BOX: inWb || inEng,
    CLIENT_CHOICE: selected.has(slug),
  };
}

function itemRow(
  key: string,
  group: ProposalPriceRow["group"],
  label: string,
  amountRub: number,
  included: Record<ProposalPackageKey, boolean>
): ProposalPriceRow | null {
  if (!Number.isFinite(amountRub) || amountRub <= 0) return null;
  return { key, rowKind: "item", group, label, amountRub: Math.round(amountRub), included };
}

export function buildProjectProposalCatalogRows(params: {
  config: HouseProjectCalculatorConfig;
  categoryId: HouseCalculatorCategoryId;
  buildingArea: number;
  wallMaterial: PartOfSoulWallMaterial;
  engineeringSlugs: string[];
  constructionSlugs: string[];
  facadeSlug: string | null;
}): ProposalPriceRow[] {
  const category = params.config.categories[params.categoryId];
  if (!category) return [];

  const settings = params.config.settings;
  const metrics = deriveMetrics(params.buildingArea, category.coefficients, settings.blindAreaWidthM);
  const engSelected = new Set(params.engineeringSlugs);
  const conSelected = new Set(params.constructionSlugs);
  const rows: ProposalPriceRow[] = [];

  const shellTotal = computeShellTotalRub({
    buildingArea: params.buildingArea,
    category,
    wallMaterial: params.wallMaterial,
    smallAreaThresholdM2: settings.smallAreaThresholdM2,
    smallAreaSurcharge: settings.smallAreaSurcharge,
  });
  const shell = itemRow("shell", "shell", "Коробка", shellTotal, shellIncluded());
  if (shell) rows.push(shell);

  rows.push(sectionRow("section:engineering", "Инженерные коммуникации"));
  for (const slug of ENGINEERING_ORDER) {
    const opt = params.config.engineering[slug];
    if (!opt?.enabled) continue;
    const amount = computeEngineeringOptionRub(slug, opt, params.buildingArea);
    const row = itemRow(`eng:${slug}`, "engineering", proposalRowLabel(opt.label), amount, inclusionForEngineering(slug, engSelected));
    if (row) rows.push(row);
  }
  for (const slug of Object.keys(params.config.engineering)) {
    if ((ENGINEERING_ORDER as readonly string[]).includes(slug)) continue;
    const opt = params.config.engineering[slug];
    if (!opt?.enabled) continue;
    const amount = computeEngineeringOptionRub(slug, opt, params.buildingArea);
    const row = itemRow(`eng:${slug}`, "engineering", proposalRowLabel(opt.label), amount, inclusionForEngineering(slug, engSelected));
    if (row) rows.push(row);
  }

  rows.push(sectionRow("section:facade", "Отделка фасада"));
  for (const slug of FACADE_ORDER) {
    const facadeDef = params.config.facades[slug];
    if (!facadeDef) continue;
    const amount = computeFacadeTotalRub({
      buildingArea: params.buildingArea,
      category,
      facadeVariant: slug,
      facadePricePerM2: facadeDef.pricePerM2,
    });
    const row = itemRow(`facade:${slug}`, "facade", proposalRowLabel(facadeDef.label), amount, inclusionForFacade(slug, params.facadeSlug));
    if (row) rows.push(row);
  }

  rows.push(sectionRow("section:interior", "Внутренняя отделка стен"));
  const interior = params.config.construction.interior_plaster;
  if (interior?.enabled && isConstructionOptionAllowed("interior_plaster", params.categoryId)) {
    const amount = computeConstructionOptionRub("interior_plaster", interior, metrics, params.categoryId);
    const row = itemRow(
      "con:interior_plaster",
      "construction",
      proposalRowLabel(interior.label),
      amount,
      inclusionForConstruction("interior_plaster", conSelected)
    );
    if (row) rows.push(row);
  }

  rows.push(sectionRow("section:construction", "Дополнительные услуги"));
  const pushedConstruction = new Set<string>(["interior_plaster"]);

  const pushConstruction = (slug: ConstructionOptionCode) => {
    if (pushedConstruction.has(slug)) return;
    pushedConstruction.add(slug);
    const opt = params.config.construction[slug];
    if (!opt?.enabled) return;
    if (!isConstructionOptionAllowed(slug, params.categoryId)) return;
    let amount: number;
    if (slug === "roof_insulation_200" || slug === "roof_insulation_250") {
      amount = computeRoofInsulationRub(slug, opt, metrics, params.categoryId);
    } else {
      amount = computeConstructionOptionRub(slug, opt, metrics, params.categoryId);
    }
    const row = itemRow(`con:${slug}`, "construction", proposalRowLabel(opt.label), amount, inclusionForConstruction(slug, conSelected));
    if (row) rows.push(row);
  };

  for (const slug of EXTRA_CONSTRUCTION_ORDER) pushConstruction(slug);
  for (const slug of Object.keys(params.config.construction) as ConstructionOptionCode[]) pushConstruction(slug);

  return rows;
}

export function sumProjectProposalTotals(rows: ProposalPriceRow[]): Record<ProposalPackageKey, number> {
  return sumPackageTotals(rows.filter((r) => r.rowKind !== "section"));
}

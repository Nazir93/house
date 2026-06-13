import { prisma } from "@/lib/db";
import { getHouseConstructionCalculatorConfig } from "@/lib/house-construction-calculator-config";
import {
  CATALOG_FLOOR_LABELS,
  computeHouseConstructionQuote,
  defaultEngineeringSelection,
  defaultRoofForFloor,
  ENGINEERING_OPTION_LABELS,
  FACADE_FINISH_LABELS,
  ROOF_LABELS,
  WALL_MATERIAL_LABELS,
  type CatalogFloorId,
  type EngineeringSelection,
  type FacadeFinishId,
  type RoofTypeId,
  type WallMaterialId,
} from "@/lib/house-construction-calculator";
import {
  type HouseCalculatorCategoryId,
} from "@/lib/house-project-calculator-engine";
import { computeProjectCalculatorQuote } from "@/lib/house-project-calculator-quote";
import { getCalculatorConfig } from "@/lib/calculator-catalog";
import { packageIncludedByGroup, sumPackageTotals } from "@/lib/proposal/proposal-packages";
import type { ProposalDocumentModel, ProposalPriceRow, ProposalScopeKind } from "@/lib/proposal/types";
import type { PartOfSoulFacadeVariant, PartOfSoulWallMaterial } from "@/lib/part-of-soul-pricing";
import type { ConstructionMedia } from "@/lib/construction-shared";

type DbLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  calcData: unknown;
  createdAt: Date;
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function toWallForProjectCalc(value: unknown): PartOfSoulWallMaterial | null {
  const s = asString(value);
  if (!s) return null;
  if (s === "gas" || s === "keramzit") return "gas";
  if (s === "ceramic") return "ceramic";
  if (s === "brick") return "brick";
  return null;
}

function toWallForHouseCalc(value: unknown): WallMaterialId | null {
  const s = asString(value);
  if (!s) return null;
  if (s === "gas" || s === "ceramic" || s === "brick") return s;
  return null;
}

function toCatalogFloorId(value: unknown): CatalogFloorId | null {
  const s = asString(value);
  if (s === "1" || s === "1.5" || s === "2") return s;
  return null;
}

function pushRow(
  rows: ProposalPriceRow[],
  key: string,
  group: ProposalPriceRow["group"],
  label: string,
  amountRub: number,
  inClientChoice = false
) {
  if (!Number.isFinite(amountRub) || amountRub <= 0) return;
  rows.push({
    key,
    group,
    label,
    amountRub: Math.round(amountRub),
    included: packageIncludedByGroup(group, inClientChoice),
  });
}

function firstPlanUrl(media: ConstructionMedia[]): string | null {
  const plans = media
    .filter((m) => m.type === "PLAN")
    .sort((a, b) => (a.floor ?? 999) - (b.floor ?? 999) || a.order - b.order);
  return plans[0]?.url ?? null;
}

async function buildFromHouseProjectQuote(lead: DbLead, calc: Record<string, unknown>): Promise<ProposalDocumentModel | null> {
  const projectSlug = asString(calc.projectSlug);
  const categoryId = asString(calc.categoryId) as HouseCalculatorCategoryId | null;
  const area = asNumber(calc.area);
  const wall = toWallForProjectCalc(calc.tierLabel) ?? toWallForProjectCalc(calc.wallMaterial) ?? "gas";
  if (!projectSlug || !categoryId || !area) return null;

  const config = await getCalculatorConfig();
  const project = await prisma.houseProject.findUnique({
    where: { slug: projectSlug },
    select: {
      title: true,
      floors: true,
      area: true,
      rooms: true,
      bathrooms: true,
      media: { select: { id: true, type: true, url: true, alt: true, label: true, floor: true, order: true } },
    },
  });
  if (!project) return null;
  if (!Object.prototype.hasOwnProperty.call(config.categories, categoryId)) return null;

  const engCodes = Array.isArray(calc.engineeringSlugs) ? calc.engineeringSlugs.map(String) : [];
  const conCodes = Array.isArray(calc.constructionSlugs) ? calc.constructionSlugs.map(String) : [];
  const facadeRaw = asString(calc.facadeSlug);
  const facadeVariant =
    facadeRaw && Object.prototype.hasOwnProperty.call(config.facades, facadeRaw)
      ? (facadeRaw as PartOfSoulFacadeVariant)
      : null;
  const quote = computeProjectCalculatorQuote(
    {
      buildingArea: area,
      categoryId,
      wallMaterial: wall,
      facadeVariant,
      engineeringCodes: engCodes,
      constructionCodes: conCodes,
      projectAdjustmentPercent: 0,
      transportSurchargeRub: 0,
    },
    config
  );
  if (!quote) return null;

  const rows: ProposalPriceRow[] = [];
  pushRow(rows, "shell", "shell", "Коробка", quote.shellTotalRub, true);
  quote.engineeringLines.forEach((line: { id: string; label: string; amountRub: number }) =>
    pushRow(rows, `eng:${line.id}`, "engineering", line.label, line.amountRub, engCodes.includes(line.id))
  );
  if (quote.facadeTotalRub > 0) {
    pushRow(rows, "facade:selected", "facade", `Фасад: ${facadeRaw ?? "выбранный"}`, quote.facadeTotalRub, Boolean(facadeRaw));
  }
  quote.constructionLines.forEach((line: { id: string; label: string; amountRub: number }) =>
    pushRow(rows, `con:${line.id}`, "construction", line.label, line.amountRub, conCodes.includes(line.id))
  );

  const packageTotalsRub = sumPackageTotals(rows);
  const planUrl = firstPlanUrl(project.media as ConstructionMedia[]);

  return {
    leadId: lead.id,
    kind: "house-project-quote",
    title: asString(calc.projectTitle) ?? project.title,
    leadName: lead.name,
    leadPhone: lead.phone,
    leadEmail: lead.email,
    createdAtIso: lead.createdAt.toISOString(),
    planImageUrl: planUrl,
    summary: [
      { label: "Площадь", value: `${project.area} м2` },
      { label: "Этажность", value: `${project.floors}` },
      { label: "Спален", value: `${project.rooms}` },
      { label: "Санузлов", value: `${project.bathrooms}` },
    ],
    rows,
    packageTotalsRub,
    notes: ["* Стоимость транспортных и накладных расходов не учтена и рассчитывается отдельно."],
  };
}

async function buildFromHouseConstructionQuote(lead: DbLead, calc: Record<string, unknown>): Promise<ProposalDocumentModel | null> {
  const area = Number(asString(calc.area) ?? asNumber(calc.area) ?? 0);
  const floor = toCatalogFloorId(calc.catalogFloor) ?? "1";
  const roof = (asString(calc.roof) as RoofTypeId | null) ?? defaultRoofForFloor(floor);
  const wall = toWallForHouseCalc(calc.wallMaterial) ?? "gas";
  const facade = (asString(calc.facadeFinish) as FacadeFinishId | null) ?? "none";
  const engineeringRaw = asObject(calc.engineering);
  const engineering: EngineeringSelection = {
    ...defaultEngineeringSelection(),
    electric: engineeringRaw?.electric === true,
    water: engineeringRaw?.water === true,
    sewage: engineeringRaw?.sewage === true,
    radiators: engineeringRaw?.radiators === true,
    warmFloor: engineeringRaw?.warmFloor === true,
    boiler: engineeringRaw?.boiler === true,
    bio: engineeringRaw?.bio === true,
  };

  const config = await getHouseConstructionCalculatorConfig();
  const quote = computeHouseConstructionQuote({ areaM2: area, catalogFloor: floor, roof, wall, engineering, facadeFinish: facade }, config);
  const rows: ProposalPriceRow[] = [];
  if (quote.baseTotalRub) pushRow(rows, "shell", "shell", "Коробка", quote.baseTotalRub, true);
  quote.engineeringLines.forEach((line) => {
    const isSelected = Object.values(ENGINEERING_OPTION_LABELS).includes(line.label);
    pushRow(rows, line.id, "engineering", line.label, line.amountRub, isSelected);
  });
  quote.facadeLines.forEach((line) => pushRow(rows, line.id, "facade", line.label, line.amountRub, facade !== "none"));

  const packageTotalsRub = sumPackageTotals(rows);
  const labelFacade = facade === "none" ? "Не выбрано" : FACADE_FINISH_LABELS[facade as Exclude<FacadeFinishId, "none">];
  return {
    leadId: lead.id,
    kind: "house-construction-quote",
    title: "Коммерческое предложение",
    leadName: lead.name,
    leadPhone: lead.phone,
    leadEmail: lead.email,
    createdAtIso: lead.createdAt.toISOString(),
    summary: [
      { label: "Площадь", value: `${Math.round(area)} м2` },
      { label: "Этажность", value: CATALOG_FLOOR_LABELS[floor] },
      { label: "Кровля", value: ROOF_LABELS[roof] },
      { label: "Материал стен", value: WALL_MATERIAL_LABELS[wall] },
      { label: "Фасад", value: labelFacade },
    ],
    rows,
    packageTotalsRub,
    notes: ["* Стоимость транспортных и накладных расходов не учтена и рассчитывается отдельно."],
  };
}

function buildUnsupported(kind: ProposalScopeKind, lead: DbLead): ProposalDocumentModel {
  return {
    leadId: lead.id,
    kind,
    title: "Коммерческое предложение",
    leadName: lead.name,
    leadPhone: lead.phone,
    leadEmail: lead.email,
    createdAtIso: lead.createdAt.toISOString(),
    summary: [],
    rows: [],
    packageTotalsRub: { STANDARD: 0, ENGINEERING: 0, WHITE_BOX: 0, CLIENT_CHOICE: 0 },
    notes: ["* Для этого типа калькулятора детальная форма КП пока не поддерживается."],
  };
}

export async function buildProposalModelFromLead(lead: DbLead): Promise<{ ok: true; model: ProposalDocumentModel } | { ok: false; reason: string }> {
  const calc = asObject(lead.calcData);
  if (!calc) return { ok: false, reason: "calcData is missing" };
  const kind = asString(calc.kind) as ProposalScopeKind | null;
  if (!kind) return { ok: false, reason: "calcData.kind is missing" };

  if (kind === "house-project-quote") {
    const model = await buildFromHouseProjectQuote(lead, calc);
    return model ? { ok: true, model } : { ok: false, reason: "house-project-quote: required fields missing" };
  }
  if (kind === "house-construction-quote") {
    const model = await buildFromHouseConstructionQuote(lead, calc);
    return model ? { ok: true, model } : { ok: false, reason: "house-construction-quote: required fields missing" };
  }
  if (kind === "design-project-quote" || kind === "price-smeta") {
    return { ok: true, model: buildUnsupported(kind, lead) };
  }
  return { ok: false, reason: `unsupported kind: ${kind}` };
}


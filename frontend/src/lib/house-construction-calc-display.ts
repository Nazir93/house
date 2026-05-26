import {
  CATALOG_FLOOR_LABELS,
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

/** Порядок чекбоксов в форме калькулятора и в сводке */
export const HOUSE_CONSTRUCTION_ENGINEERING_FIELD_ORDER: (keyof EngineeringSelection)[] = [
  "electric",
  "water",
  "sewage",
  "radiators",
  "warmFloor",
  "boiler",
  "bio",
];

export function engineeringSelectedHumanLabels(
  engineering: Partial<EngineeringSelection> | undefined
): string[] {
  if (!engineering) return [];
  return HOUSE_CONSTRUCTION_ENGINEERING_FIELD_ORDER.filter((k) => engineering[k]).map(
    (k) => ENGINEERING_OPTION_LABELS[k]
  );
}

export function resolveFacadeFinishLabel(facadeFinish: FacadeFinishId | string | undefined): string {
  if (!facadeFinish || facadeFinish === "none") return "Не выбрано";
  if (facadeFinish in FACADE_FINISH_LABELS) {
    return FACADE_FINISH_LABELS[facadeFinish as keyof typeof FACADE_FINISH_LABELS];
  }
  return String(facadeFinish);
}

export function buildHouseConstructionSelectionSummaryRu(params: {
  objectType?: string | null;
  area?: string | null;
  catalogFloorLabel: string;
  roofLabel: string;
  wallMaterialLabel: string;
  facadeFinishLabel: string;
  engineeringLabels: string[];
  grandTotalRub: number | null | undefined;
  promoFreeServiceTitle?: string | null;
}): string {
  const lines: string[] = [];
  if (params.objectType?.trim()) lines.push(`Тип объекта: ${params.objectType.trim()}`);
  const area = params.area?.trim();
  if (area) lines.push(`Площадь: ${area} м²`);
  lines.push(`Этажность: ${params.catalogFloorLabel}`);
  lines.push(`Кровля: ${params.roofLabel}`);
  lines.push(`Материал стен: ${params.wallMaterialLabel}`);
  lines.push(`Фасад: ${params.facadeFinishLabel}`);
  lines.push(
    `Инженерия: ${params.engineeringLabels.length ? params.engineeringLabels.join(", ") : "ничего не выбрано"}`
  );
  if (params.promoFreeServiceTitle?.trim()) {
    lines.push(`Акция (QR): бесплатно — ${params.promoFreeServiceTitle.trim()}`);
  }
  const g = params.grandTotalRub;
  if (typeof g === "number" && Number.isFinite(g)) {
    lines.push(`Ориентировочно по прайсу: ${g.toLocaleString("ru-RU")} ₽`);
  }
  return lines.join("\n");
}

export type HouseConstructionCalcDisplayRow = { label: string; value: string };

/** Человекочитаемые строки для админки и старых заявок без selectionSummaryRu */
export function houseConstructionCalcDisplayRows(calc: unknown): HouseConstructionCalcDisplayRow[] | null {
  if (!calc || typeof calc !== "object") return null;
  const h = calc as Record<string, unknown>;

  if (h.kind === "house-project-quote") {
    const rows: HouseConstructionCalcDisplayRow[] = [];
    if (typeof h.projectTitle === "string") rows.push({ label: "Проект", value: h.projectTitle });
    if (h.area != null) rows.push({ label: "Площадь", value: `${h.area} м²` });
    if (h.categoryId != null) rows.push({ label: "Категория", value: String(h.categoryId) });
    if (typeof h.tierLabel === "string") rows.push({ label: "Материал стен", value: h.tierLabel });
    if (h.facadeSlug != null) rows.push({ label: "Фасад", value: String(h.facadeSlug) });
    if (typeof h.shellTotalRub === "number")
      rows.push({ label: "Коробка", value: `${h.shellTotalRub.toLocaleString("ru-RU")} ₽` });
    if (typeof h.facadeTotalRub === "number" && h.facadeTotalRub > 0)
      rows.push({ label: "Сумма фасада", value: `${h.facadeTotalRub.toLocaleString("ru-RU")} ₽` });
    if (typeof h.engineeringTotalRub === "number" && h.engineeringTotalRub > 0)
      rows.push({ label: "Инженерия", value: `${h.engineeringTotalRub.toLocaleString("ru-RU")} ₽` });
    if (typeof h.constructionTotalRub === "number" && h.constructionTotalRub > 0)
      rows.push({ label: "Доп. опции", value: `${h.constructionTotalRub.toLocaleString("ru-RU")} ₽` });
    if (typeof h.grandTotalRub === "number")
      rows.push({ label: "Итого ориентир", value: `${h.grandTotalRub.toLocaleString("ru-RU")} ₽` });
    return rows;
  }

  if (h.kind !== "house-construction-quote") return null;

  const rows: HouseConstructionCalcDisplayRow[] = [];

  const area = h.area != null ? String(h.area).trim() : "";
  if (area) rows.push({ label: "Площадь", value: `${area} м²` });

  const floorLabel =
    typeof h.catalogFloorLabel === "string" && h.catalogFloorLabel.trim()
      ? h.catalogFloorLabel.trim()
      : typeof h.catalogFloor === "string" && h.catalogFloor in CATALOG_FLOOR_LABELS
        ? CATALOG_FLOOR_LABELS[h.catalogFloor as CatalogFloorId]
        : h.catalogFloor != null
          ? String(h.catalogFloor)
          : "—";
  rows.push({ label: "Этажность", value: floorLabel });

  const roofLabel =
    typeof h.roofLabel === "string" && h.roofLabel.trim()
      ? h.roofLabel.trim()
      : typeof h.roof === "string" && h.roof in ROOF_LABELS
        ? ROOF_LABELS[h.roof as RoofTypeId]
        : h.roof != null
          ? String(h.roof)
          : "—";
  rows.push({ label: "Кровля", value: roofLabel });

  const wallLabel =
    typeof h.wallMaterialLabel === "string" && h.wallMaterialLabel.trim()
      ? h.wallMaterialLabel.trim()
      : typeof h.wallMaterial === "string" && h.wallMaterial in WALL_MATERIAL_LABELS
        ? WALL_MATERIAL_LABELS[h.wallMaterial as WallMaterialId]
        : h.wallMaterial != null
          ? String(h.wallMaterial)
          : "—";
  rows.push({ label: "Материал стен", value: wallLabel });

  const facadeRaw = typeof h.facadeFinish === "string" ? (h.facadeFinish as FacadeFinishId) : undefined;
  const facadeLabel =
    typeof h.facadeFinishLabel === "string" && h.facadeFinishLabel.trim()
      ? h.facadeFinishLabel.trim()
      : resolveFacadeFinishLabel(facadeRaw);
  rows.push({ label: "Фасад", value: facadeLabel });

  const eng = h.engineering as Partial<EngineeringSelection> | undefined;
  const engLabels =
    Array.isArray(h.engineeringSelectedLabels) && h.engineeringSelectedLabels.every((x) => typeof x === "string")
      ? (h.engineeringSelectedLabels as string[])
      : engineeringSelectedHumanLabels(eng);
  rows.push({
    label: "Инженерия",
    value: engLabels.length ? engLabels.join(", ") : "ничего не выбрано",
  });

  const obj = h.objectType != null ? String(h.objectType).trim() : "";
  if (obj) rows.push({ label: "Тип объекта", value: obj });

  if (h.promoQrBanner === true && typeof h.promoFreeServiceTitle === "string" && h.promoFreeServiceTitle.trim()) {
    rows.push({ label: "Акция (QR)", value: `бесплатно — ${h.promoFreeServiceTitle.trim()}` });
  }

  const quote = h.quote as { grandTotalRub?: number } | undefined;
  const g = quote?.grandTotalRub ?? h.estimate;
  if (typeof g === "number" && Number.isFinite(g)) {
    rows.push({ label: "Ориентировочно по прайсу", value: `${g.toLocaleString("ru-RU")} ₽` });
  }

  return rows;
}

import { parseCaseStudyPhasesJson, normalizeCaseStudyPhaseKey } from "@/lib/portfolio-case-study-phases";

export type ConstructionMediaType = "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO";

export interface ConstructionMedia {
  id: string;
  type: ConstructionMediaType;
  url: string;
  alt: string;
  label?: string | null;
  /** Раздел кейса на /portfolio/[slug] (foundation, walls, …) */
  phaseKey?: string | null;
  floor?: number | null;
  order: number;
}

export interface CompletionGroup {
  title: string;
  items: string[];
  note?: string;
}

export interface ConstructionStep {
  title: string;
  term: string;
  description: string;
}

/** Статус площадки на карте (иконка маркера). */
export type BuiltObjectSiteStatus = "COMPLETED" | "UNDER_CONSTRUCTION";

export interface HouseProjectItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  floors: number;
  area: number;
  price: number;
  rooms: number;
  bathrooms: number;
  materials: string[];
  isNew: boolean;
  pricePromo?: string | null;
  mortgageEnabled: boolean;
  /** CALCULATOR — встроенный расчёт на карточке; LEAD — заявка и ссылка */
  mortgageMode: "CALCULATOR" | "LEAD";
  published: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  media: ConstructionMedia[];
  completion: CompletionGroup[];
  constructionSchedule: ConstructionStep[];
  anchors: { id: string; label: string }[];
  builtObjectSlug?: string | null;
  heroPricing?: {
    tiers: { id: string; label: string; price: number }[];
    warrantyYears?: number;
    productionMonthsMin?: number;
  } | null;
  /** Сырой JSON калькулятора в БД сериализуется в construction-data как calculatorUi. */
  calculatorUi?: import("@/lib/project-calculator-types").ProjectCalculatorUi | null;
}

export interface BuiltObjectItem {
  id: string;
  slug: string;
  title: string;
  material: string;
  area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  buildTerm?: string | null;
  foundation?: string | null;
  walls?: string | null;
  roof?: string | null;
  floors?: number | null;
  /** Slug региона для карты (если пусто — эвристика по `location`). */
  regionSlug?: string | null;
  /** Slug района из справочника карты. */
  district?: string | null;
  siteStatus?: BuiltObjectSiteStatus;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  worksDescription?: string | null;
  constructionHistoryJson?: { id?: string; title: string; description: string }[] | null;
  caseStudyPhasesJson?: { id: string; title: string; order: number }[] | null;
  clientReviewText?: string | null;
  clientReviewVideoUrl?: string | null;
  telegramUrl?: string | null;
  vkUrl?: string | null;
  houseProjectSlug?: string | null;
  /** Площадь / комнаты из привязанного типового проекта (если на объекте не заданы). */
  linkedProjectArea?: number | null;
  linkedProjectRooms?: number | null;
  linkedProjectBathrooms?: number | null;
  published: boolean;
  order: number;
  /** Год в строке списка (из даты карточки в БД) */
  year?: string | null;
  media: ConstructionMedia[];
}

function mediaOf(media: ConstructionMedia[], type: ConstructionMediaType) {
  return media.filter((item) => item.type === type).sort((a, b) => a.order - b.order);
}

function buildStagePhaseRank(
  phaseKey: string | null | undefined,
  phases: { id: string; order: number }[],
): number {
  const normalized = normalizeCaseStudyPhaseKey(phaseKey);
  if (!normalized) return 1_000_000;
  const phase = phases.find((p) => p.id === normalized);
  return phase?.order ?? 999_999;
}

function compareBuildStageMediaOrder(
  a: ConstructionMedia,
  b: ConstructionMedia,
  phases: { id: string; order: number }[],
): number {
  const phaseDiff = buildStagePhaseRank(a.phaseKey, phases) - buildStagePhaseRank(b.phaseKey, phases);
  if (phaseDiff !== 0) return phaseDiff;
  const orderDiff = a.order - b.order;
  if (orderDiff !== 0) return orderDiff;
  return a.id.localeCompare(b.id);
}

/** Фото стройки: сначала по порядку этапов, внутри этапа — по order. */
export function sortBuiltObjectBuildStageMedia(
  media: ConstructionMedia[],
  caseStudyPhasesJson: BuiltObjectItem["caseStudyPhasesJson"],
): ConstructionMedia[] {
  const phases = parseCaseStudyPhasesJson(caseStudyPhasesJson);
  return [...media]
    .filter((item) => item.type === "BUILD_STAGE")
    .sort((a, b) => compareBuildStageMediaOrder(a, b, phases));
}

export function builtObjectMaterialLabel(value: string): string {
  const labels: Record<string, string> = {
    GAS_BLOCK: "Газобетон",
    BRICK: "Кирпич",
    CERAMIC_BLOCK: "Керамический блок",
    FRAME: "Каркас",
    OTHER: "Другое",
  };
  return labels[value] ?? value;
}

export function formatRub(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProjectRenders(project: HouseProjectItem) {
  return mediaOf(project.media, "RENDER");
}

export function getProjectPlans(project: HouseProjectItem) {
  return mediaOf(project.media, "PLAN");
}

export function getBuiltObjectCover(object: BuiltObjectItem) {
  return object.media.find((item) => item.type === "RENDER") ?? object.media[0] ?? null;
}

/** Фото этапов без привязки к разделу кейса (legacy, только чтение старых объектов). */
export function getBuiltObjectStages(object: BuiltObjectItem) {
  return object.media
    .filter((item) => item.type === "BUILD_STAGE" && !item.phaseKey)
    .sort((a, b) => a.order - b.order);
}

/** Фото конкретного раздела таймлайна кейса из админки. */
export function getBuiltObjectPhaseMedia(object: BuiltObjectItem, phaseKey: string) {
  const phases = parseCaseStudyPhasesJson(object.caseStudyPhasesJson);
  return object.media
    .filter(
      (item) =>
        item.type === "BUILD_STAGE" && normalizeCaseStudyPhaseKey(item.phaseKey) === phaseKey,
    )
    .sort((a, b) => compareBuildStageMediaOrder(a, b, phases));
}

/** Рендеры / обложки (порядок как в админке). */
export function getBuiltObjectRenders(object: BuiltObjectItem) {
  return mediaOf(object.media, "RENDER");
}

/** Планировки (порядок как в админке). */
export function getBuiltObjectPlans(object: BuiltObjectItem) {
  return mediaOf(object.media, "PLAN");
}

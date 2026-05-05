export type ConstructionMediaType = "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO";

export interface ConstructionMedia {
  id: string;
  type: ConstructionMediaType;
  url: string;
  alt: string;
  label?: string | null;
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
  buildTerm?: string | null;
  foundation?: string | null;
  walls?: string | null;
  roof?: string | null;
  floors?: number | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  worksDescription?: string | null;
  telegramUrl?: string | null;
  vkUrl?: string | null;
  houseProjectSlug?: string | null;
  published: boolean;
  order: number;
  /** Год в строке списка (из даты карточки в БД) */
  year?: string | null;
  media: ConstructionMedia[];
}

function mediaOf(media: ConstructionMedia[], type: ConstructionMediaType) {
  return media.filter((item) => item.type === type).sort((a, b) => a.order - b.order);
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

export function getBuiltObjectStages(object: BuiltObjectItem) {
  return mediaOf(object.media, "BUILD_STAGE");
}

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAG_PUBLIC_BUILT_OBJECTS, CACHE_TAG_PUBLIC_HOUSE_PROJECTS } from "@/lib/cache-tags-public";
import { AURORA_PROJECT_CALCULATOR_UI } from "@/lib/project-calculator-aurora-defaults";
import type { ProjectCalculatorUi } from "@/lib/project-calculator-types";
import {
  computePartOfSoulShellTotalRub,
  inferPartOfSoulFloors,
  tierIdToWallMaterial,
  type PartOfSoulPricingFloors,
  type PartOfSoulRoofPitch,
} from "@/lib/part-of-soul-pricing";
import type { BuiltObjectItem } from "@/lib/construction-shared";

export type ConstructionMediaType = "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO";

export interface ConstructionMedia {
  id: string;
  type: ConstructionMediaType;
  url: string;
  alt: string;
  label?: string | null;
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

export interface HeroPricingTier {
  id: string;
  label: string;
  price: number;
}

/** Распознанные из heroPricingJson данные (без расчётных fallback-уровней). */
export interface HeroPricingConfig {
  tiers: HeroPricingTier[];
  warrantyYears?: number;
  productionMonthsMin?: number;
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
  heroPricing?: HeroPricingConfig | null;
  calculatorUi?: ProjectCalculatorUi | null;
  calculatorCategory?: string | null;
  projectAdjustmentPercent?: number;
  calculatorOptionOverrides?: { disabledOptionIds?: string[] } | null;
}

export type { BuiltObjectItem } from "@/lib/construction-shared";

const defaultAnchors = [
  { id: "plans", label: "Планировки и фасады" },
  { id: "completion", label: "Комплектация" },
  { id: "schedule", label: "График строительства" },
  { id: "mortgage", label: "Ипотека" },
];

const defaultCompletion: CompletionGroup[] = [
  {
    title: "Теплый контур",
    items: ["Фундамент", "Стены из газобетона", "Кровля", "Окна и входная дверь"],
    note: "Базовый состав можно расширять в админке для каждого проекта.",
  },
  {
    title: "Инженерная подготовка",
    items: ["Ввод коммуникаций", "Закладные под электрику", "Подготовка котельной"],
  },
];

const defaultSchedule: ConstructionStep[] = [
  { title: "Подготовка участка", term: "1-2 недели", description: "Разметка, земляные работы, организация стройплощадки." },
  { title: "Фундамент", term: "3-4 недели", description: "Устройство основания, армирование, бетонные работы и набор прочности." },
  { title: "Коробка и кровля", term: "6-10 недель", description: "Стены, перекрытия, стропильная система и кровельное покрытие." },
  { title: "Инженерия и отделка", term: "по комплектации", description: "Срок зависит от выбранного состава работ и материалов." },
];

export const FALLBACK_HOUSE_PROJECTS: HouseProjectItem[] = [
  {
    id: "house-aurora",
    slug: "aurora",
    title: "Аврора",
    shortDescription: "Одноэтажный дом для семьи с открытой кухней-гостиной и тремя спальнями.",
    description:
      "Проект предусматривает строительство из газобетона, кирпича или керамических блоков. Планировка подходит для постоянного проживания и может адаптироваться под участок.",
    floors: 1,
    area: 128,
    price: 10900000,
    rooms: 4,
    bathrooms: 2,
    materials: ["Газобетон", "Кирпич", "Керамический блок"],
    isNew: true,
    pricePromo: "Цена с 1 марта - 10,9 млн",
    mortgageEnabled: true,
    mortgageMode: "CALCULATOR",
    published: true,
    order: 1,
    media: [
      { id: "aurora-render-1", type: "RENDER", url: "/images/banner/banner-hero-01.png", alt: "Проект Аврора", order: 0 },
      { id: "aurora-plan-1", type: "PLAN", url: "/images/banner/banner-hero-03.png", alt: "Планировка Аврора", label: "1 этаж", floor: 1, order: 0 },
    ],
    completion: defaultCompletion,
    constructionSchedule: defaultSchedule,
    anchors: defaultAnchors,
    builtObjectSlug: "dom-v-vyritse",
  },
  {
    id: "house-duet",
    slug: "duet",
    title: "Дуэт",
    shortDescription: "Двухэтажный проект с приватной зоной на втором этаже и просторной террасой.",
    description:
      "Рациональная площадь, два санузла и гибкая зона кабинета делают проект удобным для семьи, которая работает из дома.",
    floors: 2,
    area: 164,
    price: 13200000,
    rooms: 5,
    bathrooms: 3,
    materials: ["Газобетон", "Керамический блок"],
    isNew: false,
    pricePromo: null,
    mortgageEnabled: true,
    mortgageMode: "LEAD",
    published: true,
    order: 2,
    media: [
      { id: "duet-render-1", type: "RENDER", url: "/images/banner/banner-hero-02.png", alt: "Проект Дуэт", order: 0 },
      { id: "duet-plan-1", type: "PLAN", url: "/images/banner/banner-hero-04.png", alt: "План 1 этажа Дуэт", label: "1 этаж", floor: 1, order: 0 },
      { id: "duet-plan-2", type: "PLAN", url: "/images/banner/banner-hero-05.png", alt: "План 2 этажа Дуэт", label: "2 этаж", floor: 2, order: 1 },
    ],
    completion: defaultCompletion,
    constructionSchedule: defaultSchedule,
    anchors: defaultAnchors,
  },
  {
    id: "house-line",
    slug: "line",
    title: "Линия",
    shortDescription: "Компактный дом с архитектурной геометрией, двумя спальнями и большим общим пространством.",
    description:
      "Проект для небольшого участка: простая форма, понятный бюджет и возможность расширить комплектацию инженерными сетями и отделкой.",
    floors: 1,
    area: 96,
    price: 8700000,
    rooms: 3,
    bathrooms: 1,
    materials: ["Газобетон"],
    isNew: false,
    pricePromo: "Фиксация цены при договоре",
    mortgageEnabled: false,
    mortgageMode: "LEAD",
    published: true,
    order: 3,
    media: [
      { id: "line-render-1", type: "RENDER", url: "/images/banner/banner-hero-06.png", alt: "Проект Линия", order: 0 },
    ],
    completion: defaultCompletion,
    constructionSchedule: defaultSchedule,
    anchors: defaultAnchors.filter((a) => a.id !== "mortgage"),
  },
  {
    id: "house-horizon",
    slug: "horizon",
    title: "Горизонт",
    shortDescription: "Продуманный двухэтажный объём с террасой и светлой гостиной на первом уровне.",
    description:
      "Подходит для среднего участка: выразительный фасад, функциональные спальни наверху и возможность выбора материала стен.",
    floors: 2,
    area: 142,
    price: 11850000,
    rooms: 4,
    bathrooms: 2,
    materials: ["Кирпич", "Газобетон"],
    isNew: false,
    pricePromo: null,
    mortgageEnabled: true,
    mortgageMode: "CALCULATOR",
    published: true,
    order: 4,
    media: [
      { id: "horizon-render-1", type: "RENDER", url: "/images/banner/banner-hero-04.png", alt: "Проект Горизонт", order: 0 },
    ],
    completion: defaultCompletion,
    constructionSchedule: defaultSchedule,
    anchors: defaultAnchors,
  },
];

export const FALLBACK_BUILT_OBJECTS: BuiltObjectItem[] = [
  {
    id: "built-vyritsa",
    slug: "dom-v-vyritse",
    title: "Дом в д. Вырицы",
    material: "Газобетон",
    area: 128,
    buildTerm: "7 месяцев",
    foundation: "Монолитная плита",
    walls: "Газобетон",
    roof: "Металлочерепица",
    floors: 1,
    regionSlug: "lo",
    district: "vyritsa",
    siteStatus: "COMPLETED",
    linkedProjectRooms: 4,
    linkedProjectBathrooms: 2,
    location: "Ленинградская область, д. Вырица",
    latitude: 59.407,
    longitude: 30.346,
    description: "Построенный объект по типовому проекту с адаптацией под участок и пожелания семьи.",
    worksDescription: "Фундамент, коробка, кровля, инженерная подготовка и наружная отделка.",
    houseProjectSlug: "aurora",
    published: true,
    order: 1,
    year: "2024",
    telegramUrl: "https://t.me/",
    vkUrl: "https://vk.com/",
    media: [
      { id: "vyritsa-cover", type: "RENDER", url: "/images/portfolio/demo-house-01.svg", alt: "Дом в Вырице", order: 0 },
      {
        id: "vyritsa-stage-1",
        type: "BUILD_STAGE",
        url: "/images/portfolio/demo-house-02.svg",
        alt: "Фундамент",
        label: "Фундамент",
        order: 1,
      },
    ],
  },
  {
    id: "built-smerdovitsy",
    slug: "dom-v-smerdovitsah",
    title: "Дом в п. Приветнинское",
    material: "Керамический блок",
    area: 164,
    buildTerm: "9 месяцев",
    foundation: "Ленточный фундамент",
    walls: "Керамический блок",
    roof: "Фальцевая кровля",
    floors: 1.5,
    regionSlug: "lo",
    district: "priyutninskoe",
    siteStatus: "COMPLETED",
    linkedProjectRooms: 5,
    linkedProjectBathrooms: 3,
    location: "Ленинградская область, п. Приветнинское",
    latitude: 59.25,
    longitude: 29.91,
    description: "Двухэтажный загородный дом с террасой, построенный с учетом рельефа участка.",
    worksDescription: "Полный цикл строительных работ от участка до теплого контура.",
    houseProjectSlug: "duet",
    published: true,
    order: 2,
    year: "2023",
    media: [
      { id: "smerdovitsy-cover", type: "RENDER", url: "/images/portfolio/demo-house-02.svg", alt: "Дом в п. Приветнинское", order: 0 },
    ],
  },
  {
    id: "built-toksovo",
    slug: "dom-v-toksovo",
    title: "Дом в д. Токсово",
    material: "Газобетон",
    area: 145,
    buildTerm: "8 месяцев",
    floors: 2,
    regionSlug: "lo",
    district: "vsevolozhsk",
    siteStatus: "UNDER_CONSTRUCTION",
    location: "Ленинградская область, д. Токсово",
    latitude: 60.255,
    longitude: 30.527,
    description: "Демо-объект для просмотра сетки портфолио.",
    published: true,
    order: 3,
    year: "2024",
    media: [{ id: "toksovo-cover", type: "RENDER", url: "/images/portfolio/demo-house-03.svg", alt: "Токсово", order: 0 }],
  },
  {
    id: "built-ramenskoe",
    slug: "dom-v-ramenskom",
    title: "Дом в Раменском",
    material: "Кирпич",
    area: 178,
    buildTerm: "10 месяцев",
    floors: 1,
    regionSlug: "mo",
    district: "ramenskoe",
    siteStatus: "COMPLETED",
    location: "Московская область, Раменское",
    latitude: 55.567,
    longitude: 38.23,
    description: "Демо-объект в регионе «Москва и область».",
    published: true,
    order: 4,
    year: "2023",
    media: [{ id: "ramenskoe-cover", type: "RENDER", url: "/images/portfolio/demo-house-04.svg", alt: "Раменское", order: 0 }],
  },
  {
    id: "built-krasnogorsk",
    slug: "dom-v-krasnogorske",
    title: "Дом в Красногорске",
    material: "Каркас",
    area: 98,
    buildTerm: "6 месяцев",
    floors: 1,
    regionSlug: "mo",
    district: "krasnogorsk",
    siteStatus: "COMPLETED",
    location: "Московская область, Красногорск",
    latitude: 55.831,
    longitude: 37.329,
    description: "Компактный каркасный дом — демо для фильтров.",
    published: true,
    order: 5,
    year: "2024",
    media: [{ id: "krasnogorsk-cover", type: "RENDER", url: "/images/portfolio/demo-house-05.svg", alt: "Красногорск", order: 0 }],
  },
  {
    id: "built-vyborg",
    slug: "dom-v-vyborg",
    title: "Дом в г. Выборг",
    material: "Керамический блок",
    area: 212,
    buildTerm: "11 месяцев",
    floors: 2,
    regionSlug: "lo",
    district: "vyborg",
    siteStatus: "COMPLETED",
    location: "Ленинградская область, Выборг",
    latitude: 60.713,
    longitude: 28.753,
    description: "Демо-объект Северо-Запад, два этажа.",
    published: true,
    order: 6,
    year: "2022",
    media: [{ id: "vyborg-cover", type: "RENDER", url: "/images/portfolio/demo-house-06.svg", alt: "Выборг", order: 0 }],
  },
];

function normalizeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeMortgageMode(value: unknown): "CALCULATOR" | "LEAD" {
  return value === "CALCULATOR" ? "CALCULATOR" : "LEAD";
}

function mediaOf(media: ConstructionMedia[], type: ConstructionMediaType) {
  return media.filter((item) => item.type === type).sort((a, b) => a.order - b.order);
}

export function normalizeHeroPricing(raw: unknown): HeroPricingConfig | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const arr = Array.isArray(o.tiers) ? o.tiers : [];
  const tiers: HeroPricingTier[] = [];
  arr.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const t = item as Record<string, unknown>;
    const label = String(t.label ?? "").trim();
    const price = Math.round(Number(t.price));
    if (!label || !Number.isFinite(price) || price <= 0) return;
    const idRaw = String(t.id ?? "").trim();
    tiers.push({
      id: idRaw || `tier-${index}`,
      label,
      price,
    });
  });
  if (!tiers.length) return null;
  const wy = Number(o.warrantyYears);
  const pm = Number(o.productionMonthsMin);
  return {
    tiers,
    ...(Number.isFinite(wy) && wy > 0 ? { warrantyYears: Math.round(wy) } : {}),
    ...(Number.isFinite(pm) && pm > 0 ? { productionMonthsMin: Math.round(pm) } : {}),
  };
}

/** Уровни цен для блока авторского проекта и синхронизации с «Комплектацией». */
export function resolveProjectHeroPricing(project: HouseProjectItem): {
  tiers: HeroPricingTier[];
  warrantyYears: number;
  productionMonthsMin: number;
} {
  const fallbackWarranty = 5;
  const fallbackMonths = 5;
  const fromDb = project.heroPricing?.tiers?.length ? project.heroPricing.tiers : null;
  const tiers: HeroPricingTier[] =
    fromDb ??
    [
      { id: "gas", label: "Газоблок", price: Math.round(project.price) },
      { id: "ceramic", label: "Керамоблок", price: Math.round(project.price * 1.034) },
      { id: "brick", label: "Кирпич", price: Math.round(project.price * 1.086) },
    ];
  return {
    tiers,
    warrantyYears: project.heroPricing?.warrantyYears ?? fallbackWarranty,
    productionMonthsMin: project.heroPricing?.productionMonthsMin ?? fallbackMonths,
  };
}

/** Цены в герое при формульном калькуляторе PDF (синхрон с блоком «Комплектация»). */
export function derivePartOfSoulHeroTiers(
  areaSqm: number,
  pf: PartOfSoulPricingFloors,
  roof: PartOfSoulRoofPitch,
  tiers: HeroPricingTier[],
  smallHouseThresholdSqm: number,
  shellSurchargeUnderThreshold: number
): HeroPricingTier[] {
  return tiers.map((t) => {
    const wall = tierIdToWallMaterial(t.id, t.label);
    const computed = computePartOfSoulShellTotalRub({
      areaSqm,
      pf,
      roof,
      wall,
      smallThresholdSqm: smallHouseThresholdSqm,
      shellSurchargeIfSmall: shellSurchargeUnderThreshold,
    });
    return { ...t, price: computed ?? t.price };
  });
}

function mergeCalculatorUi(base: ProjectCalculatorUi, over: Partial<ProjectCalculatorUi>): ProjectCalculatorUi {
  return {
    ...base,
    consultation: over.consultation !== undefined ? over.consultation : base.consultation,
    partOfSoul: over.partOfSoul !== undefined ? over.partOfSoul : base.partOfSoul,
    stages: over.stages !== undefined ? over.stages : base.stages,
    stagesByTier: over.stagesByTier !== undefined ? over.stagesByTier : base.stagesByTier,
    addons: over.addons !== undefined ? over.addons : base.addons,
    transportBands: over.transportBands?.length ? over.transportBands : base.transportBands,
  };
}

export function normalizeCalculatorJson(raw: unknown): ProjectCalculatorUi | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as ProjectCalculatorUi;
}

/**
 * Калькулятор комплектации на карточке проекта.
 * База — пресет «Аврора» (PDF); calculatorJson в админке только переопределяет поля.
 * Пустой {} в админке = полный пресет на сайте.
 */
export function getEffectiveCalculatorUi(project: HouseProjectItem): ProjectCalculatorUi {
  return mergeCalculatorUi(AURORA_PROJECT_CALCULATOR_UI, project.calculatorUi ?? {});
}

function mapHouseProject(row: any): HouseProjectItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description,
    floors: row.floors,
    area: row.area,
    price: row.price,
    rooms: row.rooms,
    bathrooms: row.bathrooms,
    materials: row.materials ?? [],
    isNew: row.isNew,
    pricePromo: row.pricePromo,
    mortgageEnabled: row.mortgageEnabled,
    mortgageMode: normalizeMortgageMode(row.mortgageMode),
    published: row.published,
    order: row.order,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    media: row.media ?? [],
    completion: normalizeArray<CompletionGroup>(row.completionJson, defaultCompletion),
    constructionSchedule: normalizeArray<ConstructionStep>(row.constructionJson, defaultSchedule),
    anchors: normalizeArray<{ id: string; label: string }>(row.anchorsJson, defaultAnchors),
    builtObjectSlug: row.builtObjects?.[0]?.slug ?? null,
    heroPricing: normalizeHeroPricing(row.heroPricingJson),
    calculatorUi: normalizeCalculatorJson(row.calculatorJson),
    calculatorCategory: row.calculatorCategory ?? null,
    projectAdjustmentPercent: Number(row.projectAdjustmentPercent) || 0,
    calculatorOptionOverrides:
      row.calculatorOptionOverrides && typeof row.calculatorOptionOverrides === "object" ?
        (row.calculatorOptionOverrides as { disabledOptionIds?: string[] })
      : null,
  };
}

function mapBuiltObject(row: any): BuiltObjectItem {
  const siteRaw = row.siteStatus as string | undefined;
  const siteStatus =
    siteRaw === "UNDER_CONSTRUCTION" ? ("UNDER_CONSTRUCTION" as const) : ("COMPLETED" as const);
  const floorsVal = row.floors;
  const floors =
    floorsVal == null || floorsVal === "" ? null : typeof floorsVal === "number" ? floorsVal : Number(floorsVal);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    material: builtObjectMaterialLabel(row.material),
    area: row.area,
    buildTerm: row.buildTerm,
    foundation: row.foundation,
    walls: row.walls,
    roof: row.roof,
    floors: Number.isFinite(floors as number) ? (floors as number) : null,
    regionSlug: row.regionSlug ?? null,
    district: row.district ?? null,
    siteStatus,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    worksDescription: row.worksDescription,
    telegramUrl: row.telegramUrl,
    vkUrl: row.vkUrl,
    houseProjectSlug: row.houseProject?.slug ?? null,
    linkedProjectRooms: row.houseProject?.rooms ?? null,
    linkedProjectBathrooms: row.houseProject?.bathrooms ?? null,
    published: row.published,
    order: row.order,
    year: row.createdAt ? String(new Date(row.createdAt).getFullYear()) : null,
    media: row.media ?? [],
  };
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
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(price);
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

/** Локальные SVG в public — для превью сетки без загрузки из сети. */
const DEMO_PORTFOLIO_COVERS = [
  "/images/portfolio/demo-house-01.svg",
  "/images/portfolio/demo-house-02.svg",
  "/images/portfolio/demo-house-03.svg",
  "/images/portfolio/demo-house-04.svg",
  "/images/portfolio/demo-house-05.svg",
  "/images/portfolio/demo-house-06.svg",
] as const;

/** В development подставляем обложку, если в БД нет RENDER — удобно смотреть /portfolio локально. */
function attachDevPortfolioCovers(objects: BuiltObjectItem[]): BuiltObjectItem[] {
  if (process.env.NODE_ENV !== "development") return objects;
  return objects.map((o, i) => {
    if (getBuiltObjectCover(o)) return o;
    const url = DEMO_PORTFOLIO_COVERS[i % DEMO_PORTFOLIO_COVERS.length];
    return {
      ...o,
      media: [{ id: `dev-cover-${o.id}`, type: "RENDER", url, alt: o.title, order: 0 }, ...(o.media ?? [])],
    };
  });
}

export function getBuiltObjectStages(object: BuiltObjectItem) {
  return object.media
    .filter((item) => item.type === "BUILD_STAGE" && !item.phaseKey)
    .sort((a, b) => a.order - b.order);
}

const getHouseProjectsCached = unstable_cache(
  async (): Promise<HouseProjectItem[]> => {
    try {
      const rows = await (prisma as any).houseProject.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { price: "asc" }],
        include: {
          media: { orderBy: [{ type: "asc" }, { order: "asc" }] },
          builtObjects: { where: { published: true }, select: { slug: true }, take: 1 },
        },
      });
      if (rows.length > 0) return rows.map(mapHouseProject);
    } catch {
      // Database may not be migrated yet.
    }
    return FALLBACK_HOUSE_PROJECTS;
  },
  ["house-projects-published"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_HOUSE_PROJECTS] }
);

export async function getHouseProjects(): Promise<HouseProjectItem[]> {
  return getHouseProjectsCached();
}

const getHouseProjectBySlugCached = unstable_cache(
  async (slug: string): Promise<HouseProjectItem | null> => {
    try {
      const row = await (prisma as any).houseProject.findUnique({
        where: { slug },
        include: {
          media: { orderBy: [{ type: "asc" }, { order: "asc" }] },
          builtObjects: { where: { published: true }, select: { slug: true }, take: 1 },
        },
      });
      if (row?.published) return mapHouseProject(row);
    } catch {
      // Database may not be migrated yet.
    }
    return FALLBACK_HOUSE_PROJECTS.find((project) => project.slug === slug) ?? null;
  },
  ["house-project-by-slug"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_HOUSE_PROJECTS] }
);

export async function getHouseProjectBySlug(slug: string): Promise<HouseProjectItem | null> {
  return getHouseProjectBySlugCached(slug);
}

export async function getSimilarHouseProjects(project: HouseProjectItem, limit = 3): Promise<HouseProjectItem[]> {
  const all = await getHouseProjects();
  const areaRef = Math.max(project.area, 1);
  const priceRef = Math.max(project.price, 1);
  return all
    .filter((item) => item.slug !== project.slug)
    .map((item) => ({
      item,
      score:
        Math.abs(item.area - project.area) / areaRef +
        Math.abs(item.price - project.price) / priceRef,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

const getBuiltObjectsCached = unstable_cache(
  async (): Promise<BuiltObjectItem[]> => {
    try {
      const rows = await (prisma as any).builtObject.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: {
          media: { orderBy: [{ type: "asc" }, { order: "asc" }] },
          houseProject: { select: { slug: true, rooms: true, bathrooms: true } },
        },
      });
      if (rows.length > 0) return rows.map(mapBuiltObject);
    } catch {
      // Database may not be migrated yet.
    }
    return FALLBACK_BUILT_OBJECTS;
  },
  ["built-objects-published"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_BUILT_OBJECTS] }
);

export async function getBuiltObjects(): Promise<BuiltObjectItem[]> {
  const list = await getBuiltObjectsCached();
  return attachDevPortfolioCovers(list);
}

const HOME_BUILT_PORTFOLIO_MAX = 5;

/** Построенные объекты для блока на главной (тот же каталог, что и /portfolio). */
export async function getHomeBuiltPortfolio(): Promise<BuiltObjectItem[]> {
  const list = await getBuiltObjects();
  return list.slice(0, HOME_BUILT_PORTFOLIO_MAX);
}

const getBuiltObjectBySlugCached = unstable_cache(
  async (slug: string): Promise<BuiltObjectItem | null> => {
    try {
      const row = await (prisma as any).builtObject.findUnique({
        where: { slug },
        include: {
          media: { orderBy: [{ type: "asc" }, { order: "asc" }] },
          houseProject: { select: { slug: true, rooms: true, bathrooms: true } },
        },
      });
      if (row?.published) return mapBuiltObject(row);
    } catch {
      // Database may not be migrated yet.
    }
    return FALLBACK_BUILT_OBJECTS.find((object) => object.slug === slug) ?? null;
  },
  ["built-object-by-slug"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_BUILT_OBJECTS] }
);

export async function getBuiltObjectBySlug(slug: string): Promise<BuiltObjectItem | null> {
  return getBuiltObjectBySlugCached(slug);
}

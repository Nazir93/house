import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

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
  year?: string | null;
  media: ConstructionMedia[];
}

const defaultAnchors = [
  { id: "plans", label: "Планировка" },
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
      { id: "vyritsa-cover", type: "RENDER", url: "/images/portfolio/built-placeholder-1.jpg", alt: "Дом в Вырице", order: 0 },
      { id: "vyritsa-stage-1", type: "BUILD_STAGE", url: "/images/portfolio/stage-placeholder-1.jpg", alt: "Фундамент", label: "Фундамент", order: 0 },
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
    floors: 2,
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
      { id: "smerdovitsy-cover", type: "RENDER", url: "/images/portfolio/built-placeholder-2.jpg", alt: "Дом в п. Приветнинское", order: 0 },
    ],
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
  };
}

function mapBuiltObject(row: any): BuiltObjectItem {
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
    floors: row.floors,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    worksDescription: row.worksDescription,
    telegramUrl: row.telegramUrl,
    vkUrl: row.vkUrl,
    houseProjectSlug: row.houseProject?.slug ?? null,
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

export function getBuiltObjectStages(object: BuiltObjectItem) {
  return mediaOf(object.media, "BUILD_STAGE");
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
  { revalidate: 60 }
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
  { revalidate: 60 }
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
          houseProject: { select: { slug: true } },
        },
      });
      if (rows.length > 0) return rows.map(mapBuiltObject);
    } catch {
      // Database may not be migrated yet.
    }
    return FALLBACK_BUILT_OBJECTS;
  },
  ["built-objects-published"],
  { revalidate: 60 }
);

export async function getBuiltObjects(): Promise<BuiltObjectItem[]> {
  return getBuiltObjectsCached();
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
          houseProject: { select: { slug: true } },
        },
      });
      if (row?.published) return mapBuiltObject(row);
    } catch {
      // Database may not be migrated yet.
    }
    return FALLBACK_BUILT_OBJECTS.find((object) => object.slug === slug) ?? null;
  },
  ["built-object-by-slug"],
  { revalidate: 60 }
);

export async function getBuiltObjectBySlug(slug: string): Promise<BuiltObjectItem | null> {
  return getBuiltObjectBySlugCached(slug);
}

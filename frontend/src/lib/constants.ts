export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Часть души";

/** Слоган под логотипом в шапке (как на лендинге застройщика). */
export const HEADER_TAGLINE =
  process.env.NEXT_PUBLIC_HEADER_TAGLINE?.trim() ||
  "Строительство коттеджей из кирпича и газобетона";

/** Ссылка на карточку организации в Яндекс.Картах для блока «рейтинг»; пусто — ведёт на страницу отзывов. */
export const YANDEX_ORG_URL = process.env.NEXT_PUBLIC_YANDEX_ORG_URL?.trim() || "";

/** Фон главного баннера (локальный файл в /public или полный URL). */
export const BANNER_HERO_IMAGE =
  process.env.NEXT_PUBLIC_BANNER_HERO_URL?.trim() || "/images/banner-hero.png";
/** Якорный город (офис на карте, локальные формулировки в мета). Без env — Санкт-Петербург. */
export const CITY = process.env.NEXT_PUBLIC_CITY?.trim() || "Санкт-Петербург";
/**
 * Зона работ в маркетинговых текстах — перечень через запятую.
 * Задаётся на сервере: NEXT_PUBLIC_SERVICE_REGIONS
 */
export const SERVICE_REGIONS =
  process.env.NEXT_PUBLIC_SERVICE_REGIONS?.trim() ||
  "Ленинградская область, Санкт-Петербург";

/** Подзаголовок hero и похожие блоки: офис + регионы без перегруза title. */
export function getHeroGeoSubtitle(): string {
  return `Проектирование и строительство загородных домов под ключ. Офис в ${CITY}, работаем в: ${SERVICE_REGIONS}.`;
}

/** Доп. фраза для meta description на главной и в layout. */
export function getDefaultSiteGeoDescription(): string {
  return `Проектирование и строительство домов под ключ. Офис в ${CITY}, проекты в ${SERVICE_REGIONS}. Типовые проекты, портфолио построенных объектов, ипотека и индивидуальное проектирование.`;
}

type SchemaPlace = { "@type": "City" | "AdministrativeArea"; name: string };

/** Несколько зон для schema.org areaServed (организация и услуги). */
export function buildSchemaAreaServed(): SchemaPlace[] {
  const seen = new Set<string>();
  const out: SchemaPlace[] = [];
  const push = (name: string, t: "City" | "AdministrativeArea") => {
    const k = `${t}:${name}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ "@type": t, name });
  };
  push(CITY, "City");
  for (const raw of SERVICE_REGIONS.split(/[,;]+/)) {
    const name = raw.trim();
    if (!name || name === CITY) continue;
    const t = /край|область|округ|федеральный/i.test(name) ? "AdministrativeArea" : "City";
    push(name, t);
  }
  return out;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dom.ru";

export const PHONE = "8 (928) 455-45-59";
export const PHONE_RAW = "89284554559";
export const PHONE2 = "8 (900) 233-66-39";
export const PHONE2_RAW = "89002336639";
export const EMAIL = "info@dom.ru";
/** Адрес офиса (для контактов и карты) */
export const ADDRESS = "г. Санкт-Петербург";
export const WORKING_HOURS = "Пн–Пт 9:00–17:00";

/**
 * Координаты офиса (WGS84): долгота, широта.
 * Центр Санкт-Петербурга по умолчанию; уточните под фактический офис или задайте NEXT_PUBLIC_OFFICE_GEO_LON / LAT.
 */
export const OFFICE_GEO_LON = Number(
  process.env.NEXT_PUBLIC_OFFICE_GEO_LON?.trim() || "30.31413"
);
export const OFFICE_GEO_LAT = Number(
  process.env.NEXT_PUBLIC_OFFICE_GEO_LAT?.trim() || "59.93863"
);

/** Встроенный виджет: центр + красная метка pm2rdm на здании */
export function getYandexOfficeMapEmbedUrl(): string {
  const lon = OFFICE_GEO_LON;
  const lat = OFFICE_GEO_LAT;
  const ll = `${lon}%2C${lat}`;
  return `https://yandex.ru/map-widget/v1/?ll=${ll}&z=17&l=map&pt=${lon},${lat},pm2rdm`;
}

/** Полноэкранные Яндекс.Карты — та же метка, что и во встроенном виджете */
export function getYandexOfficeMapLinkUrl(): string {
  const lon = OFFICE_GEO_LON;
  const lat = OFFICE_GEO_LAT;
  return `https://yandex.ru/maps/?pt=${lon}%2C${lat}&z=17&l=map`;
}

export const COMPANY = {
  fullName: "Индивидуальный предприниматель Чернышева Елена Михайловна",
  shortName: "ИП Чернышева Е. М.",
  inn: "232013211085",
  ogrnip: "314236632900029",
  postalAddress: "354068, Краснодарский край, г. Сочи, ул. Пасечная 61/2, кв. 48",
  bank: {
    name: 'АО "Тинькофф Банк"',
    account: "40802810700003133044",
    corrAccount: "30101810145250000974",
    bic: "044525974",
  },
};

export const SOCIAL_LINKS = {
  telegram: "https://t.me/dom",
  /** Мессенджер Max — ссылка на чат или профиль (задать в .env) */
  max:
    process.env.NEXT_PUBLIC_MAX_CHAT_URL?.trim() ||
    "https://max.ru/u/f9LHodD0cOICVt6F_SbXekYin0iKseqgg53Vo-E4sCJ1sXjkB0Bs18LxWUg",
};

export const SERVICES = [
  {
    id: "projecting",
    slug: "/services/projecting",
    title: "Проектирование",
    shortDescription:
      "Типовые и индивидуальные проекты домов: планировки, фасады, рабочая документация и сметная логика.",
    icon: "home" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "foundation",
    slug: "/services/foundation",
    title: "Фундамент под ключ",
    shortDescription:
      "Подбор основания, земляные работы, армирование, бетон и контроль качества фундамента.",
    icon: "layers" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "roofing",
    slug: "/services/roofing",
    title: "Монтаж кровли",
    shortDescription:
      "Стропильная система, кровельный пирог, покрытие, водостоки и узлы примыканий.",
    icon: "home" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "engineering",
    slug: "/services/engineering",
    title: "Инженерные сети",
    shortDescription:
      "Электрика, отопление, водоснабжение, канализация и подготовка котельной.",
    icon: "network" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "finishing",
    slug: "/services/finishing",
    title: "Отделка под ключ",
    shortDescription:
      "Черновая и чистовая отделка, фасадные решения, комплектация и финальная приемка дома.",
    icon: "brush" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
];

/** Нижняя панель статистики (fixed-stats-bar): число + подпись, при наведении — detail */
export const STATS = [
  {
    value: 13,
    label: "лет на рынке",
    suffix: "",
    detail: "Проектирование и строительство частных домов: команда инженеров и прорабов.",
  },
  {
    value: 120,
    label: "объектов в деле",
    suffix: "+",
    detail: "Портфолио построенных домов и объектов на разных этапах строительства.",
  },
  {
    value: 85,
    label: "типовых проектов",
    suffix: "+",
    detail: "Каталог типовых решений — от компактных до просторных планировок.",
  },
  {
    value: 3,
    label: "региона присутствия",
    suffix: "",
    detail: "Ленинградская область, Санкт-Петербург и другие локации по запросу.",
  },
] as const;

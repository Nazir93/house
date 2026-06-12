export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Часть души";

/** Слоган под логотипом в шапке (как на лендинге застройщика). */
export const HEADER_TAGLINE =
  process.env.NEXT_PUBLIC_HEADER_TAGLINE?.trim() ||
  "Строительство домов под ключ";

/** Подпись под телефоном в шапке (десктоп). */
export const HEADER_PHONE_HINT =
  process.env.NEXT_PUBLIC_HEADER_PHONE_HINT?.trim() || "Ответим за 5 минут";

/** Внешний URL личного кабинета клиента; если задан — `/account` делает редирект. Иначе — страница-заглушка на сайте. */
export const ACCOUNT_PORTAL_EXTERNAL_URL =
  process.env.NEXT_PUBLIC_ACCOUNT_PORTAL_URL?.trim() || "";

export const ACCOUNT_PORTAL_PATH = "/account" as const;

/** Ссылка на карточку организации в Яндекс.Картах (legacy / будущие блоки). */
export const YANDEX_ORG_URL = process.env.NEXT_PUBLIC_YANDEX_ORG_URL?.trim() || "";

/** Страница отзывов в Яндекс.Картах — шапка сайта (иконка «Я» и рейтинг). */
export const YANDEX_REVIEWS_URL =
  process.env.NEXT_PUBLIC_YANDEX_REVIEWS_URL?.trim() ||
  "https://yandex.com/maps/org/everhouse/190163423712/reviews/?ll=30.304577%2C59.966881&z=16";

/** Оценка рядом с маркой Яндекс в шапке (можно синхронизировать с картами). */
export const YANDEX_MAPS_RATING_SCORE =
  process.env.NEXT_PUBLIC_YANDEX_MAPS_RATING?.trim() || "5.0";

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
  return `Проектируем и строим загородные дома: на чертежах — от подвала до кровли только качественные и понятные решения. Офис в ${CITY}, работаем в: ${SERVICE_REGIONS}.`;
}

/** Доп. фраза для meta description на главной и в layout. */
export function getDefaultSiteGeoDescription(): string {
  return `Строительство домов под ключ: качественные и понятные чертежи, прозрачная смета. Офис в ${CITY}, работаем в ${SERVICE_REGIONS}. Типовые и индивидуальные проекты, портфолио, ипотека.`;
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

/** Без env для локальной сборки — подставьте реальный URL на проде (.env). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

/** Дефолты; при наличии записей в админке «Настройки» подставятся из БД. */
export const PHONE = "+7 (812) 989-99-01";
export const PHONE_RAW = "+78129899901";
export const PHONE2 = "+7 (911) 600-00-99";
export const PHONE2_RAW = "+79116000099";

/** Номер для чатов Telegram / Max (кнопки «написать»). */
export const MESSENGER_CHAT_PHONE_RAW =
  process.env.NEXT_PUBLIC_MESSENGER_CHAT_PHONE?.trim() || "+79046000099";
export const EMAIL = "";
/** Адрес офиса (контакты, подвал, schema.org; при записи в админке подменяется из БД) */
export const ADDRESS = "г. Санкт-Петербург, ул. Ординарная, д. 18";
export const WORKING_HOURS = "Пн–Пт 9:00–17:00";

/**
 * Координаты офиса (WGS84): долгота, широта — метка на Яндекс.Картах (виджет и ссылка).
 * Переопределение: NEXT_PUBLIC_OFFICE_GEO_LON / NEXT_PUBLIC_OFFICE_GEO_LAT.
 */
export const OFFICE_GEO_LON = Number(
  process.env.NEXT_PUBLIC_OFFICE_GEO_LON?.trim() || "30.3046"
);
export const OFFICE_GEO_LAT = Number(
  process.env.NEXT_PUBLIC_OFFICE_GEO_LAT?.trim() || "59.9669"
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

/** Реквизиты по умолчанию пустые — задаются в админке (ключи company_*, bank_*). */
export const COMPANY = {
  fullName: "",
  shortName: "",
  inn: "",
  ogrnip: "",
  postalAddress: "",
  bank: {
    name: "",
    account: "",
    corrAccount: "",
    bic: "",
  },
};

export const SOCIAL_LINKS = {
  telegram:
    process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || "https://t.me/sk_chastdushi",
  vk: process.env.NEXT_PUBLIC_VK_URL?.trim() || "https://vk.ru/sk_chastdushi",
  /** Max — ссылка на чат (не канал _biz). */
  max:
    process.env.NEXT_PUBLIC_MAX_CHAT_URL?.trim() ||
    `https://web.max.ru/add?phone=${encodeURIComponent(MESSENGER_CHAT_PHONE_RAW)}`,
};

export const SERVICES = [
  {
    id: "projecting",
    slug: "/services/proektirovanie",
    title: "Проектирование",
    shortDescription:
      "Типовые и индивидуальные проекты домов: планировки, фасады, рабочая документация и сметная логика.",
    icon: "home" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "foundation",
    slug: "/services/fundament",
    title: "Фундамент под ключ",
    shortDescription:
      "Подбор основания, земляные работы, армирование, бетон и контроль качества фундамента.",
    icon: "layers" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "shell",
    slug: "/services/karkas",
    title: "Коробка дома",
    shortDescription:
      "Возведение стен, перекрытий и несущих конструкций по проекту: сроки и контроль этапов.",
    icon: "home" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "roofing",
    slug: "/services/krovlya",
    title: "Монтаж кровли",
    shortDescription:
      "Стропильная система, кровельный пирог, покрытие, водостоки и узлы примыканий.",
    icon: "home" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "engineering",
    slug: "/services/inzheneriya",
    title: "Инженерные сети",
    shortDescription:
      "Электрика, отопление, водоснабжение, канализация и подготовка котельной.",
    icon: "network" as const,
    coverImage: null as string | null,
    videoUrl: null as string | null,
  },
  {
    id: "finishing",
    slug: "/services/otdelka",
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

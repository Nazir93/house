import { CITY, SERVICE_REGIONS, SITE_NAME } from "@/lib/constants";

const C = CITY;
const S = SITE_NAME;
const GEO_TAIL = ` Офис в ${C}, проекты в ${SERVICE_REGIONS}.`;

export interface ServiceSeoBundle {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  landingTheses: string[];
}

export interface ServicesIndexSeoBundle {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  landingTheses: string[];
}

const SERVICE_SEO_BY_SLUG = {
  proektirovanie: {
    title: `Проектирование домов — типовые и индивидуальные проекты | ${S}`,
    description: `Проектирование частных домов под ключ: типовые проекты, индивидуальная архитектура, рабочая документация, планировки, фасады и сметная логика.${GEO_TAIL}`,
    keywords: [
      `проектирование домов ${C}`,
      "проект частного дома",
      "индивидуальный проект дома",
      "типовой проект дома",
      "рабочая документация дома",
      S,
    ],
    h1: `Проектирование домов в ${C}`,
    landingTheses: [
      "Закрывает спрос на проект дома, индивидуальное проектирование и типовые решения.",
      "Подчеркивает состав документации: планировки, фасады, конструктив и смета.",
      "Локальный хвост: город офиса и регионы строительства.",
    ],
  },
  fundament: {
    title: `Фундамент под ключ для дома — расчёт и строительство | ${S}`,
    description: `Фундамент для загородного дома под ключ: подбор основания, земляные работы, армирование, бетон, гидроизоляция и контроль качества.${GEO_TAIL}`,
    keywords: [
      `фундамент под ключ ${C}`,
      "фундамент для дома",
      "строительство фундамента",
      "ленточный фундамент",
      "плитный фундамент",
      S,
    ],
    h1: `Фундамент под ключ для загородного дома`,
    landingTheses: [
      "Закрывает коммерческие запросы по фундаменту для ИЖС.",
      "Упоминает ключевые этапы работ и контроль качества.",
      "Не обещает конкретную цену без проекта и геологии.",
    ],
  },
  karkas: {
    title: `Коробка дома под ключ — стены, перекрытия и конструктив | ${S}`,
    description: `Строительство коробки дома: стены, перекрытия, несущие конструкции и подготовка под кровлю по проекту с контролем сроков и этапов.${GEO_TAIL}`,
    keywords: [
      `коробка дома под ключ ${C}`,
      "строительство коробки дома",
      "возведение стен дома",
      "дом из газобетона",
      "коттедж под ключ",
      S,
    ],
    h1: `Коробка дома под ключ`,
    landingTheses: [
      "Закрывает спрос на этап коробки, стены и несущий конструктив.",
      "Подходит для связки с каталогом проектов и калькулятором.",
      "Фокус на понятном составе работ без перегруза техническими терминами.",
    ],
  },
  krovlya: {
    title: `Монтаж кровли дома под ключ — стропила, утепление, покрытие | ${S}`,
    description: `Кровля для загородного дома под ключ: стропильная система, утепление, кровельное покрытие, водостоки и узлы примыканий.${GEO_TAIL}`,
    keywords: [
      `монтаж кровли ${C}`,
      "кровля под ключ",
      "крыша частного дома",
      "стропильная система",
      "утепление кровли",
      S,
    ],
    h1: `Монтаж кровли под ключ`,
    landingTheses: [
      "Закрывает запросы по кровле, крыше и стропильной системе.",
      "Показывает состав работ от конструкции до водостоков.",
      "Локальная привязка остается в description и keywords.",
    ],
  },
  inzheneriya: {
    title: `Инженерные сети в частном доме — отопление, вода, электрика | ${S}`,
    description: `Инженерные сети для коттеджа: электрика, отопление, водоснабжение, канализация, вентиляция и подготовка котельной.${GEO_TAIL}`,
    keywords: [
      `инженерные сети дома ${C}`,
      "инженерия коттеджа",
      "отопление частного дома",
      "электрика в доме",
      "водоснабжение и канализация",
      S,
    ],
    h1: `Инженерные сети для частного дома`,
    landingTheses: [
      "Закрывает широкий кластер инженерных систем частного дома.",
      "Разводит электрику, отопление, воду, канализацию и котельную.",
      "Хорошо работает как среднечастотная посадочная страница.",
    ],
  },
  otdelka: {
    title: `Отделка дома под ключ — черновая, чистовая, фасад | ${S}`,
    description: `Отделка загородного дома под ключ: черновые и чистовые работы, фасадные решения, комплектация материалов и финальная приёмка.${GEO_TAIL}`,
    keywords: [
      `отделка дома под ключ ${C}`,
      "чистовая отделка дома",
      "черновая отделка коттеджа",
      "фасадная отделка дома",
      "ремонт загородного дома",
      S,
    ],
    h1: `Отделка дома под ключ`,
    landingTheses: [
      "Закрывает спрос на отделку после коробки и инженерии.",
      "Разделяет черновые, чистовые и фасадные работы.",
      "Не конфликтует с ремонтными услугами вне ИЖС.",
    ],
  },
} satisfies Record<string, ServiceSeoBundle>;

export type KnownServiceSeoSlug = keyof typeof SERVICE_SEO_BY_SLUG;

export function getServiceSeoBySlug(slug: string): ServiceSeoBundle | null {
  return SERVICE_SEO_BY_SLUG[slug as KnownServiceSeoSlug] ?? null;
}

export function getKnownServiceSeoSlugs(): KnownServiceSeoSlug[] {
  return Object.keys(SERVICE_SEO_BY_SLUG) as KnownServiceSeoSlug[];
}

export function getServicesIndexSeo(): ServicesIndexSeoBundle {
  return {
    title: `Услуги строительства домов — ${C} и регионы | ${S}`,
    description: `Проектирование, фундамент, кровля, инженерные сети и отделка под ключ для загородных домов.${GEO_TAIL}`,
    keywords: [
      `строительство домов ${C}`,
      `проектирование дома ${C}`,
      `монтаж кровли ${C}`,
      "фундамент под ключ",
      "отделка дома под ключ",
      "инженерные сети коттедж",
      S,
    ],
    h1: "УСЛУГИ — ПРОЕКТИРОВАНИЕ И СТРОИТЕЛЬСТВО ЗАГОРОДНЫХ ДОМОВ",
    landingTheses: [
      "Главная услуг — обзор направлений: проектирование, фундамент, кровля, инженерия, отделка.",
      "Карточки ведут на отдельные страницы /services/proektirovanie, fundament, karkas, krovlya, inzheneriya, otdelka.",
      "Гео: город офиса и регионы из констант.",
    ],
  };
}

/** H1 /services: новый текст; старый шаблон «… в {город}» из сида/БД заменяем. */
export function resolveServicesIndexH1(dbH1: string | null | undefined): string {
  const fallback = getServicesIndexSeo().h1;
  const raw = dbH1?.trim();
  if (!raw) return fallback;
  if (/^услуги\s*[—–-]\s*проектирование и строительство в\s+/i.test(raw)) return fallback;
  return raw;
}

/** Значения для записи PageMeta (путь → поля). Устаревшие URL услуг не сеем. */
export function getServicePageMetaSeeds(): Array<{
  path: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
}> {
  const index = getServicesIndexSeo();
  const serviceSeeds = getKnownServiceSeoSlugs().map((slug) => {
    const seo = SERVICE_SEO_BY_SLUG[slug];
    return {
      path: `/services/${slug}`,
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords.join(", "),
      h1: seo.h1,
    };
  });

  return [
    {
      path: "/services",
      title: index.title,
      description: index.description,
      keywords: index.keywords.join(", "),
      h1: index.h1,
    },
    ...serviceSeeds,
  ];
}

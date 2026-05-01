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
    h1: `Услуги — проектирование и строительство в ${C}`,
    landingTheses: [
      "Главная услуг — обзор направлений: проектирование, фундамент, кровля, инженерия, отделка.",
      "Карточки ведут на отдельные страницы /services/projecting, foundation, roofing, engineering, finishing.",
      "Гео: город офиса и регионы из констант.",
    ],
  };
}

/** Значения для записи PageMeta (путь → поля). Старые лендинги /services/electrical и т.п. не сеем. */
export function getServicePageMetaSeeds(): Array<{
  path: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
}> {
  const index = getServicesIndexSeo();
  return [
    {
      path: "/services",
      title: index.title,
      description: index.description,
      keywords: index.keywords.join(", "),
      h1: index.h1,
    },
  ];
}

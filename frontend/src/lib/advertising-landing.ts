import type { BuiltObjectItem, HouseProjectItem } from "@/lib/construction-data";
import { ADDRESS, CITY, SERVICE_REGIONS, STATS, YANDEX_MAPS_RATING_SCORE } from "@/lib/constants";

export type AdvertisingLandingSlug =
  | "dom-pod-klyuch"
  | "kirpich"
  | "stoimost"
  | "gazobeton"
  | "odnoetazhnye"
  | "keramoblok";

export type PortfolioMaterialFilter = "GAS_BLOCK" | "BRICK" | "CERAMIC_BLOCK";

export type AdvertisingLandingConfig = {
  slug: AdvertisingLandingSlug;
  path: `/lp/${AdvertisingLandingSlug}`;
  source: `lp-${AdvertisingLandingSlug}`;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  /** Фильтр проектов по материалу в названии */
  projectMaterial?: "Кирпич" | "Газобетон" | "Керамический блок";
  /** Фильтр проектов по этажности */
  projectMaxFloors?: number;
  /** Фильтр портфолио по материалу объекта */
  portfolioMaterial?: PortfolioMaterialFilter;
  /** Материал, который подсвечиваем в сравнении */
  highlightMaterial?: "gas" | "brick" | "ceramic";
  quizDefaults?: {
    wallMaterial?: "gas" | "ceramic" | "brick";
    serviceLabel: string;
  };
  includes: string[];
  faq: Array<{ question: string; answer: string }>;
  excursionTitle: string;
  excursionLead: string;
};

export const ADVERTISING_TRUST_STATS = [
  ...STATS.map((stat) => ({
    value: `${stat.value}${stat.suffix}`,
    label: stat.label,
    detail: stat.detail,
  })),
  {
    value: YANDEX_MAPS_RATING_SCORE,
    label: "рейтинг на Яндекс.Картах",
    detail: "Отзывы клиентов и оценка компании на картах.",
  },
] as const;

export const ADVERTISING_OFFICE_GEO = {
  city: CITY,
  regions: SERVICE_REGIONS,
  address: ADDRESS,
} as const;

export type MaterialComparisonRow = {
  id: "gas" | "brick" | "ceramic";
  label: string;
  priceLevel: string;
  buildSpeed: string;
  durability: string;
  thermal: string;
  bestFor: string;
};

export const MATERIAL_COMPARISON_ROWS: MaterialComparisonRow[] = [
  {
    id: "gas",
    label: "Газобетон",
    priceLevel: "Средний",
    buildSpeed: "Быстро",
    durability: "Высокая при правильном фасаде",
    thermal: "Хорошая при соблюдении толщины",
    bestFor: "Оптимальный баланс цены, скорости и тепла",
  },
  {
    id: "brick",
    label: "Кирпич",
    priceLevel: "Выше среднего",
    buildSpeed: "Дольше",
    durability: "Максимальная",
    thermal: "Инерционная, комфорт круглый год",
    bestFor: "Долговечный дом с классическим фасадом",
  },
  {
    id: "ceramic",
    label: "Керамоблок",
    priceLevel: "Средний+",
    buildSpeed: "Средне",
    durability: "Высокая",
    thermal: "Хорошая инерция стен",
    bestFor: "Компромисс между массой кирпича и скоростью блоков",
  },
];

export const LP_BUDGET_OPTIONS = [
  { id: "to-8", label: "До 8 млн ₽" },
  { id: "8-12", label: "8–12 млн ₽" },
  { id: "12-18", label: "12–18 млн ₽" },
  { id: "18-25", label: "18–25 млн ₽" },
  { id: "25-plus", label: "От 25 млн ₽" },
  { id: "unknown", label: "Пока не определился" },
] as const;

export const LP_MORTGAGE_OPTIONS = [
  { id: "yes", label: "Да, нужна консультация по ипотеке" },
  { id: "maybe", label: "Возможно, после расчёта стоимости" },
  { id: "no", label: "Нет, строю за свои средства" },
] as const;

const BASE_FAQ_GENERAL = [
  {
    question: "Можно ли сначала получить ориентировочную стоимость?",
    answer:
      "Да. Квиз на странице даёт первичный ориентир, а менеджер уточняет комплектацию, участок, фундамент и инженерные решения перед сметой.",
  },
  {
    question: "Вы строите только по готовым проектам?",
    answer:
      "Нет. Можно взять типовой проект за основу или разработать индивидуальное решение под участок, семью и бюджет.",
  },
  {
    question: "В каких регионах работаете?",
    answer: `Основной фокус — ${CITY} и ${SERVICE_REGIONS}. Другие локации обсуждаем индивидуально.`,
  },
  {
    question: "Что входит в смету под ключ?",
    answer:
      "Фундамент, коробка, кровля, окна, организация строительства и согласованная комплектация. Точный состав фиксируется в договоре.",
  },
];

function config(
  partial: Omit<AdvertisingLandingConfig, "path" | "source"> & { slug: AdvertisingLandingSlug }
): AdvertisingLandingConfig {
  return {
    ...partial,
    path: `/lp/${partial.slug}`,
    source: `lp-${partial.slug}`,
  };
}

export const ADVERTISING_LANDING_CONFIGS: Record<AdvertisingLandingSlug, AdvertisingLandingConfig> = {
  "dom-pod-klyuch": config({
    slug: "dom-pod-klyuch",
    title: "Строительство домов под ключ в СПб и Ленинградской области | Часть души",
    description:
      "Строительство домов под ключ: проекты, расчёт стоимости, комплектация, ипотека, портфолио и заявка на консультацию.",
    h1: "Строительство домов под ключ в Санкт-Петербурге и Ленинградской области",
    eyebrow: "Дом под ключ · СПб и ЛО",
    lead:
      "Подберём проект, материал стен и комплектацию под ваш участок и бюджет. Ориентировочный расчёт — за несколько минут, точная смета — после консультации с инженером.",
    primaryCta: "Рассчитать стоимость",
    secondaryCta: "Смотреть проекты",
    quizDefaults: { serviceLabel: "LP: дом под ключ" },
    includes: [
      "Подбор проекта под участок и состав семьи",
      "Фундамент, коробка, кровля и инженерия в одной смете",
      "Сравнение газобетона, кирпича и керамоблока",
      "Ипотека, поэтапная оплата и сопровождение стройки",
    ],
    faq: [
      ...BASE_FAQ_GENERAL,
      {
        question: "Можно ли посмотреть готовые и строящиеся дома?",
        answer:
          "Да. Организуем экскурсию на объекты в СПб и Ленинградской области — по записи после короткого созвона.",
      },
      {
        question: "Сколько занимает строительство?",
        answer:
          "Срок зависит от площади, материала и комплектации. После квиза менеджер назовёт реалистичный диапазон по вашему проекту.",
      },
    ],
    excursionTitle: "Экскурсия на готовые и строящиеся объекты",
    excursionLead:
      "Покажем реальные дома в СПб и Ленинградской области: материалы, узлы, качество отделки и ход работ на площадке.",
  }),
  kirpich: config({
    slug: "kirpich",
    title: "Кирпичный дом под ключ — проекты и стоимость | Часть души",
    description:
      "Кирпичные дома под ключ: проекты, цена, комплектация, сравнение материалов, портфолио и расчёт сметы.",
    h1: "Кирпичный дом под ключ: проекты, комплектация и расчёт стоимости",
    eyebrow: "Кирпич · лучший ROI в рекламе",
    lead:
      "Кирпич — сильный кластер по конверсии. Здесь собраны проекты под кирпичную комплектацию, реальные объекты и понятный маршрут от расчёта до стройки.",
    primaryCta: "Получить расчёт кирпичного дома",
    secondaryCta: "Проекты из кирпича",
    projectMaterial: "Кирпич",
    portfolioMaterial: "BRICK",
    highlightMaterial: "brick",
    quizDefaults: { wallMaterial: "brick", serviceLabel: "LP: кирпичный дом" },
    includes: [
      "Подбор проекта с кирпичной комплектацией",
      "Фундамент и конструктив под тяжёлые стены",
      "Сравнение кирпича с газобетоном и керамоблоком",
      "Фасад, инженерия и ипотека в одной логике сметы",
    ],
    faq: [
      {
        question: "Кирпичный дом дороже газобетонного?",
        answer:
          "Обычно да, но итог зависит от площади, фундамента, фасада и инженерии. На консультации сравним несколько комплектаций в одной логике.",
      },
      {
        question: "Можно ли адаптировать типовой проект под кирпich?",
        answer:
          "Да. Проверяем конструктив, толщину стен, узлы, фундамент и фасадные решения под выбранный материал.",
      },
      {
        question: "Подходит ли кирпich для постоянного проживания?",
        answer:
          "Да, при грамотной теплотехнике, кровле, окнах и инженерии кирпичный дом комфортен круглый год.",
      },
      {
        question: "Есть ли примеры построенных кирпичных домов?",
        answer: "Да, на странице — реальные объекты из портфолио. Можно записаться на экскурсию.",
      },
      {
        question: "Можно ли оформить ипотеку на строительство?",
        answer: "Да. Поможем сориентироваться по программам и этапам финансирования.",
      },
    ],
    excursionTitle: "Посмотреть кирпичные дома на объекте",
    excursionLead:
      "Покажем построенные и строящиеся кирпичные дома: кладку, фасад, планировки и качество исполнения.",
  }),
  stoimost: config({
    slug: "stoimost",
    title: "Сколько стоит построить дом — расчёт и смета | Часть души",
    description:
      "Рассчитайте стоимость строительства дома: материал, площадь, комплектация, ипотека и предварительная смета.",
    h1: "Сколько стоит построить дом под ключ",
    eyebrow: "Цена · смета · калькулятор",
    lead:
      "Цена зависит не только от площади: материал, фундамент, кровля, инженерия и участок меняют итог. Соберём ориентир за несколько шагов и покажем, из чего складывается смета.",
    primaryCta: "Начать расчёт",
    secondaryCta: "Состав сметы",
    quizDefaults: { serviceLabel: "LP: стоимость строительства" },
    includes: [
      "Расчёт по площади, этажности и материалу",
      "Разделение коробки, фасада и инженерии",
      "Пояснение, почему цена за м² меняется",
      "Передача расчёта менеджеру для точного КП",
    ],
    faq: [
      {
        question: "Почему нельзя назвать одну цену за квадратный метр?",
        answer:
          "Дом одинаковой площади может отличаться фундаментом, кровлей, фасадом, инженерией и условиями участка.",
      },
      {
        question: "Квиз показывает финальную стоимость?",
        answer: "Нет, это ориентир для первого разговора. Финальная смета — после уточнения проекта и участка.",
      },
      {
        question: "Можно ли сравнить несколько материалов?",
        answer: "Да. В квизе можно выбрать газобетон, кирпich или керамоблок и сравнить комплектации.",
      },
      {
        question: "Что влияет на итог сильнее всего?",
        answer: "Площадь, материал стен, фундамент под геологию, кровля, инженерия и фасад.",
      },
      {
        question: "Когда получу точное коммерческое предложение?",
        answer: "После заявки менеджер уточнит детали и подготовит КП с составом работ.",
      },
    ],
    excursionTitle: "Сравнить смету с реальным объектом",
    excursionLead:
      "На экскурсии покажем, как выбранная комплектация выглядит в готовом доме и что входит в стоимость на практике.",
  }),
  gazobeton: config({
    slug: "gazobeton",
    title: "Дом из газобетона под ключ — проекты и цена | Часть души",
    description:
      "Строительство домов из газобетона: проекты, стоимость, сравнение с кирпichом, портфолио и расчёт сметы.",
    h1: "Дом из газобетона под ключ: проекты, цена и комплектация",
    eyebrow: "Газобетон · большой спрос",
    lead:
      "Газобетон — самый объёмный кластер спроса. Здесь проекты под газобетонную комплектацию, сравнение материалов, реальные объекты и расчёт с понятной сметой.",
    primaryCta: "Рассчитать дом из газобетона",
    secondaryCta: "Проекты из газобетона",
    projectMaterial: "Газобетон",
    portfolioMaterial: "GAS_BLOCK",
    highlightMaterial: "gas",
    quizDefaults: { wallMaterial: "gas", serviceLabel: "LP: газобетон" },
    includes: [
      "Подбор проекта под газобетонную комплектацию",
      "Теплотехника, фасад и защита цоколя",
      "Сравнение с кирпichом и керамоблоком",
      "Ипотека и поэтапная оплата строительства",
    ],
    faq: [
      {
        question: "Газобетон подходит для круглогодичного проживания?",
        answer: "Да, при правильной толщине стен, фасаде и инженерии.",
      },
      {
        question: "Чем газобетон отличается от кирпicha по бюджету?",
        answer: "Обычно быстрее и экономичнее по коробке, но фасад и фундамент всё равно индивидуальны.",
      },
      {
        question: "Нужна ли обязательная отделка фасада?",
        answer: "Да, защита от влаги и правильный фасадный слой критичны для долговечности.",
      },
      {
        question: "Можно ли взять типовой проект?",
        answer: "Да, большинство проектов каталога допускают газобетонную комплектацию.",
      },
      {
        question: "Есть ли построенные дома из газобетона?",
        answer: "Да, в блоке портфолио — реальные объекты. Можно записаться на экскурсию.",
      },
    ],
    excursionTitle: "Экскурсия на дома из газобетона",
    excursionLead:
      "Покажем готовые и строящиеся объекты: кладку, утепление, фасад и инженерные решения.",
  }),
  odnoetazhnye: config({
    slug: "odnoetazhnye",
    title: "Одноэтажный дом под ключ — проекты и стоимость | Часть души",
    description:
      "Одноэтажные дома под ключ: проекты до 150–220 м², цена, комплектация, ипотека и расчёт сметы.",
    h1: "Одноэтажный дом под ключ: удобные планировки и понятная смета",
    eyebrow: "1 этаж · комфорт и бюджет",
    lead:
      "Одноэтажный дом — удобный формат для постоянного проживания: без лестниц, с продуманными планировками и прозрачной сметой под ваш бюджет.",
    primaryCta: "Подобрать одноэтажный проект",
    secondaryCta: "Смотреть планировки",
    projectMaxFloors: 1,
    quizDefaults: { serviceLabel: "LP: одноэтажный дом" },
    includes: [
      "Подбор одноэтажных проектов до 150–220 м²",
      "Выбор материала: газобетон, кирпich, керамоблок",
      "Расчёт с учётом участка и инженерии",
      "Ипотека и экскурсия на готовые объекты",
    ],
    faq: [
      {
        question: "Какая площадь одноэтажного дома оптимальна?",
        answer: "Чаще всего семьи выбирают 120–180 м² — достаточно спален, кухни-гостиной и кладовых.",
      },
      {
        question: "Одноэтажный дом дешевле двухэтажного?",
        answer: "Не всегда: больше площадь фундамента и кровли на единицу жилой площади, но нет лестниц и второго контура.",
      },
      {
        question: "Можно ли адаптировать двухэтажный проект в один этаж?",
        answer: "Иногда да — обсудим на консультации, если планировка позволяет.",
      },
      {
        question: "Какие материалы доступны?",
        answer: "Газобетон, кирпich и керамоблок — сравним в квизе и на консультации.",
      },
      {
        question: "Можно посмотреть одноэтажные дома на объекте?",
        answer: "Да, организуем экскурсию по готовым и строящимся одноэтажным домам.",
      },
    ],
    excursionTitle: "Посмотреть одноэтажные дома на объекте",
    excursionLead:
      "Покажем планировки, высоты потолков, инженерию и качество отделки в реальных одноэтажных домах.",
  }),
  keramoblok: config({
    slug: "keramoblok",
    title: "Дом из керамоблока под ключ — проекты и цена | Часть души",
    description:
      "Строительство домов из керамоблока: проекты, стоимость, сравнение материалов и расчёт сметы.",
    h1: "Дом из керамоблока под ключ: проекты и расчёт стоимости",
    eyebrow: "Керамоблок · тестовый кластер",
    lead:
      "Керамоблок сочетает инерцию кирпicha и скорость блоковой кладки. Подберём проект, сравним материалы и рассчитаем комплектацию под ваш участок.",
    primaryCta: "Получить расчёт по керамоблоку",
    secondaryCta: "Проекты из керамоблока",
    projectMaterial: "Керамический блок",
    portfolioMaterial: "CERAMIC_BLOCK",
    highlightMaterial: "ceramic",
    quizDefaults: { wallMaterial: "ceramic", serviceLabel: "LP: керамоблок" },
    includes: [
      "Подбор проекта под керамоблочную комплектацию",
      "Сравнение с газобетоном и кирпichом",
      "Фундамент и фасад под выбранный материал",
      "Ипотека и сопровождение строительства",
    ],
    faq: [
      {
        question: "Чем керамоблок отличается от газобетона?",
        answer: "Выше масса и инерция стен, другой подход к фундаменту и фасаду, но выше предсказуемость «каменного» дома.",
      },
      {
        question: "Керамоблок дороже газобетона?",
        answer: "Обычно да по коробке, но итог зависит от площади, фасада и инженерии.",
      },
      {
        question: "Есть ли проекты под керамоблок?",
        answer: "Да, в каталоге есть проекты с допуском керамоблочной комплектации.",
      },
      {
        question: "Можно ли комбинировать с облицовочным кирпichом?",
        answer: "Да, часто используют керамоблок как несущий слой с облицовкой.",
      },
      {
        question: "Есть ли объекты в портфолио?",
        answer: "Да, покажем реальные дома или близкие по технологии объекты на экскурсии.",
      },
    ],
    excursionTitle: "Экскурсия на дома из керамоблока",
    excursionLead:
      "Покажем кладку, узлы, фасадные решения и готовые планировки на объекте.",
  }),
};


export const ADVERTISING_LANDING_SLUGS = Object.keys(ADVERTISING_LANDING_CONFIGS) as AdvertisingLandingSlug[];

export function getAdvertisingLandingConfig(slug: string): AdvertisingLandingConfig | null {
  return (ADVERTISING_LANDING_CONFIGS as Record<string, AdvertisingLandingConfig>)[slug] ?? null;
}

export function pickAdvertisingLandingProjects(
  projects: HouseProjectItem[],
  config: AdvertisingLandingConfig,
  limit = 6
): HouseProjectItem[] {
  const published = projects.filter((project) => project.published !== false);
  let filtered = published;

  if (config.projectMaterial) {
    filtered = filtered.filter((project) =>
      project.materials.some((item) =>
        item.toLowerCase().includes(config.projectMaterial!.toLowerCase()),
      ),
    );
  }


  if (config.projectMaxFloors != null) {
    filtered = filtered.filter((project) => project.floors <= config.projectMaxFloors!);
  }

  return filtered
    .sort((a, b) => a.price - b.price || a.area - b.area)
    .slice(0, limit);
}

export function pickAdvertisingLandingPortfolio(
  objects: BuiltObjectItem[],
  config: AdvertisingLandingConfig,
  limit = 4
): BuiltObjectItem[] {
  const published = objects.filter((object) => object.published !== false);
  let filtered = published;

  if (config.portfolioMaterial) {
    filtered = filtered.filter((object) => object.material === config.portfolioMaterial);
  }

  if (filtered.length < 2 && config.portfolioMaterial) {
    filtered = published;
  }

  return filtered.slice(0, limit);
}

export function budgetLabelById(id: string): string {
  return LP_BUDGET_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

export function mortgageLabelById(id: string): string {
  return LP_MORTGAGE_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

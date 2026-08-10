import type { BuiltObjectItem, HouseProjectItem } from "@/lib/construction-data";
import { normalizeBuiltObjectMaterialEnum } from "@/lib/construction-shared";
import { ADDRESS, CITY, SERVICE_REGIONS, STATS, YANDEX_MAPS_RATING_SCORE } from "@/lib/constants";
import {
  LP_THEME_BY_SLUG,
  resolveLpSectionOrder,
  resolveLpTheme,
  type LpSectionId,
  type LpThemeId,
} from "@/lib/lp-themes";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";

export type { LpSectionId, LpThemeId } from "@/lib/lp-themes";

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
  /** Подзаголовок на полноэкранном hero */
  heroSubtitle?: string;
  /** Главная кнопка на hero (по умолчанию — secondaryCta → #projects) */
  heroMainCta?: string;
  heroMainHref?: string;
  /** Запасное фото hero, если нет рендера проекта / портфолио */
  heroImageFallback?: string;
  /**
   * Явный баннер LP (приоритет над медиа проектов/портфолио).
   * Для посадочных с отдельной фотосъёмкой/рендером.
   */
  heroImage?: string;
  /** object-position для hero, напр. "52% 40%" — кадрирование дома в кадре */
  heroImageObjectPosition?: string;
  /** Блок «Факты о компании» — вступление (цифры общие) */
  factsIntro?: string;
  /** Блок «Каталог проектов» — вступление и примечание */
  catalogIntro?: string;
  catalogNote?: string;
  /** Визуальная тема LP */
  theme: LpThemeId;
  /** Порядок секций (hero и contacts — вне списка) */
  sectionOrder: LpSectionId[];
  /** Вступление блока «Как мы работаем» */
  stepsIntro?: string;
  /** Вступление блока отзывов */
  reviewsIntro?: string;
  /** Подпись цены «от» в hero (если нет — считаем по каталогу проектов) */
  heroPriceHint?: string;
};

export type LpFactStat = {
  value: string;
  label: string;
};

/** Цифры для сетки «Факты о компании» — данные компании (короткие value, без длинных фраз). */
export const ADVERTISING_LP_FACT_STATS: LpFactStat[] = [
  { value: "13", label: "лет на рынке" },
  { value: "120+", label: "объектов построено" },
  { value: YANDEX_MAPS_RATING_SCORE, label: "рейтинг на Яндекс.Картах" },
  { value: "85+", label: "типовых проектов" },
  { value: "3", label: "региона присутствия" },
  { value: "от 5 лет", label: "гарантии на конструктив" },
];

export const ADVERTISING_LP_NAV = [
  { label: "Проекты", href: "#projects" },
  { label: "Расчёт", href: "#lead-form" },
  { label: "Комплектация", href: "#includes" },
  { label: "Ипотека", href: "#mortgage" },
  { label: "Объекты", href: "#portfolio" },
  { label: "Вопросы", href: "#faq" },
] as const;

/** Минимальная цена «от» среди проектов каталога LP (руб.) — как в каталоге сайта. */
export function advertisingLandingMinProjectPrice(projects: HouseProjectItem[]): number | null {
  const prices = projects
    .filter((p) => p.published !== false)
    .map((p) => resolveProjectListingPriceRub(p, "all"))
    .filter((p) => p > 0);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

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
  partial: Omit<AdvertisingLandingConfig, "path" | "source" | "theme" | "sectionOrder"> & {
    slug: AdvertisingLandingSlug;
    theme?: LpThemeId;
    sectionOrder?: LpSectionId[];
  },
): AdvertisingLandingConfig {
  const theme = partial.theme ?? LP_THEME_BY_SLUG[partial.slug];
  const sectionOrder = partial.sectionOrder ?? resolveLpSectionOrder({ slug: partial.slug, theme });
  return {
    ...partial,
    theme,
    sectionOrder,
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
    heroSubtitle:
      "Подберём проект, материал и комплектацию — от первого расчёта до сдачи дома на участке",
    heroMainCta: "Смотреть проекты",
    heroMainHref: "#projects",
    heroImageFallback: "/images/banner/banner-hero-01.png",
    eyebrow: "Дом под ключ · СПб и ЛО",
    lead:
      "Подберём проект, материал стен и комплектацию под ваш участок и бюджет. Ориентировочный расчёт — за несколько минут, точная смета — после консультации с инженером.",
    primaryCta: "Рассчитать стоимость",
    secondaryCta: "Смотреть проекты",
    factsIntro:
      "Проект, смета, организация работ и контроль качества на площадке. Газобетон, кирпич и керамоблок — с прозрачной комплектацией и понятными этапами.",
    catalogIntro:
      "В каталоге — типовые проекты с ценой под ключ: планировка, площадь и этажность. Любой дом можно адаптировать под участок, состав семьи и материал стен — затем сравнить комплектации и получить расчёт.",
    catalogNote:
      "Строительство можно оформить с ипотекой на ИЖС — подскажем по программам и этапам финансирования.",
    stepsIntro:
      "От первой заявки до ключей — с фиксированной сметой, понятным графиком и сопровождением на каждом этапе.",
    reviewsIntro:
      "Клиенты отмечают прозрачную смету, внимание к деталям и возможность посмотреть дом на объекте до принятия решения.",
    quizDefaults: { serviceLabel: "LP: дом под ключ" },
    includes: [
      "Проект и адаптация под участок и состав семьи",
      "Фундамент — тип основания под грунт и нагрузки проекта",
      "Коробка: стены, перекрытия, армопояса по выбранному материалу",
      "Кровля: стропильная система, пирог, узлы и водосток",
      "Инженерия: электрика, вода, канализация, отопление",
      "Окна, организация стройки и поэтапная приёмка работ",
      "Сравнение газобетона, кирпича и керамоблока в одной логике сметы",
      "Ипотека на ИЖС и сопровождение до сдачи дома",
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
      {
        question: "Какая гарантия на дом?",
        answer:
          "На конструктив даём гарантию от 5 лет. Точные сроки и условия фиксируем в договоре вместе со сметой и графиком работ.",
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
    h1: "Строим кирпичные дома для комфортной жизни",
    heroSubtitle:
      "Проекты, комплектация и строительство под ключ в Санкт-Петербурге и Ленинградской области",
    heroMainCta: "Выбрать проект дома",
    heroMainHref: "#projects",
    heroImage: "/images/lp/kirpich-hero.png",
    heroImageObjectPosition: "54% 42%",
    heroImageFallback: "/images/lp/kirpich-hero.png",
    eyebrow: "Кирпичные дома под ключ",
    lead:
      "Подберём проект под участок и бюджет, покажем реальные объекты и рассчитаем комплектацию — от коробки до инженерии и фасада.",
    primaryCta: "Получить расчёт кирпичного дома",
    secondaryCta: "Смотреть проекты",
    projectMaterial: "Кирпич",
    portfolioMaterial: "BRICK",
    highlightMaterial: "brick",
    factsIntro:
      "Строим кирпичные дома под ключ в Санкт-Петербурге и Ленинградской области. Проверяем конструктив, теплотехнику и узлы под кирпичную комплектацию, ведём стройку поэтапно и фиксируем состав работ в смете до договора.",
    catalogIntro:
      "В каталоге — проекты кирпичных домов с ценой под ключ: планировка, площадь и этажность. Любой проект можно адаптировать под участок, фасад и инженерию — затем сравнить комплектации и получить расчёт сметы.",
    catalogNote:
      "Кирпичный дом можно строить с ипотекой на ИЖС — подскажем по программам и этапам финансирования.",
    stepsIntro:
      "Кирпичный дом требует точного конструктива — сначала согласуем проект и смету, затем ведём стройку поэтапно с контролем узлов и фасада.",
    reviewsIntro:
      "Владельцы кирпичных домов отмечают комфорт круглый год, качество кладки и возможность увидеть аналогичные объекты на экскурсии.",
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
        question: "Можно ли адаптировать типовой проект под кирпич?",
        answer:
          "Да. Проверяем конструктив, толщину стен, узлы, фундамент и фасадные решения под выбранный материал.",
      },
      {
        question: "Подходит ли кирпич для постоянного проживания?",
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
    heroSubtitle:
      "Соберём ориентир за несколько шагов — материал, площадь, этажность и бюджет влияют на итог",
    heroMainCta: "Состав сметы",
    heroMainHref: "#includes",
    heroImageFallback: "/images/banner/banner-hero-02.png",
    eyebrow: "Цена · смета · калькулятор",
    lead:
      "Цена зависит не только от площади: материал, фундамент, кровля, инженерия и участок меняют итог. Соберём ориентир за несколько шагов и покажем, из чего складывается смета.",
    primaryCta: "Начать расчёт",
    secondaryCta: "Состав сметы",
    factsIntro:
      "Помогаем понять, из чего складывается стоимость дома под ключ: материал стен, фундамент, кровля, инженерия и участок. Ориентир — за несколько минут в квизе, точная смета — после консультации.",
    catalogIntro:
      "После расчёта можно выбрать типовой проект из каталога и сравнить комплектации — цена зависит не только от площади, но и от состава работ.",
    catalogNote:
      "Ипотека на ИЖС доступна — подскажем по программам после первичного расчёта.",
    stepsIntro:
      "Сначала собираем параметры в квизе, затем уточняем проект и участок, фиксируем смету в договоре и ведём стройку по графику.",
    reviewsIntro:
      "Заказчики ценят, что стоимость объясняют до договора — без скрытых работ и с понятным составом сметы.",
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
        answer: "Да. В квизе можно выбрать газобетон, кирпич или керамоблок и сравнить комплектации.",
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
      "Строительство домов из газобетона: проекты, стоимость, сравнение с кирпичом, портфолио и расчёт сметы.",
    h1: "Дом из газобетона под ключ: проекты, цена и комплектация",
    heroSubtitle:
      "Быстрая кладка, хорошая теплотехника и понятная смета — подберём проект под ваш участок",
    heroMainCta: "Проекты из газобетона",
    heroMainHref: "#projects",
    heroImageFallback: "/images/banner/banner-hero-04.png",
    eyebrow: "Газобетон · скорость и комфорт",
    lead:
      "Газобетон — популярный выбор для загородного дома. Здесь проекты под газобетонную комплектацию, сравнение материалов, реальные объекты и расчёт с понятной сметой.",
    primaryCta: "Рассчитать дом из газобетона",
    secondaryCta: "Проекты из газобетона",
    projectMaterial: "Газобетон",
    portfolioMaterial: "GAS_BLOCK",
    highlightMaterial: "gas",
    factsIntro:
      "Строим дома из газобетона под ключ в Санкт-Петербурге и Ленинградской области: подбираем проект, считаем теплотехнику, фасад и фундамент, ведём стройку с прозрачной сметой.",
    catalogIntro:
      "В каталоге — проекты с допуском газобетонной комплектации: площадь, этажность и цена под ключ. Любой проект можно адаптировать под участок и инженерию.",
    catalogNote:
      "Газобетонный дом можно строить с ипотекой на ИЖС — расскажем по программам на консультации.",
    stepsIntro:
      "Подбираем проект под газобетон, согласуем фасад и фундамент, фиксируем смету и ведём стройку с контролем узлов и теплотехники.",
    reviewsIntro:
      "Клиенты отмечают скорость возведения коробки, комфорт в доме и возможность сравнить материалы на экскурсии.",
    quizDefaults: { wallMaterial: "gas", serviceLabel: "LP: газобетон" },
    includes: [
      "Подбор проекта под газобетонную комплектацию",
      "Теплотехника, фасад и защита цоколя",
      "Сравнение с кирпичом и керамоблоком",
      "Ипотека и поэтапная оплата строительства",
    ],
    faq: [
      {
        question: "Газобетон подходит для круглогодичного проживания?",
        answer: "Да, при правильной толщине стен, фасаде и инженерии.",
      },
      {
        question: "Чем газобетон отличается от кирпичa по бюджету?",
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
    heroSubtitle:
      "Без лестниц — удобные планировки для семьи, прозрачная смета и выбор материала в одном квизе",
    heroMainCta: "Смотреть планировки",
    heroMainHref: "#projects",
    heroImageFallback: "/images/banner/banner-hero-05.png",
    eyebrow: "1 этаж · комфорт и бюджет",
    lead:
      "Одноэтажный дом — удобный формат для постоянного проживания: без лестниц, с продуманными планировками и прозрачной сметой под ваш бюджет.",
    primaryCta: "Подобрать одноэтажный проект",
    secondaryCta: "Смотреть планировки",
    projectMaxFloors: 1,
    factsIntro:
      "Строим одноэтажные дома под ключ в СПб и Ленинградской области: продуманные планировки без лестниц, выбор материала и прозрачная смета под ваш бюджет.",
    catalogIntro:
      "В каталоге — одноэтажные проекты до 150–220 м²: спальни, кухня-гостиная, террасы. Любой план можно адаптировать под участок и состав семьи.",
    catalogNote:
      "Одноэтажный дом можно оформить с ипотекой на ИЖС — подскажем по программам и этапам.",
    stepsIntro:
      "Подбираем одноэтажную планировку, согласуем материал и смету, затем ведём стройку с возможностью посмотреть аналогичные дома на объекте.",
    reviewsIntro:
      "Семьи выбирают одноэтажный формат за удобство планировки и отсутствие лестниц — на экскурсии можно оценить это вживую.",
    quizDefaults: { serviceLabel: "LP: одноэтажный дом" },
    includes: [
      "Подбор одноэтажных проектов до 150–220 м²",
      "Выбор материала: газобетон, кирпич, керамоблок",
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
        answer: "Газобетон, кирпич и керамоблок — сравним в квизе и на консультации.",
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
    heroSubtitle:
      "Каменная инерция и скорость блоковой кладки — подберём проект и комплектацию под ваш участок",
    heroMainCta: "Проекты из керамоблока",
    heroMainHref: "#projects",
    heroImageFallback: "/images/banner/banner-hero-06.png",
    eyebrow: "Керамоблок · камень и блок",
    lead:
      "Керамоблок сочетает инерцию кирпичa и скорость блоковой кладки. Подберём проект, сравним материалы и рассчитаем комплектацию под ваш участок.",
    primaryCta: "Получить расчёт по керамоблоку",
    secondaryCta: "Проекты из керамоблока",
    projectMaterial: "Керамический блок",
    portfolioMaterial: "CERAMIC_BLOCK",
    highlightMaterial: "ceramic",
    factsIntro:
      "Строим дома из керамоблока под ключ: проверяем конструктив под массу стен, подбираем фундамент и фасад, ведём стройку с прозрачной сметой.",
    catalogIntro:
      "В каталоге — проекты с допуском керамоблочной комплектации. Сравним с газобетоном и кирпичом по бюджету, скорости и комфорту.",
    catalogNote:
      "Керамоблочный дом можно строить с ипотекой — подскажем по программам после расчёта.",
    stepsIntro:
      "Согласуем проект под керамоблок, проверим узлы и фундамент, зафиксируем смету и проведём стройку с контролем качества кладки.",
    reviewsIntro:
      "Заказчики ценят «каменный» характер дома и возможность увидеть аналогичные решения на экскурсии.",
    quizDefaults: { wallMaterial: "ceramic", serviceLabel: "LP: керамоблок" },
    includes: [
      "Подбор проекта под керамоблочную комплектацию",
      "Сравнение с газобетоном и кирпичом",
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
        question: "Можно ли комбинировать с облицовочным кирпичом?",
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
    filtered = filtered.filter(
      (object) => normalizeBuiltObjectMaterialEnum(object.material) === config.portfolioMaterial
    );
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

function firstMediaUrl(
  media: Array<{ type: string; url: string }> | undefined,
): string | null {
  if (!media?.length) return null;
  return media.find((item) => item.type === "RENDER")?.url ?? media[0]?.url ?? null;
}

export function pickAdvertisingLandingHeroImage(
  config: AdvertisingLandingConfig,
  projects: HouseProjectItem[],
  portfolio: BuiltObjectItem[],
): string {
  const dedicated = config.heroImage?.trim();
  if (dedicated) return dedicated;

  const fromProject = firstMediaUrl(projects[0]?.media);
  if (fromProject) return fromProject;

  const fromPortfolio = firstMediaUrl(portfolio[0]?.media);
  if (fromPortfolio) return fromPortfolio;

  return config.heroImageFallback ?? "/images/banner/banner-hero-01.png";
}

export function advertisingLandingFactsIntro(config: AdvertisingLandingConfig): string {
  if (config.factsIntro) return config.factsIntro;
  return `Строим частные дома под ключ в ${CITY} и ${SERVICE_REGIONS}: от подбора проекта и сметы до организации работ на площадке и контроля качества. Прозрачная комплектация, понятные этапы и сопровождение на каждом шаге.`;
}

export function advertisingLandingCatalogIntro(config: AdvertisingLandingConfig): string {
  if (config.catalogIntro) return config.catalogIntro;
  return "В каталоге — типовые проекты с ценой и планировкой. Каждый дом можно адаптировать под участок, состав семьи и выбранный материал стен — затем передать в расчёт сметы.";
}

export function advertisingLandingCatalogNote(config: AdvertisingLandingConfig): string | null {
  if (config.catalogNote === "") return null;
  return (
    config.catalogNote ??
    "Строительство можно оформить с ипотекой на ИЖС — подскажем по программам и этапам финансирования."
  );
}


export function advertisingLandingTheme(config: AdvertisingLandingConfig): LpThemeId {
  return resolveLpTheme(config);
}

export function advertisingLandingSectionOrder(config: AdvertisingLandingConfig): LpSectionId[] {
  return config.sectionOrder ?? resolveLpSectionOrder(config);
}

import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Box,
  Boxes,
  BrickWall,
  Brush,
  Building2,
  DraftingCompass,
  Droplets,
  FileText,
  Flame,
  Grid2x2,
  Home,
  Landmark,
  Layers,
  LayoutGrid,
  Paintbrush,
  PanelTop,
  PanelsTopLeft,
  Eye,
  Ruler,
  ShieldCheck,
  ShowerHead,
  ThermometerSun,
  UtilityPole,
  Zap,
} from "lucide-react";

export type ServiceHubFeature = { Icon: LucideIcon; label: string };

export type ServiceHubCopy = {
  /** Короткий заголовок в левой колонке (верхний регистр в вёрстке) */
  navTitle: string;
  /** Развёрнутое описание на карточке справа */
  cardDescription: string;
  /** Полный текст раздела при переключении вкладки (несколько абзацев, как на странице услуги) */
  sectionParagraphs: string[];
  /** Подпункты с иконками */
  features: ServiceHubFeature[];
  /** Текст основной кнопки на карточке */
  ctaLabel: string;
  /** modal — форма заявки; link — страница услуги */
  ctaAction?: "modal" | "link";
  /** Изображение в центре секции (файл из `/public`, см. `hub-*` в `public/images/services/hub/`) */
  centerImageSrc?: string | null;
};

const hubBySlugSegment: Record<string, ServiceHubCopy> = {
  projecting: {
    navTitle: "Проектирование",
    cardDescription:
      "Именно на этапе проектирования определяется, каким будет будущий дом — от архитектуры и планировок до конструктивных и инженерных решений. Продуманный проект объединяет все элементы в единую систему и становится основой для последовательного строительства.",
    sectionParagraphs: [
      "Мы разрабатываем проектную документацию, объединяющую архитектурные, конструктивные и инженерные решения в единую систему, обеспечивающую последовательность и согласованность всех этапов строительства.",
    ],
    features: [
      { Icon: Building2, label: "Архитектурные решения" },
      { Icon: Grid2x2, label: "Планировки и объёмно-планировочные решения" },
      { Icon: FileText, label: "Рабочая документация" },
      { Icon: Box, label: "3D-визуализация и детализация" },
    ],
    ctaLabel: "Перейти к услуге",
    ctaAction: "link",
    centerImageSrc: "/images/services/hub/hub-projecting.png",
  },
  foundation: {
    navTitle: "Фундамент под ключ",
    cardDescription:
      "Фундамент — основа будущего дома, от которой зависят надёжность, долговечность и стабильность всей конструкции. Тип основания определяется индивидуально с учётом особенностей участка, инженерно-геологических условий, проекта дома и расчётных нагрузок.",
    sectionParagraphs: [
      "Мы выполняем устройство фундаментов в строгом соответствии с проектом, особенностями участка и строительными технологиями, уделяя внимание качеству каждого этапа работ. Такой подход обеспечивает прочную основу, необходимую для надёжного строительства и долговечной эксплуатации будущего дома.",
    ],
    features: [
      { Icon: Landmark, label: "Инженерно-геологические изыскания" },
      { Icon: Boxes, label: "Подготовка участка" },
      { Icon: BrickWall, label: "Устройство и армирование фундамента" },
      { Icon: Droplets, label: "Гидроизоляция и дренаж" },
    ],
    ctaLabel: "Перейти к услуге",
    ctaAction: "link",
    centerImageSrc: "/images/services/hub/hub-foundation.png",
  },
  karkas: {
    navTitle: "Возведение коробки дома",
    cardDescription:
      "На этапе возведения коробки будущий дом приобретает свои реальные формы. Выбранный материал стен, конструктивные решения и качество выполнения работ определяют прочность, долговечность и создают основу для последующих этапов строительства.",
    sectionParagraphs: [
      "Мы строим дома из газобетона, керамического блока и кирпича, помогая подобрать материал, который наилучшим образом соответствует архитектуре проекта, конструктивным требованиям, особенностям участка и пожеланиям заказчика. Независимо от выбранной технологии, все работы выполняются в строгом соответствии с проектной документацией и строительными технологиями, обеспечивая точное воплощение всех конструктивных решений, предусмотренных проектом.",
    ],
    features: [
      { Icon: BrickWall, label: "Материалы стен" },
      { Icon: LayoutGrid, label: "Несущие конструкции" },
      { Icon: Ruler, label: "Перекрытия и армопояса" },
      { Icon: BadgeCheck, label: "Контроль качества строительства" },
    ],
    ctaLabel: "Перейти к услуге",
    ctaAction: "link",
    centerImageSrc: "/images/services/hub/hub-foundation.png",
  },
  roofing: {
    navTitle: "Монтаж кровли",
    cardDescription:
      "Кровля завершает внешний конструктив дома, защищая его от воздействия окружающей среды. От качества её устройства зависят долговечность конструкций, энергоэффективность дома и комфорт его дальнейшей эксплуатации.",
    sectionParagraphs: [
      "Кровля — это сложная конструктивная система, в которой каждый элемент выполняет свою функцию. Мы реализуем кровельные системы в строгом соответствии с проектными решениями и строительными технологиями, обеспечивая их надёжность, долговечность и эффективную защиту дома на протяжении всего срока эксплуатации.",
    ],
    features: [
      { Icon: Home, label: "Стропильная система" },
      { Icon: Layers, label: "Кровельные материалы" },
      { Icon: ThermometerSun, label: "Кровельный пирог" },
      { Icon: ShieldCheck, label: "Узлы примыканий" },
      { Icon: ShowerHead, label: "Водосточная система" },
    ],
    ctaLabel: "Перейти к услуге",
    ctaAction: "link",
    centerImageSrc: "/images/services/hub/hub-roofing.png",
  },
  engineering: {
    navTitle: "Инженерные сети",
    cardDescription:
      "Инженерные системы делают дом комфортным, безопасным и функциональным для ежедневной жизни. От качества их проектирования и монтажа зависят удобство эксплуатации, стабильная работа всех коммуникаций и комфорт проживания на протяжении многих лет.",
    sectionParagraphs: [
      "Инженерные сети — это единая система, в которой каждый элемент выполняет свою функцию, обеспечивая стабильную и безопасную работу всех коммуникаций дома. Мы реализуем инженерные решения в строгом соответствии с проектной документацией и строительными технологиями, создавая надёжную основу для их эффективной эксплуатации.",
    ],
    features: [
      { Icon: Zap, label: "Электроснабжение" },
      { Icon: Droplets, label: "Водоснабжение и канализация" },
      { Icon: UtilityPole, label: "Отопление" },
      { Icon: Flame, label: "Котельная" },
    ],
    ctaLabel: "Перейти к услуге",
    ctaAction: "link",
    centerImageSrc: "/images/services/hub/hub-engineering.png",
  },
  finishing: {
    navTitle: "Внутренняя отделка под ключ",
    cardDescription:
      "Внутренняя отделка завершает создание дома, превращая его в пространство, полностью готовое для комфортной жизни. От качества отделочных работ зависят эстетика интерьера, удобство эксплуатации и общее восприятие будущего дома.",
    sectionParagraphs: [
      "Мы выполняем внутреннюю отделку в строгом соответствии с проектом, уделяя внимание качеству исполнения, точности каждой детали и единым стандартам выполнения работ. Такой подход позволяет создать интерьер, который полностью соответствует архитектурной концепции дома и ожиданиям заказчика.",
    ],
    features: [
      { Icon: PanelsTopLeft, label: "Подготовка поверхностей" },
      { Icon: Paintbrush, label: "Стены, полы и потолки" },
      { Icon: LayoutGrid, label: "Монтаж дверей и сантехники" },
      { Icon: PanelTop, label: "Финишная отделка" },
    ],
    ctaLabel: "Перейти к услуге",
    ctaAction: "link",
    centerImageSrc: "/images/services/hub/hub-finishing.png",
  },
};

export function slugSegmentFromServiceHref(slug: string): string {
  const path = slug.startsWith("/") ? slug : `/services/${slug}`;
  const seg = path.replace(/^\/services\/?/, "").split("/")[0];
  return seg || "";
}

const RU_HUB_SEGMENT_ALIASES: Record<string, string> = {
  proektirovanie: "projecting",
  fundament: "foundation",
  karkas: "karkas",
  krovlya: "roofing",
  inzheneriya: "engineering",
  otdelka: "finishing",
};

export function getServiceHubCopy(segment: string): ServiceHubCopy | null {
  const key = RU_HUB_SEGMENT_ALIASES[segment] ?? segment;
  return hubBySlugSegment[key] ?? null;
}

/** Кнопка «Обсудить…» открывает форму заявки; «Рассчитать…» ведёт на страницу услуги. */
export function resolveServiceHubCtaAction(hub: ServiceHubCopy | null): "modal" | "link" {
  if (!hub) return "link";
  if (hub.ctaAction) return hub.ctaAction;
  if (hub.ctaLabel.trim().startsWith("Обсудить")) return "modal";
  return "link";
}

export const BENEFITS_BAR = [
  { Icon: Layers, title: "Комплексный подход" },
  { Icon: BadgeCheck, title: "Контроль качества" },
  { Icon: Ruler, title: "Соблюдение сроков" },
  { Icon: Eye, title: "Прозрачность" },
] as const;

export const SERVICES_PROCESS_STEPS = [
  {
    Icon: DraftingCompass,
    title: "Проектирование",
    description: "Концепция, планы и рабочая документация.",
  },
  {
    Icon: Landmark,
    title: "Фундамент под ключ",
    description: "Основание под ваш участок и проект.",
  },
  {
    Icon: BrickWall,
    title: "Возведение стен",
    description: "Стены, перекрытия и несущие конструкции.",
  },
  {
    Icon: Home,
    title: "Монтаж кровли",
    description: "Узлы, утепление и покрытие.",
  },
  {
    Icon: Zap,
    title: "Инженерные сети",
    description: "Вода, отопление, вентиляция, электроснабжение.",
  },
  {
    Icon: Brush,
    title: "Отделка под ключ",
    description: "Внутренние работы до финиша.",
  },
  {
    Icon: BadgeCheck,
    title: "Сдача и подключение",
    description: "Приёмка и запуск систем.",
  },
] as const;

export const SERVICES_PAGE_STATS = [
  { value: "120+", label: "реализованных проектов" },
  { value: "100%", label: "довольных клиентов" },
  { value: "5 лет", label: "гарантии" },
  { value: "15+", label: "лет опыта команды" },
] as const;

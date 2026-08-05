import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Boxes,
  BrickWall,
  Brush,
  DraftingCompass,
  Droplets,
  FileStack,
  Flame,
  Home,
  Landmark,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Lightbulb,
  Paintbrush,
  PanelTop,
  PanelsTopLeft,
  Eye,
  Ruler,
  ShieldCheck,
  ShowerHead,
  ThermometerSun,
  UtilityPole,
  Wind,
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
      { Icon: LayoutTemplate, label: "Архитектурные решения" },
      { Icon: LayoutGrid, label: "Планировочные решения" },
      { Icon: FileStack, label: "Рабочая документация" },
      { Icon: DraftingCompass, label: "3D-визуализация" },
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
      "Стены, перекрытия и узлы сопряжения — возводим коробку по проекту с геодезией и поэтапной приёмкой.",
    sectionParagraphs: [
      "Собираем несущие конструкции по рабочей документации: материал стен, армирование, перемычки и опирание плит — с контролем геометрии и влажности кладки или монтажа блоков.",
      "Перекрытия и лестничные маршы монтируем с учётом нагрузок и будущей инженерии: закладные под коммуникации согласуем до бетонных работ.",
      "Промежуточная приёмка этапов фиксируется актами и фотоотчётом — чтобы переходить к кровле и инженерии без сюрпризов.",
    ],
    features: [
      { Icon: BrickWall, label: "Стены и армирование" },
      { Icon: LayoutGrid, label: "Перекрытия и ригели" },
      { Icon: Ruler, label: "Геодезия и плоскости" },
      { Icon: BadgeCheck, label: "Приёмка по чек-листу" },
    ],
    ctaLabel: "Обсудить коробку",
    ctaAction: "modal",
    centerImageSrc: "/images/services/hub/hub-foundation.png",
  },
  roofing: {
    navTitle: "Монтаж кровли",
    cardDescription:
      "Стропила, тепло- и пароизоляция, кровельный материал и водосток — узлы примыканий делаем так, чтобы кровля служила долго.",
    sectionParagraphs: [
      "Кровельный пирог собираем по проекту и климатической зоне: стропила, контробрешётка, утепление, паро- и гидроизоляция, обрешётка и финишное покрытие — металл, мягкая черепица или другой выбранный материал.",
      "Особое внимание — примыканиям к стенам, дымоходам и мансардным окнам: узлы делаем так, чтобы не было протечений и мостиков холода.",
      "Водосток и снегозадержание подбираем под архитектуру фасада и схему водоотвода участка — чтобы кровля выглядела цельно и служила годами.",
    ],
    features: [
      { Icon: Home, label: "Стропильная система" },
      { Icon: Layers, label: "Монтаж кровельного покрытия" },
      { Icon: ThermometerSun, label: "Утепление кровельного пирога" },
      { Icon: ShieldCheck, label: "Гидро- и пароизоляция" },
      { Icon: ShowerHead, label: "Водосточная система" },
    ],
    ctaLabel: "Рассчитать кровлю",
    centerImageSrc: "/images/services/hub/hub-roofing.png",
  },
  engineering: {
    navTitle: "Инженерные сети",
    cardDescription:
      "Электроснабжение, вода, канализация, отопление и вентиляция — проектируем разводку и сдаём системы в работу с понятной приёмкой.",
    sectionParagraphs: [
      "Инженерия — это «скрытая» часть комфорта: электрика с запасом по группам, вода и канализация с правильными уклонами, отопление и тёплые полы, вентиляция — всё проектируем до разводки и привязки к материалам стен.",
      "Монтаж ведём поэтапно с промежуточными проверками: опрессовка, изоляция, заземление — чтобы при сдаче дома не искать неисправности за отделкой.",
      "Перед финальной отделкой вы получаете понятную схему щитов и разводки — это упрощает обслуживание и любые доработки в будущем.",
    ],
    features: [
      { Icon: Zap, label: "Электроснабжение" },
      { Icon: Droplets, label: "Водоснабжение" },
      { Icon: UtilityPole, label: "Канализация" },
      { Icon: Flame, label: "Отопление и тёплый пол" },
      { Icon: Wind, label: "Вентиляция" },
    ],
    ctaLabel: "Рассчитать инженерные сети",
    centerImageSrc: "/images/services/hub/hub-engineering.png",
  },
  finishing: {
    navTitle: "Отделка под ключ",
    cardDescription:
      "Черновая и чистовая отделка, полы и потолки, свет и финальная приёмка — чтобы вы заехали в готовый дом без хаоса на площадке.",
    sectionParagraphs: [
      "Отделка под ключ — это последовательность слоёв и сроков: штукатурка и стяжка, подготовка под чистовые материалы, покраска или обои, полы, потолки, двери и свет.",
      "Комплектацию согласовываем заранее: каталоги отделки, сантехника, фурнитура — чтобы не было пауз из‑за ожидания поставок и чтобы заранее попадать в бюджет.",
      "Финальную приёмку делаем по чек-листу: поверхности, фурнитура, сантехника и освещение — вы принимаете готовый интерьер без спешки.",
    ],
    features: [
      { Icon: PanelsTopLeft, label: "Черновая отделка" },
      { Icon: Paintbrush, label: "Чистовая отделка" },
      { Icon: LayoutGrid, label: "Полы и напольные покрытия" },
      { Icon: PanelTop, label: "Потолки и стены" },
      { Icon: Lightbulb, label: "Освещение и навеска" },
    ],
    ctaLabel: "Обсудить отделку",
    ctaAction: "modal",
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

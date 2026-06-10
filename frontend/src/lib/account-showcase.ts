import type { ResolvedSiteTheme } from "@/lib/theme-preference";

export type AccountShowcaseImages = {
  light: string;
  dark: string;
};

export type AccountShowcaseItem = {
  id: "dashboard" | "stages" | "photos" | "documents" | "payments" | "support" | "notifications";
  /** Название раздела в интерфейсе кабинета (на скрине) — в заголовок карточки не выводим. */
  title: string;
  index: string;
  headline: string;
  description: string;
  image: string;
  images?: AccountShowcaseImages;
  metrics: readonly string[];
  points: readonly string[];
};

export const ACCOUNT_SHOWCASE_ITEMS: readonly AccountShowcaseItem[] = [
  {
    id: "dashboard",
    title: "Главная",
    index: "01",
    headline: "Обзор объекта",
    description: "На одном экране — прогресс стройки, ближайшие платежи, свежие фото и документы, которые требуют внимания.",
    image: "/images/account/showcase-dashboard-light.png",
    images: {
      light: "/images/account/showcase-dashboard-light.png",
      dark: "/images/account/showcase-dashboard-dark.png",
    },
    metrics: ["Прогресс", "Платежи", "Новое"],
    points: ["Карточка объекта", "Полоска этапов", "Блоки «требует внимания»"],
  },
  {
    id: "stages",
    title: "Этапы строительства",
    index: "02",
    headline: "Контроль сроков",
    description: "Клиент видит, на каком этапе объект сейчас, что уже принято и какие работы идут дальше.",
    image: "/images/account/showcase-stages-light.png",
    images: {
      light: "/images/account/showcase-stages-light.png",
      dark: "/images/account/showcase-stages-dark.png",
    },
    metrics: ["Фундамент", "Стены", "Кровля"],
    points: ["Статусы этапов", "План ближайших работ", "История изменений"],
  },
  {
    id: "photos",
    title: "Фотоотчёты",
    index: "03",
    headline: "Прозрачный прогресс",
    description: "Фото с объекта собираются по датам и этапам, чтобы заказчик видел реальную динамику стройки.",
    image: "/images/account/showcase-photos-light.png",
    images: {
      light: "/images/account/showcase-photos-light.png",
      dark: "/images/account/showcase-photos-dark.png",
    },
    metrics: ["Новые фото", "Подписи", "Архив"],
    points: ["Отчёты с объекта", "Пояснения прораба", "Удобная галерея"],
  },
  {
    id: "documents",
    title: "Документы",
    index: "04",
    headline: "Порядок в бумагах",
    description: "Договоры, акты и важные файлы лежат в одном защищённом кабинете, без поиска по чатам.",
    image: "/images/account/showcase-documents-light.png",
    images: {
      light: "/images/account/showcase-documents-light.png",
      dark: "/images/account/showcase-documents-dark.png",
    },
    metrics: ["Договор", "Акты", "Файлы"],
    points: ["Скачивание документов", "Актуальные версии", "Хранение по объекту"],
  },
  {
    id: "payments",
    title: "Платежи",
    index: "05",
    headline: "Финансовая ясность",
    description: "График платежей, ближайшая оплата и история фиксируются в кабинете, чтобы бюджет был понятен.",
    image: "/images/account/showcase-payments-light.png",
    images: {
      light: "/images/account/showcase-payments-light.png",
      dark: "/images/account/showcase-payments-dark.png",
    },
    metrics: ["График", "Суммы", "История"],
    points: ["Ближайший платёж", "План оплат", "Прозрачная смета"],
  },
  {
    id: "support",
    title: "Обращения",
    index: "06",
    headline: "Связь с компанией",
    description: "Вопросы по объекту — прямо из кабинета: обращение попадает в ту же цепочку, что и заявки с сайта.",
    image: "/images/account/showcase-support-light.png",
    images: {
      light: "/images/account/showcase-support-light.png",
      dark: "/images/account/showcase-support-dark.png",
    },
    metrics: ["Тикеты", "Ответы", "История"],
    points: ["Новое обращение", "Статус ответа", "Переписка по объекту"],
  },
  {
    id: "notifications",
    title: "Уведомления",
    index: "07",
    headline: "Ничего не пропустить",
    description: "Этапы, документы, платежи и ответы поддержки — все события собираются в одном центре уведомлений.",
    image: "/images/account/showcase-notifications-light.png",
    images: {
      light: "/images/account/showcase-notifications-light.png",
      dark: "/images/account/showcase-notifications-dark.png",
    },
    metrics: ["Этапы", "Документы", "Платежи"],
    points: ["Лента событий", "Быстрые переходы", "Непрочитанные метки"],
  },
] as const;

export function accountShowcaseHeadlines(items = ACCOUNT_SHOWCASE_ITEMS): string[] {
  return items.map((item) => item.headline);
}

export function accountShowcaseTitles(items = ACCOUNT_SHOWCASE_ITEMS): string[] {
  return items.map((item) => item.title);
}

export function resolveAccountShowcaseImage(
  item: Pick<AccountShowcaseItem, "image" | "images">,
  theme: ResolvedSiteTheme = "light",
): string {
  if (item.images) {
    return theme === "dark" ? item.images.dark : item.images.light;
  }
  return item.image;
}

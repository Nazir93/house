import {
  Bell,
  CalendarCheck,
  CreditCard,
  FileText,
  Images,
  LayoutDashboard,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import type { ResolvedSiteTheme } from "@/lib/theme-preference";

export type AccountShowcaseImages = {
  light: string;
  dark: string;
};

export type AccountShowcaseItem = {
  id: "dashboard" | "stages" | "photos" | "documents" | "payments" | "support" | "notifications";
  title: string;
  kicker: string;
  description: string;
  image: string;
  images?: AccountShowcaseImages;
  Icon: LucideIcon;
  accent: string;
  metrics: readonly string[];
  points: readonly string[];
};

export const ACCOUNT_SHOWCASE_ITEMS: readonly AccountShowcaseItem[] = [
  {
    id: "dashboard",
    title: "Главная",
    kicker: "01 · обзор объекта",
    description: "На одном экране — прогресс стройки, ближайшие платежи, свежие фото и документы, которые требуют внимания.",
    image: "/images/account/showcase-dashboard-light.png",
    images: {
      light: "/images/account/showcase-dashboard-light.png",
      dark: "/images/account/showcase-dashboard-dark.png",
    },
    Icon: LayoutDashboard,
    accent: "#86efac",
    metrics: ["Прогресс", "Платежи", "Новое"],
    points: ["Карточка объекта", "Полоска этапов", "Блоки «требует внимания»"],
  },
  {
    id: "stages",
    title: "Этапы строительства",
    kicker: "02 · контроль сроков",
    description: "Клиент видит, на каком этапе объект сейчас, что уже принято и какие работы идут дальше.",
    image: "/images/account/showcase-stages-light.png",
    images: {
      light: "/images/account/showcase-stages-light.png",
      dark: "/images/account/showcase-stages-dark.png",
    },
    Icon: CalendarCheck,
    accent: "#7dd3a8",
    metrics: ["Фундамент", "Стены", "Кровля"],
    points: ["Статусы этапов", "План ближайших работ", "История изменений"],
  },
  {
    id: "photos",
    title: "Фотоотчёты",
    kicker: "03 · прозрачный прогресс",
    description: "Фото с объекта собираются по датам и этапам, чтобы заказчик видел реальную динамику стройки.",
    image: "/images/account/showcase-photos-light.png",
    images: {
      light: "/images/account/showcase-photos-light.png",
      dark: "/images/account/showcase-photos-dark.png",
    },
    Icon: Images,
    accent: "#93c5fd",
    metrics: ["Новые фото", "Подписи", "Архив"],
    points: ["Отчёты с объекта", "Пояснения прораба", "Удобная галерея"],
  },
  {
    id: "documents",
    title: "Документы",
    kicker: "04 · порядок в бумагах",
    description: "Договоры, акты и важные файлы лежат в одном защищённом кабинете, без поиска по чатам.",
    image: "/images/account/showcase-documents-light.png",
    images: {
      light: "/images/account/showcase-documents-light.png",
      dark: "/images/account/showcase-documents-dark.png",
    },
    Icon: FileText,
    accent: "#facc15",
    metrics: ["Договор", "Акты", "Файлы"],
    points: ["Скачивание документов", "Актуальные версии", "Хранение по объекту"],
  },
  {
    id: "payments",
    title: "Платежи",
    kicker: "05 · финансовая ясность",
    description: "График платежей, ближайшая оплата и история фиксируются в кабинете, чтобы бюджет был понятен.",
    image: "/images/account/showcase-payments-light.png",
    images: {
      light: "/images/account/showcase-payments-light.png",
      dark: "/images/account/showcase-payments-dark.png",
    },
    Icon: CreditCard,
    accent: "#fca5a5",
    metrics: ["График", "Суммы", "История"],
    points: ["Ближайший платёж", "План оплат", "Прозрачная смета"],
  },
  {
    id: "support",
    title: "Обращения",
    kicker: "06 · связь с компанией",
    description: "Вопросы по объекту — прямо из кабинета: обращение попадает в ту же цепочку, что и заявки с сайта.",
    image: "/images/account/showcase-support-light.png",
    images: {
      light: "/images/account/showcase-support-light.png",
      dark: "/images/account/showcase-support-dark.png",
    },
    Icon: MessageCircle,
    accent: "#fdba74",
    metrics: ["Тикеты", "Ответы", "История"],
    points: ["Новое обращение", "Статус ответа", "Переписка по объекту"],
  },
  {
    id: "notifications",
    title: "Уведомления",
    kicker: "07 · ничего не пропустить",
    description: "Этапы, документы, платежи и ответы поддержки — все события собираются в одном центре уведомлений.",
    image: "/images/account/showcase-notifications-light.png",
    images: {
      light: "/images/account/showcase-notifications-light.png",
      dark: "/images/account/showcase-notifications-dark.png",
    },
    Icon: Bell,
    accent: "#67e8f9",
    metrics: ["Этапы", "Документы", "Платежи"],
    points: ["Лента событий", "Быстрые переходы", "Непрочитанные метки"],
  },
] as const;

export function accountShowcaseTitles(items = ACCOUNT_SHOWCASE_ITEMS): string[] {
  return items.map((item) => item.title);
}

export function resolveAccountShowcaseImage(
  item: AccountShowcaseItem,
  theme: ResolvedSiteTheme = "light",
): string {
  if (item.images) {
    return theme === "dark" ? item.images.dark : item.images.light;
  }
  return item.image;
}

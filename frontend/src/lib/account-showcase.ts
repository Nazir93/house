import { CalendarCheck, CreditCard, FileText, Images, type LucideIcon } from "lucide-react";

export type AccountShowcaseItem = {
  id: "stages" | "photos" | "documents" | "payments";
  title: string;
  kicker: string;
  description: string;
  image: string;
  Icon: LucideIcon;
  accent: string;
  metrics: readonly string[];
  points: readonly string[];
};

export const ACCOUNT_SHOWCASE_ITEMS: readonly AccountShowcaseItem[] = [
  {
    id: "stages",
    title: "Этапы строительства",
    kicker: "01 · контроль сроков",
    description: "Клиент видит, на каком этапе объект сейчас, что уже принято и какие работы идут дальше.",
    image: "/images/banner/banner-hero-05.png",
    Icon: CalendarCheck,
    accent: "#7dd3a8",
    metrics: ["Фундамент", "Стены", "Кровля"],
    points: ["Статусы этапов", "План ближайших работ", "История изменений"],
  },
  {
    id: "photos",
    title: "Фотоотчёты",
    kicker: "02 · прозрачный прогресс",
    description: "Фото с объекта собираются по датам и этапам, чтобы заказчик видел реальную динамику стройки.",
    image: "/images/banner/banner-hero-06.png",
    Icon: Images,
    accent: "#93c5fd",
    metrics: ["Новые фото", "Подписи", "Архив"],
    points: ["Отчёты с объекта", "Пояснения прораба", "Удобная галерея"],
  },
  {
    id: "documents",
    title: "Документы",
    kicker: "03 · порядок в бумагах",
    description: "Договоры, акты и важные файлы лежат в одном защищённом кабинете, без поиска по чатам.",
    image: "/images/banner/banner-hero-03.png",
    Icon: FileText,
    accent: "#facc15",
    metrics: ["Договор", "Акты", "Файлы"],
    points: ["Скачивание документов", "Актуальные версии", "Хранение по объекту"],
  },
  {
    id: "payments",
    title: "Платежи",
    kicker: "04 · финансовая ясность",
    description: "График платежей, ближайшая оплата и история фиксируются в кабинете, чтобы бюджет был понятен.",
    image: "/images/banner/banner-hero-01.png",
    Icon: CreditCard,
    accent: "#fca5a5",
    metrics: ["График", "Суммы", "История"],
    points: ["Ближайший платёж", "План оплат", "Прозрачная смета"],
  },
] as const;

export function accountShowcaseTitles(items = ACCOUNT_SHOWCASE_ITEMS): string[] {
  return items.map((item) => item.title);
}

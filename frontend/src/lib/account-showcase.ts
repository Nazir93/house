import type { ResolvedSiteTheme } from "@/lib/theme-preference";

export const ACCOUNT_SHOWCASE_SECTION_EYEBROW = "Личный кабинет клиента";

export const ACCOUNT_SHOWCASE_SECTION_TITLE = "Стройка под контролем — в одном личном кабинете";

export const ACCOUNT_SHOWCASE_SECTION_INTRO =
  "Личный кабинет помогает видеть ход строительства в одном месте: этапы работ, фотоотчёты, документы и платежи по проекту. Клиент понимает, что происходит на объекте, какие работы выполнены, что запланировано дальше, а также может получать и подписывать документы удалённо.";

export const ACCOUNT_SHOWCASE_SECTION_CALLOUT =
  "«Всё важное по проекту — под рукой. Этапы, документы, платежи и фотоотчёты сохраняются в личном кабинете, чтобы к ним можно было вернуться в любой момент.»";

export const ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT =
  "Мы считаем, что современное строительство — это не только качественный дом, но и понятный, открытый процесс для клиента.";

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
    headline: "Обзор проекта",
    description:
      "На одном экране — ключевая информация по дому: этапы строительства, прогресс работ, ближайшие платежи, свежие фотоотчёты и документы по проекту.",
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
    headline: "Этапы под контролем",
    description:
      "Клиент видит, на каком этапе находится строительство, какие работы уже выполнены и что запланировано дальше.",
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
    headline: "Фотоотчёты по этапам",
    description:
      "Фото с объекта сохраняются по этапам строительства, чтобы клиент видел реальный ход работ и качество выполненных решений.",
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
    headline: "Документы в одном месте",
    description:
      "Договоры, акты и другие документы всегда доступны в личном кабинете. Их можно просматривать, скачивать и подписывать удалённо.",
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
    description:
      "Стоимость строительства разбита по этапам. В личном кабинете всегда доступны график платежей, история оплат и информация о ближайшем платеже.",
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
    description:
      "Любой вопрос по строительству можно задать прямо в личном кабинете. Все обращения сохраняются в истории проекта, чтобы важная информация всегда была под рукой.",
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
    headline: "Всё важное — в одном месте",
    description:
      "Центр уведомлений помогает не пропустить новые этапы строительства, документы, платежи и ответы нашей команды.",
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

/**
 * Карусель на экране входа в ЛК — те же визуалы, что блок «Личный кабинет» на главной.
 */

export type AccountLoginShowcaseSlide = {
  title: string;
  text: string;
  /** Скрин из `/images/account/showcase-*-light.png` (как на главной). */
  image: string;
  icon: "stages" | "documents" | "photos" | "support";
  features: readonly string[];
};

export const ACCOUNT_LOGIN_SHOWCASE_SLIDES: readonly AccountLoginShowcaseSlide[] = [
  {
    title: "Этапы и сроки",
    text: "Видно, на чём идёт стройка: этапы, график и статусы — без лишних звонков вам.",
    image: "/images/account/showcase-stages-light.png",
    icon: "stages",
    features: ["График работ", "Статусы этапов", "План ближайших задач"],
  },
  {
    title: "Документы и оплаты",
    text: "Договор, акты, график платежей — в одном месте, когда удобно вам.",
    image: "/images/account/showcase-documents-light.png",
    icon: "documents",
    features: ["Договор и акты", "График платежей", "История оплат"],
  },
  {
    title: "Фотоотчёты и история работ",
    text: "Смотрите, как продвигается строительство: новые фото, подписи к этапам и вся история объекта в одном месте.",
    image: "/images/account/showcase-photos-light.png",
    icon: "photos",
    features: ["Фото по этапам", "Подписи прораба", "Архив прогресса"],
  },
  {
    title: "Вопросы и поддержка",
    text: "Напишите нам из кабинета — ответ по обращению уйдёт в ту же цепочку, что и с сайта.",
    image: "/images/account/showcase-support-light.png",
    icon: "support",
    features: ["Обращения", "Ответы в одной цепочке", "Уведомления"],
  },
] as const;

export function accountLoginShowcaseImages(
  slides: readonly AccountLoginShowcaseSlide[] = ACCOUNT_LOGIN_SHOWCASE_SLIDES,
): string[] {
  return slides.map((s) => s.image);
}

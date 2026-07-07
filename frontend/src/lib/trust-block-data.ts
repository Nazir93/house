import type { LucideIcon } from "lucide-react";
import { Award, Home, ShieldCheck } from "lucide-react";

export const TRUST_SECTION_EYEBROW = "Нам доверяют";

export const TRUST_SECTION_TITLE =
  "Доверие строится так же, как и дом — на продуманных решениях и ответственности";

/** Две строки заголовка для вёрстки на главной */
export const TRUST_SECTION_TITLE_LINES = [
  "Доверие строится так же, как и дом — на продуманных решениях и",
  "ответственности",
] as const;

export const TRUST_SECTION_INTRO =
  "Мы понимаем, что строительство дома — одно из самых важных решений в жизни семьи. Поэтому делаем процесс понятным, последовательным и открытым: заранее обсуждаем стоимость, сопровождаем проект на каждом этапе и используем материалы проверенных производителей.";

export const TRUST_WHY_EYEBROW = "Почему нас выбирают";

export const TRUST_WHY_TITLE = "Когда каждый этап понятен, строить гораздо спокойнее";

export const TRUST_WHY_TITLE_LINES = [
  "Когда каждый этап понятен, строить гораздо",
  "спокойнее",
] as const;

export const TRUST_WHY_INTRO =
  "Мы считаем, что качественный дом начинается не только с хорошего проекта, но и с понятного процесса. Поэтому клиент всегда знает, что происходит на объекте, какие работы уже выполнены и какие этапы предстоят дальше.";

export type TrustBenefit = {
  title: string;
  description: string;
};

export const TRUST_BENEFITS: TrustBenefit[] = [
  { title: "Честная смета", description: "Без скрытых доплат." },
  { title: "Личный менеджер", description: "На всём протяжении проекта." },
  { title: "Проектирование и строительство", description: "В одной команде" },
];

export const TRUST_STATS: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint?: string;
}[] = [
  {
    icon: Award,
    value: "10+",
    label: "Лет опыта команды",
  },
  {
    icon: Home,
    value: "85+",
    label: "Домов в опыте команды",
  },
  {
    icon: ShieldCheck,
    value: "5 лет",
    label: "Гарантии на конструктив",
  },
];

export const TRUST_SECTION_QUOTE =
  "Мы создаём дом так, чтобы человек чувствовал уверенность на всём пути строительства.";

export const TRUST_SECTION_QUOTE_ATTRIBUTION = "ООО «Часть Души»";

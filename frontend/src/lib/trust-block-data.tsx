import type { LucideIcon } from "lucide-react";
import { Home, MapPinned, Percent, ShieldCheck } from "lucide-react";

export const TRUST_STATS: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint: string;
}[] = [
  {
    icon: Home,
    value: "540+",
    label: "Построенных домов",
    hint: "с 2016 года",
  },
  {
    icon: MapPinned,
    value: "6",
    label: "Регионов присутствия",
    hint: "От Ленинградской области до Москвы",
  },
  {
    icon: Percent,
    value: "от 3%",
    label: "Ипотечные программы",
    hint: "Помогаем с пакетом документов",
  },
  {
    icon: ShieldCheck,
    value: "По договору",
    label: "Гарантии на работы",
    hint: "Фиксируем объём и этапы",
  },
];

export const TRUST_HIGHLIGHTS = [
  "Прозрачная смета без скрытых позиций",
  "Личный менеджер и контроль сроков",
  "Типовые и индивидуальные проекты под участок",
];

import type { WallMaterialId } from "@/lib/house-construction-calculator";

export const LP_QUIZ_ALL_STEPS = [
  { id: "material", title: "Материал стен", summary: "материал" },
  { id: "area", title: "Площадь дома", summary: "площадь" },
  { id: "floors", title: "Этажность", summary: "этажность" },
  { id: "budget", title: "Ориентир по бюджету", summary: "бюджет" },
  { id: "mortgage", title: "Ипотека", summary: "ипотека" },
  { id: "contact", title: "Контакты", summary: "контакты" },
] as const;

export type LpQuizStepId = (typeof LP_QUIZ_ALL_STEPS)[number]["id"];
export type LpQuizStep = (typeof LP_QUIZ_ALL_STEPS)[number];

/**
 * Если материал уже задан лендингом (кирпич / газобетон / керамоблок) —
 * шаг «Материал стен» не показываем; в заявку уходит preset.
 */
export function resolveLpQuizSteps(wallMaterialPreset?: WallMaterialId | null): LpQuizStep[] {
  if (wallMaterialPreset) {
    return LP_QUIZ_ALL_STEPS.filter((step) => step.id !== "material");
  }
  return [...LP_QUIZ_ALL_STEPS];
}

/** Текст слева от квиза: «5 шагов: площадь, этажность…». */
export function lpQuizStepsBlurb(steps: ReadonlyArray<{ summary: string }>): string {
  const n = steps.length;
  const list = steps.map((s) => s.summary).join(", ");
  const lastComma = list.lastIndexOf(", ");
  const readable =
    lastComma === -1 ? list : `${list.slice(0, lastComma)} и ${list.slice(lastComma + 2)}`;
  return `${n} ${pluralSteps(n)}: ${readable}.`;
}

function pluralSteps(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "шаг";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "шага";
  return "шагов";
}

/** Подписи и подсказки для админки калькулятора проектов. */

export const CALCULATOR_GROUP_LABELS: Record<string, string> = {
  construction: "Стройопции",
  engineering: "Инженерия",
  facade: "Фасады (массово)",
  shell: "Коробка (все категории)",
};

export const CALCULATOR_WALL_LABELS: Record<string, string> = {
  gas: "Газобетон",
  ceramic: "Керамоблок",
  brick: "Кирпич",
};

export const CALCULATOR_CATEGORY_SHORT: Record<string, string> = {
  a: "1 эт., двухскатная",
  b: "1 эт., трёхскатная",
  c: "1 эт., четырёхскатная",
  d: "Мансарда, двухскатная",
  e: "Мансарда, трёхскатная",
  f: "2 эт., четырёхскатная",
  g: "2 эт., двухскатная (цены как f)",
  h: "2 эт., трёхскатная (цены как f)",
  i: "1 эт., плоская (цены как c)",
  j: "2 эт., плоская (цены как f)",
};

export function calculatorCategoryTitle(id: string, labelRu?: string): string {
  const short = CALCULATOR_CATEGORY_SHORT[id];
  if (labelRu?.trim()) return `Категория ${id} — ${labelRu}`;
  if (short) return `Категория ${id} — ${short}`;
  return `Категория ${id}`;
}

export type CalculatorEditorLoadOptions = {
  /** Без full-page spinner — форма не размонтируется, скролл остаётся на месте. */
  silent?: boolean;
};

/** Первая загрузка — со спиннером; после сохранения — тихо, иначе страница прыгает вверх. */
export function calculatorEditorLoadOptions(
  reason: "initial" | "after-save",
): CalculatorEditorLoadOptions {
  return { silent: reason === "after-save" };
}

export function shouldBlankCalculatorEditorOnLoad(
  opts?: CalculatorEditorLoadOptions,
): boolean {
  return opts?.silent !== true;
}

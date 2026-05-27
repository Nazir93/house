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
};

export function calculatorCategoryTitle(id: string, labelRu?: string): string {
  const short = CALCULATOR_CATEGORY_SHORT[id];
  if (labelRu?.trim()) return `Категория ${id} — ${labelRu}`;
  if (short) return `Категория ${id} — ${short}`;
  return `Категория ${id}`;
}

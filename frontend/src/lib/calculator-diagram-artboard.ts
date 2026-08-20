/**
 * Подложка только под картинки схем опций/этапов (не под весь блок «Состав работ»).
 * Белая — на тёмной теме скрывает шахматку вокруг PNG.
 */
export const CALCULATOR_DIAGRAM_ARTBOARD = "#ffffff";

/**
 * Временно скрываем схемы только в «Отделка фасада» —
 * пока PNG плохо выглядят на тёмной теме. Включить: `true`.
 */
export const SHOW_CALCULATOR_FACADE_WORK_IMAGES = false;

/** URL картинки для блока «Состав работ» (с опциональным скрытием). */
export function calculatorOptionWorkImageUrl(
  imageUrl?: string | null,
  opts?: { hideImage?: boolean },
): string {
  if (opts?.hideImage) return "";
  return imageUrl?.trim() || "";
}

/** Есть ли что показать в «Состав работ» (текст и/или картинка). */
export function hasCalculatorOptionWorkDetail(input: {
  description?: string | null;
  imageUrl?: string | null;
  hideImage?: boolean;
}): boolean {
  return Boolean(
    input.description?.trim() ||
      calculatorOptionWorkImageUrl(input.imageUrl, { hideImage: input.hideImage }),
  );
}

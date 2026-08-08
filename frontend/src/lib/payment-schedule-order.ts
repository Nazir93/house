import { moveListItem } from "@/lib/reorder-list";

/** Порядок строк графика = позиция в массиве (после импорта/ручной перестановки). */
export function reindexPaymentScheduleRows<T extends { order: number }>(rows: readonly T[]): T[] {
  return rows.map((row, index) => ({ ...row, order: index }));
}

/** Сдвиг строки на одну позицию вверх/вниз с пересчётом order. */
export function movePaymentScheduleRow<T extends { order: number }>(
  rows: readonly T[],
  fromIndex: number,
  direction: -1 | 1
): T[] {
  return reindexPaymentScheduleRows(moveListItem(rows, fromIndex, fromIndex + direction));
}

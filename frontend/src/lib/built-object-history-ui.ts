/**
 * История строительства: эксклюзивный аккордеон (один открытый этап).
 * Вертикальный список вместо сетки — нет «дыр» рядом с раскрытой карточкой.
 */
export function toggleExclusiveHistoryStage(
  openId: string | null,
  clickedId: string,
): string | null {
  return openId === clickedId ? null : clickedId;
}

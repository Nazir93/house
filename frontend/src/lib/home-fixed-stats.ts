/** Финальное значение нижней панели статистики — в HTML сразу, без счётчика с нуля. */
export function formatHomeFixedStatValue(value: number, suffix = ""): string {
  return `${value.toLocaleString("ru-RU")}${suffix}`;
}

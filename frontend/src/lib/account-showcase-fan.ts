/**
 * Сборка sticky-карточек ЛК на главной «веером» (как карты в руке),
 * а не ровной колодой.
 */
export type AccountShowcaseFanStyle = {
  rotateDeg: number;
  translateXPx: number;
  topOffsetPx: number;
};

export function accountShowcaseFanStyle(index: number, total: number): AccountShowcaseFanStyle {
  const n = Math.max(1, Math.floor(total));
  const i = Math.min(Math.max(0, Math.floor(index)), n - 1);
  const mid = (n - 1) / 2;
  const fromMid = i - mid;

  return {
    rotateDeg: Number((fromMid * 1.65).toFixed(2)),
    translateXPx: Math.round(fromMid * 16),
    topOffsetPx: i * 12,
  };
}

export function accountShowcaseFanCssTransform(style: AccountShowcaseFanStyle): string {
  return `rotate(${style.rotateDeg}deg) translate3d(${style.translateXPx}px, 0, 0)`;
}

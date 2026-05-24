/** Прогресс 0…1 по scroll-контейнеру timeline-секции. */
export function computeSectionScrollProgress(
  rectTop: number,
  sectionHeight: number,
  viewportHeight: number
): number {
  const scrollRange = Math.max(sectionHeight - viewportHeight * 0.35, 1);
  const scrolled = -rectTop + viewportHeight * 0.15;
  return Math.max(0, Math.min(scrolled / scrollRange, 1));
}

/** Прогресс 0…1 по всей story-зоне (hero + timeline). */
export function computeTrackScrollProgress(
  trackTop: number,
  trackHeight: number,
  viewportHeight: number
): number {
  const scrollRange = Math.max(trackHeight - viewportHeight * 0.35, 1);
  const scrolled = -trackTop + viewportHeight * 0.15;
  return Math.max(0, Math.min(scrolled / scrollRange, 1));
}

/** Высота scroll-участка на один блок. */
export const STORY_BEAT_SCROLL_VH = 65;

/** Минимальная видимая линия от hero (px). */
export const STORY_SPINE_LEAD_IN_PX = 80;

export function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(t, 1));
  return 1 - (1 - x) ** 3;
}

/** Длина вертикальной линии в px: просто растёт вместе со скроллом. */
export function computeLineHeightPx(
  progress: number,
  originY: number,
  trackHeight: number,
  leadInPx = STORY_SPINE_LEAD_IN_PX
): number {
  const maxLen = Math.max(trackHeight - originY, 0);
  if (maxLen <= 0) return 0;
  return Math.max(leadInPx, progress * maxLen);
}

/**
 * Появление блока 0…1.
 * Первые ~35% слота — линия доходит, затем открывается раздел.
 */
export function computeBeatReveal(progress: number, index: number, total: number): number {
  if (total <= 0) return 0;
  const slot = 1 / total;
  const revealStart = index * slot + slot * 0.35;
  const revealEnd = (index + 1) * slot;
  if (progress <= revealStart) return 0;
  if (progress >= revealEnd) return 1;
  return easeOutCubic((progress - revealStart) / (revealEnd - revealStart));
}

/** Индекс активного блока. */
export function computeActiveBeatIndex(progress: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, Math.floor(progress * total)), total - 1);
}

/** @deprecated */
export type BeatAnimationState = {
  verticalProgress: number;
  branchProgress: number;
  contentProgress: number;
};

/** @deprecated */
export function computeBeatLocalProgress(sectionProgress: number, index: number, total: number): number {
  if (total <= 0) return 0;
  return sectionProgress * total - index;
}

/** @deprecated */
export function computeBeatAnimationState(
  sectionProgress: number,
  index: number,
  total: number
): BeatAnimationState {
  const reveal = computeBeatReveal(sectionProgress, index, total);
  return { verticalProgress: reveal, branchProgress: reveal, contentProgress: reveal };
}

/** @deprecated */
export function computeSpineProgress(sectionProgress: number, total: number): number {
  return sectionProgress;
}

/** @deprecated */
export function computeSpineVisibleLengthPx(
  trackProgress: number,
  beatCount: number,
  originToNodeSpanPx: number,
  leadInPx = STORY_SPINE_LEAD_IN_PX
): number {
  return computeLineHeightPx(trackProgress, 0, originToNodeSpanPx + leadInPx, leadInPx);
}

/** @deprecated */
export function computeBeatRevealProgress(sectionProgress: number, index: number, total: number): number {
  return computeBeatReveal(sectionProgress, index, total);
}

export const BEAT_VERTICAL_END = 0.35;
export const BEAT_BRANCH_END = 0.35;

import { STORY_SPINE_LEAD_IN_PX } from "@/lib/service-story-timeline-progress";

export { STORY_SPINE_LEAD_IN_PX };

/** @deprecated Используйте computeTrackScrollProgress из service-story-timeline-progress */
export function computeStoryTrackScrollProgress(
  _originBottom: number,
  trackTop: number,
  trackHeight: number,
  viewportHeight: number
): number {
  const scrollRange = Math.max(trackHeight - viewportHeight * 0.35, 1);
  const scrolled = -trackTop + viewportHeight * 0.15;
  return Math.max(0, Math.min(scrolled / scrollRange, 1));
}

/** @deprecated */
export function computeTrackSpineScaleY(trackProgress: number, _beatCount: number, spineHeightPx: number): number {
  if (spineHeightPx <= 0) return 0;
  return Math.min(STORY_SPINE_LEAD_IN_PX / spineHeightPx, 0.12) + trackProgress * 0.88;
}

/** @deprecated */
export function computeStorySpineScaleY(progress: number, spineHeightPx: number): number {
  return computeTrackSpineScaleY(progress, 1, spineHeightPx);
}

/** @deprecated */
export function computeSpineVisibleLengthPx(
  trackProgress: number,
  _beatCount: number,
  originToNodeSpanPx: number,
  leadInPx = STORY_SPINE_LEAD_IN_PX
): number {
  return Math.max(leadInPx, trackProgress * originToNodeSpanPx);
}

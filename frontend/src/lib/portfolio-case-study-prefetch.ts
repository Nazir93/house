import type { CaseStudyPhase } from "@/lib/portfolio-case-study";

const DEFAULT_W = 828;
const DEFAULT_Q = 78;

function isUnoptimizedSrc(src: string): boolean {
  const t = src.trim();
  return t.startsWith("data:") || /\.(gif|svg)($|\?)/i.test(t);
}

/** Тот же URL, что запрашивает `next/image` с дефолтным лоадером (совпадает с `CmsImage` quality={78}). */
export function caseStudyNextImagePrefetchHref(
  src: string,
  width: number = DEFAULT_W,
  quality: number = DEFAULT_Q
): string {
  return `/_next/image?url=${encodeURIComponent(src.trim())}&w=${width}&q=${quality}`;
}

export function collectCaseStudyImagesForPhase(phase: CaseStudyPhase): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t1 of phase.tier1) {
    for (const t2 of t1.tier2) {
      for (const u of t2.images ?? []) {
        const s = u?.trim();
        if (s && !seen.has(s)) {
          seen.add(s);
          out.push(s);
        }
      }
    }
  }
  return out;
}

export function collectAllCaseStudyImages(phases: CaseStudyPhase[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of phases) {
    for (const s of collectCaseStudyImagesForPhase(p)) {
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  }
  return out;
}

function saveDataEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(c?.saveData);
}

/**
 * Подогревает кэш браузера под `/_next/image` (как на витринах, где картинки «уже есть»).
 * Низкий приоритет: не конкурирует с LCP первого экрана.
 */
export function prefetchCaseStudyImageUrls(
  urls: string[],
  opts?: { max?: number; width?: number; quality?: number }
): void {
  if (typeof window === "undefined" || saveDataEnabled()) return;
  const max = opts?.max ?? 20;
  const width = opts?.width ?? DEFAULT_W;
  const quality = opts?.quality ?? DEFAULT_Q;
  let n = 0;
  for (const src of urls) {
    if (n >= max) break;
    const s = src?.trim();
    if (!s) continue;
    const img = new Image();
    img.decoding = "async";
    img.fetchPriority = "low";
    img.src = isUnoptimizedSrc(s) ? s : caseStudyNextImagePrefetchHref(s, width, quality);
    n += 1;
  }
}

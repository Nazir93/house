/**
 * Скролл к элементу: Lenis (ПК) или window.scrollTo (тач).
 * Не используем scrollIntoView — при Lenis часто нужен 2-й клик.
 */

export function readCssLengthToPx(cssLength: string, rootFontPx = 16): number {
  const raw = cssLength.trim();
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  if (raw.endsWith("rem")) return n * rootFontPx;
  return n;
}

export function siteHeaderStickyOffsetPx(
  getPropertyValue: (name: string) => string = (name) =>
    typeof document !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue(name)
      : "3rem",
): number {
  return readCssLengthToPx(getPropertyValue("--site-header-sticky-offset") || "3rem");
}

/** Как scroll-mt-[calc(var(--site-header-sticky-offset)+1rem)]. */
export function sectionScrollOffsetPx(
  getPropertyValue?: (name: string) => string,
  extraRem = 1,
): number {
  return -(siteHeaderStickyOffsetPx(getPropertyValue) + extraRem * 16);
}

export function resolveElementScrollTopPx(
  rectTop: number,
  currentScrollY: number,
  offsetPx: number,
): number {
  return Math.max(0, rectTop + currentScrollY + offsetPx);
}

type LenisLike = {
  scroll?: number;
  animatedScroll?: number;
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
};

export function scrollPageToElement(
  el: HTMLElement | null | undefined,
  options: { offsetPx?: number; behavior?: ScrollBehavior } = {},
  deps: {
    lenis?: LenisLike | null;
    matchMedia?: (query: string) => { matches: boolean };
    scrollToWindow?: (options: ScrollToOptions) => void;
    nowScrollY?: number;
  } = {},
): boolean {
  if (!el) return false;

  const matchMedia =
    deps.matchMedia ??
    (typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia.bind(window)
      : undefined);
  const reduced =
    options.behavior === "auto" ||
    (options.behavior !== "smooth" && !!matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const lenis =
    deps.lenis !== undefined
      ? deps.lenis
      : typeof window !== "undefined"
        ? (window.__lenis as LenisLike | undefined)
        : undefined;

  const offset = options.offsetPx ?? sectionScrollOffsetPx();
  const currentScrollY =
    deps.nowScrollY ??
    (typeof lenis?.scroll === "number"
      ? lenis.scroll
      : typeof lenis?.animatedScroll === "number"
        ? lenis.animatedScroll
        : typeof window !== "undefined"
          ? window.scrollY || document.documentElement.scrollTop || 0
          : 0);

  const top = resolveElementScrollTopPx(el.getBoundingClientRect().top, currentScrollY, offset);

  if (lenis) {
    lenis.scrollTo(top, reduced ? { immediate: true } : undefined);
    return true;
  }

  const scrollToWindow =
    deps.scrollToWindow ??
    (typeof window !== "undefined" ? window.scrollTo.bind(window) : undefined);
  if (!scrollToWindow) return false;
  scrollToWindow({ top, behavior: reduced ? "auto" : "smooth" });
  return true;
}

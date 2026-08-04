/**
 * Fade только после клиентских переходов.
 * На первом HTML/hydrate анимация с opacity:0 убивает LCP (hero невидим → LCP = логотип).
 */
export function shouldAnimatePageTransition(params: {
  hasHydrated: boolean;
  pathname: string;
  previousPathname: string | null;
}): boolean {
  if (!params.hasHydrated) return false;
  if (params.previousPathname == null) return false;
  return params.previousPathname !== params.pathname;
}

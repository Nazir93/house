/** Маршруты, где SiteShell не показывает основной header/footer. */

export function isAdminShellPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isAccountShellPath(pathname: string): boolean {
  return pathname.startsWith("/account");
}

/** Рекламные LP: свой UI, но ContactModal нужен для CTA. */
export function isAdvertisingLandingPath(pathname: string): boolean {
  return pathname.startsWith("/lp");
}

/** На этих путях модалка контактов должна быть смонтирована. */
export function siteShellNeedsContactModal(pathname: string): boolean {
  if (isAdminShellPath(pathname) || isAccountShellPath(pathname)) return false;
  return true;
}

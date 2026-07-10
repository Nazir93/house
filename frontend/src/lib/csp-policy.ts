const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "https://smartcaptcha.yandexcloud.net",
    "https://smartcaptcha.cloud.yandex.ru",
    "https://*.yandex.ru",
    "https://*.yandex.net",
    "https://*.yandex.com",
    "https://api-maps.yandex.ru",
  ].join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http://localhost http://127.0.0.1",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://api.telegram.org",
    "https://smartcaptcha.yandexcloud.net",
    "https://smartcaptcha.cloud.yandex.ru",
    "https://*.yandex.ru",
    "https://*.yandex.net",
    "https://*.yandex.com",
    "wss://*.yandex.ru",
    "wss://*.yandex.net",
    "https://*.bitrix24.ru",
    "https://*.bitrix24.com",
  ].join(" "),
  [
    "frame-src 'self'",
    "https://smartcaptcha.yandexcloud.net",
    "https://smartcaptcha.cloud.yandex.ru",
    "https://*.yandex.ru",
    "https://*.yandex.net",
    "https://*.yandex.com",
    "https://rtsp.me",
    "https://*.rtsp.me",
    "https://ivideon.com",
    "https://*.ivideon.com",
  ].join(" "),
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
] as const;

/** Report-only CSP: без upgrade-insecure-requests (браузер его игнорирует и шумит в консоли). */
export function buildContentSecurityPolicyReportOnly(): string {
  return CSP_DIRECTIVES.join("; ");
}

/** Enforced CSP: upgrade-insecure-requests имеет смысл только здесь. */
export function buildContentSecurityPolicyEnforced(): string {
  return [...CSP_DIRECTIVES, "upgrade-insecure-requests"].join("; ");
}

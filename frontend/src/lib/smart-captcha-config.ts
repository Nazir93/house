/** SmartCaptcha обязательна на production для публичных форм. */
export function isSmartCaptchaConfigured(): boolean {
  return Boolean(process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY?.trim());
}

export function requireSmartCaptchaOnProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function smartCaptchaUnavailableResponse() {
  return {
    error: "Форма временно недоступна. Позвоните нам или попробуйте позже.",
    status: 503 as const,
  };
}

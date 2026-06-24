import { describe, expect, it } from "vitest";
import { isSmartCaptchaConfigured, requireSmartCaptchaOnProduction } from "@/lib/smart-captcha-config";

describe("smart-captcha-config", () => {
  it("requireSmartCaptchaOnProduction следует NODE_ENV", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(requireSmartCaptchaOnProduction()).toBe(true);
    process.env.NODE_ENV = "test";
    expect(requireSmartCaptchaOnProduction()).toBe(false);
    process.env.NODE_ENV = prev;
  });

  it("isSmartCaptchaConfigured проверяет server key", () => {
    const prev = process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY;
    process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY = "";
    expect(isSmartCaptchaConfigured()).toBe(false);
    process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY = "test-key";
    expect(isSmartCaptchaConfigured()).toBe(true);
    process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY = prev;
  });
});

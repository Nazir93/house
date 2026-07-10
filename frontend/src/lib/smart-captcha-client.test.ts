import { describe, expect, it } from "vitest";
import {
  isSmartCaptchaHostOrKeyError,
  resolveSmartCaptchaWaiter,
} from "@/lib/smart-captcha-client";

describe("smart-captcha-client", () => {
  it("resolveSmartCaptchaWaiter вызывает resolve и чистит таймер", () => {
    let resolved = "";
    const resolveRef = { current: (t: string) => { resolved = t; } };
    const timeoutRef = { current: setTimeout(() => {}, 1000) as ReturnType<typeof setTimeout> };

    resolveSmartCaptchaWaiter(resolveRef, timeoutRef, "token");

    expect(resolved).toBe("token");
    expect(resolveRef.current).toBeUndefined();
    expect(timeoutRef.current).toBeUndefined();
  });

  it("isSmartCaptchaHostOrKeyError распознаёт ошибку домена", () => {
    expect(
      isSmartCaptchaHostOrKeyError(
        "[SmartCaptcha] Widget with this key cannot be used in the host: xn--80aim8afhxn7a.xn--p1ai",
      ),
    ).toBe(true);
    expect(isSmartCaptchaHostOrKeyError("network timeout")).toBe(false);
  });
});

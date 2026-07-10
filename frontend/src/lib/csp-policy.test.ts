import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicyEnforced,
  buildContentSecurityPolicyReportOnly,
} from "@/lib/csp-policy";

describe("csp-policy", () => {
  it("report-only не содержит upgrade-insecure-requests", () => {
    const policy = buildContentSecurityPolicyReportOnly();
    expect(policy).not.toContain("upgrade-insecure-requests");
    expect(policy).toContain("wss://*.yandex.ru");
    expect(policy).toContain("https://smartcaptcha.cloud.yandex.ru");
  });

  it("enforced добавляет upgrade-insecure-requests", () => {
    const policy = buildContentSecurityPolicyEnforced();
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).toContain("wss://*.yandex.ru");
  });
});

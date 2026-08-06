import { describe, expect, it } from "vitest";

import {
  assertHealthProbeResults,
  assertNextBuildArtifacts,
  DEPLOY_HEALTH_RETRY,
} from "@/lib/deploy-ready-checks";

describe("assertNextBuildArtifacts", () => {
  it("ok при BUILD_ID и server/", () => {
    expect(
      assertNextBuildArtifacts({ buildId: "abc123", hasServerDir: true }),
    ).toEqual({ ok: true });
  });

  it("fail без BUILD_ID — сценарий crash-loop на VPS", () => {
    const r = assertNextBuildArtifacts({ buildId: null, hasServerDir: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/BUILD_ID/);
  });

  it("fail при пустом BUILD_ID", () => {
    expect(assertNextBuildArtifacts({ buildId: "  ", hasServerDir: true }).ok).toBe(false);
  });

  it("fail без .next/server", () => {
    const r = assertNextBuildArtifacts({ buildId: "x", hasServerDir: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/server/);
  });
});

describe("assertHealthProbeResults", () => {
  it("ok если среди ретраев есть 200", () => {
    expect(assertHealthProbeResults([502, 502, 200])).toEqual({ ok: true });
  });

  it("fail если только 502 — нельзя писать OK: деплой завершён", () => {
    const r = assertHealthProbeResults([502, 502, 502]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/200/);
  });

  it("fail при пустом списке", () => {
    expect(assertHealthProbeResults([]).ok).toBe(false);
  });
});

describe("DEPLOY_HEALTH_RETRY", () => {
  it("даёт запас на прогрев после pm2 reload", () => {
    expect(DEPLOY_HEALTH_RETRY.attempts).toBeGreaterThanOrEqual(8);
    expect(DEPLOY_HEALTH_RETRY.delayMs).toBeGreaterThanOrEqual(2000);
  });
});

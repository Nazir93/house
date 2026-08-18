import { describe, expect, it } from "vitest";

import {
  DEFAULT_YANDEX_METRIKA_ID,
  buildMetrikaInitOptions,
  parseYandexMetrikaCounterId,
  pickYandexMetrikaId,
  shouldEnableMetrikaWebvisor,
} from "@/lib/analytics-metrika-config";

describe("analytics-metrika-config", () => {
  it("accepts valid counter ids", () => {
    expect(pickYandexMetrikaId("110112800")).toBe("110112800");
    expect(parseYandexMetrikaCounterId("110112800")).toBe(110112800);
  });

  it("rejects invalid counter ids", () => {
    expect(pickYandexMetrikaId("")).toBe("");
    expect(pickYandexMetrikaId("abc")).toBe("");
    expect(parseYandexMetrikaCounterId(undefined)).toBeNull();
  });

  it("falls back to default counter id constant", () => {
    expect(DEFAULT_YANDEX_METRIKA_ID).toBe("110112800");
  });

  it("shouldEnableMetrikaWebvisor отключает webvisor на слабом железе", () => {
    expect(shouldEnableMetrikaWebvisor({ hardwareConcurrency: 2, deviceMemory: 8 })).toBe(false);
    expect(shouldEnableMetrikaWebvisor({ hardwareConcurrency: 8, deviceMemory: 4 })).toBe(false);
    expect(shouldEnableMetrikaWebvisor({ hardwareConcurrency: 8, deviceMemory: 8 })).toBe(true);
    expect(
      shouldEnableMetrikaWebvisor({
        hardwareConcurrency: 6,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      }),
    ).toBe(false);
  });

  it("на слабом железе отключает и webvisor, и clickmap", () => {
    const low = buildMetrikaInitOptions({ hardwareConcurrency: 2, deviceMemory: 8 });
    expect(low.webvisor).toBe(false);
    expect(low.clickmap).toBe(false);

    const ok = buildMetrikaInitOptions({ hardwareConcurrency: 8, deviceMemory: 8 });
    expect(ok.webvisor).toBe(true);
    expect(ok.clickmap).toBe(true);
  });
});

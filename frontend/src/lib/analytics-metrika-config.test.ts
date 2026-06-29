import { describe, expect, it } from "vitest";

import {
  DEFAULT_YANDEX_METRIKA_ID,
  parseYandexMetrikaCounterId,
  pickYandexMetrikaId,
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
});

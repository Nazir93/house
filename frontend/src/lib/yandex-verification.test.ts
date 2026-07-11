import { describe, expect, it } from "vitest";

import {
  buildYandexVerificationMetadata,
  collectYandexVerificationCodes,
} from "@/lib/yandex-verification";

describe("yandex-verification", () => {
  it("collectYandexVerificationCodes объединяет primary и rf без дублей", () => {
    expect(
      collectYandexVerificationCodes("abc123", "f1b9cdcc723be992", "abc123"),
    ).toEqual(["abc123", "f1b9cdcc723be992"]);
  });

  it("buildYandexVerificationMetadata возвращает string или string[]", () => {
    expect(buildYandexVerificationMetadata("only-one")).toBe("only-one");
    expect(buildYandexVerificationMetadata("a", "b")).toEqual(["a", "b"]);
    expect(buildYandexVerificationMetadata("", undefined)).toBeUndefined();
  });
});

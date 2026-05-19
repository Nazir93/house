import { describe, expect, it } from "vitest";
import { isDraftPayloadDirty } from "./draft-section-baseline";

describe("isDraftPayloadDirty", () => {
  it("не помечает раздел до готовности baseline", () => {
    expect(isDraftPayloadDirty(false, '{"a":1}', undefined)).toBe(false);
    expect(isDraftPayloadDirty(false, '{"a":1}', '{"a":2}')).toBe(false);
  });

  it("не помечает при совпадении с baseline", () => {
    expect(isDraftPayloadDirty(true, '{"a":1}', '{"a":1}')).toBe(false);
  });

  it("помечает при отличии от baseline", () => {
    expect(isDraftPayloadDirty(true, '{"a":2}', '{"a":1}')).toBe(true);
  });
});

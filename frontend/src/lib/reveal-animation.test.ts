import { describe, expect, it } from "vitest";

import { revealDelay, revealDelayStyle } from "@/lib/reveal-animation";

describe("reveal-animation", () => {
  it("builds calm stagger delays for ordered cards", () => {
    expect(revealDelay(0)).toBe(0);
    expect(revealDelay(1)).toBe(70);
    expect(revealDelay(3)).toBe(210);
  });

  it("caps long lists so late cards do not feel sluggish", () => {
    expect(revealDelay(100)).toBe(420);
    expect(revealDelay(100, 80, 240)).toBe(240);
  });

  it("returns a CSS variable style", () => {
    expect(revealDelayStyle(2)).toEqual({ "--reveal-delay": "140ms" });
  });
});

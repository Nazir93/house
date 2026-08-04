import { describe, expect, it } from "vitest";

import { MONTSERRAT_DISPLAY, MONTSERRAT_WEIGHTS } from "@/lib/fonts-config";

describe("fonts (LCP)", () => {
  it("не тянет weight 500 в критический путь", () => {
    expect(MONTSERRAT_WEIGHTS).toEqual(["400", "700"]);
    expect(MONTSERRAT_WEIGHTS).not.toContain("500");
  });

  it("display=optional — текст LCP не ждёт webfont на медленной сети", () => {
    expect(MONTSERRAT_DISPLAY).toBe("optional");
  });
});

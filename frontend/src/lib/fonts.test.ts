import { describe, expect, it } from "vitest";

import {
  MONTSERRAT_DISPLAY,
  MONTSERRAT_PRELOAD,
  MONTSERRAT_WEIGHTS,
} from "@/lib/fonts-config";

describe("fonts (LCP)", () => {
  it("не тянет weight 500 в критический путь", () => {
    expect(MONTSERRAT_WEIGHTS).toEqual(["400", "700"]);
    expect(MONTSERRAT_WEIGHTS).not.toContain("500");
  });

  it("display=optional — текст не ждёт webfont на медленной сети", () => {
    expect(MONTSERRAT_DISPLAY).toBe("optional");
  });

  it("preload=false — woff2 не в critical path Lighthouse", () => {
    expect(MONTSERRAT_PRELOAD).toBe(false);
  });
});

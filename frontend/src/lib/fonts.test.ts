import { describe, expect, it } from "vitest";

import {
  MONTSERRAT_DISPLAY,
  MONTSERRAT_PRELOAD,
  MONTSERRAT_WEIGHTS,
} from "@/lib/fonts-config";

describe("fonts", () => {
  it("не тянет weight 500", () => {
    expect(MONTSERRAT_WEIGHTS).toEqual(["400", "700"]);
    expect(MONTSERRAT_WEIGHTS).not.toContain("500");
  });

  it("Montserrat с display=swap и preload — бренд на первом экране", () => {
    expect(MONTSERRAT_DISPLAY).toBe("swap");
    expect(MONTSERRAT_PRELOAD).toBe(true);
  });
});

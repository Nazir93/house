import { describe, expect, it } from "vitest";

import { LP_GUARANTEE_ITEMS, LP_GUARANTEES_INTRO } from "@/lib/lp-guarantees";

describe("LP_GUARANTEE_ITEMS", () => {
  it("есть контроль качества и личный кабинет с камерами", () => {
    expect(LP_GUARANTEE_ITEMS).toHaveLength(4);
    const joined = LP_GUARANTEE_ITEMS.map((i) => `${i.title} ${i.text}`).join(" ");
    expect(joined.toLowerCase()).toMatch(/контроль качества/);
    expect(joined.toLowerCase()).toMatch(/личн/);
    expect(joined.toLowerCase()).toMatch(/камер/);
    expect(LP_GUARANTEES_INTRO.toLowerCase()).toMatch(/контроль качества/);
  });
});

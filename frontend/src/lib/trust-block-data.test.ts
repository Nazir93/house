import { describe, expect, it } from "vitest";

import {
  TRUST_BENEFITS,
  TRUST_SECTION_EYEBROW,
  TRUST_SECTION_INTRO,
  TRUST_SECTION_QUOTE,
  TRUST_SECTION_QUOTE_ATTRIBUTION,
  TRUST_SECTION_TITLE,
  TRUST_SECTION_TITLE_LINES,
  TRUST_STATS,
  TRUST_WHY_EYEBROW,
  TRUST_WHY_INTRO,
  TRUST_WHY_TITLE,
  TRUST_WHY_TITLE_LINES,
} from "@/lib/trust-block-data";

describe("trust-block-data", () => {
  it("блок №1–3 «Нам доверяют»", () => {
    expect(TRUST_SECTION_EYEBROW).toBe("Нам доверяют");
    expect(TRUST_SECTION_TITLE).toContain("Доверие строится");
    expect(TRUST_SECTION_TITLE_LINES.join(" ")).toBe(TRUST_SECTION_TITLE);
    expect(TRUST_SECTION_INTRO).toContain("материалы проверенных производителей");
  });

  it("блок №4–6 «Почему нас выбирают»", () => {
    expect(TRUST_WHY_EYEBROW).toBe("Почему нас выбирают");
    expect(TRUST_WHY_TITLE).toBe("Когда каждый этап понятен, строить гораздо спокойнее.");
    expect(TRUST_WHY_TITLE_LINES.join(" ").replace(/\s+/g, " ")).toBe(
      TRUST_WHY_TITLE.replace(/\.$/, "").trim() + ".",
    );
    expect(TRUST_WHY_INTRO).toContain("какие этапы предстоят дальше");
  });

  it("три преимущества с подзаголовками", () => {
    expect(TRUST_BENEFITS).toHaveLength(3);
    expect(TRUST_BENEFITS[0]).toEqual({ title: "Честная смета", description: "Без скрытых доплат." });
    expect(TRUST_BENEFITS[1]?.title).toBe("Личный менеджер");
    expect(TRUST_BENEFITS[2]?.title).toBe("Проектирование и строительство");
  });

  it("цитата внизу блока доверия", () => {
    expect(TRUST_SECTION_QUOTE).toContain("уверенность на всём пути строительства");
    expect(TRUST_SECTION_QUOTE_ATTRIBUTION).toBe("ООО «Часть Души»");
  });

  it("три статистические карточки", () => {
    expect(TRUST_STATS).toHaveLength(3);
    expect(TRUST_STATS.map((s) => s.value)).toEqual(["10+", "85+", "5 лет"]);
    expect(TRUST_STATS[2]?.label).toBe("Гарантии на конструктив");
  });
});

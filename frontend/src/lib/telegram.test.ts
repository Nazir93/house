import { describe, expect, it } from "vitest";
import { formatLeadMessage } from "./telegram";

describe("formatLeadMessage", () => {
  it("escapes pageUrl before sending as Telegram HTML", () => {
    const msg = formatLeadMessage({
      name: "User",
      phone: "+7",
      pageUrl: "/x?<b>bad</b>&q=1",
    });

    expect(msg).toContain("/x?&lt;b&gt;bad&lt;/b&gt;&amp;q=1");
    expect(msg).not.toContain("/x?<b>bad</b>&q=1");
  });

  it("includes house-project-quote summary with line items", () => {
    const msg = formatLeadMessage({
      name: "Иван",
      phone: "+79990000000",
      source: "project-calculator",
      calcData: {
        kind: "house-project-quote",
        selectionSummaryRu: "Инженерия\nЭлектроснабжение — 264 891 ₽",
        grandTotalRub: 8_781_116,
      },
    });
    expect(msg).toContain("Расчёт с карточки проекта");
    expect(msg).toContain("Электроснабжение — 264 891 ₽");
  });
});

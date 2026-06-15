import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/constants";
import { proposalSiteHost } from "@/lib/proposal/proposal-format";
import { renderProposalHtml } from "@/lib/proposal/render-proposal-html";
import type { ProposalDocumentModel } from "@/lib/proposal/types";

describe("render-proposal-html", () => {
  it("renders Braun-style project quote layout", () => {
    const model: ProposalDocumentModel = {
      leadId: "lead-1",
      kind: "house-project-quote",
      title: "Браун",
      leadName: "Иван",
      leadPhone: "+79990000000",
      leadEmail: null,
      createdAtIso: "2026-06-13T10:00:00.000Z",
      summary: [
        { label: "Площадь", value: "114 м2" },
        { label: "Этажность", value: "1 эт." },
      ],
      rows: [
        {
          key: "shell",
          group: "shell",
          label: "Коробка",
          amountRub: 7_536_540,
          included: { STANDARD: true, ENGINEERING: true, WHITE_BOX: true, CLIENT_CHOICE: true },
        },
        {
          key: "section:engineering",
          rowKind: "section",
          group: "other",
          label: "Инженерные коммуникации",
          amountRub: 0,
          included: { STANDARD: false, ENGINEERING: false, WHITE_BOX: false, CLIENT_CHOICE: false },
        },
      ],
      packageTotalsRub: { STANDARD: 7_536_540, ENGINEERING: 10_019_455, WHITE_BOX: 12_548_956, CLIENT_CHOICE: 12_415_741 },
      planImageUrl: null,
      notes: ["* test"],
    };
    const html = renderProposalHtml(model);
    expect(html).toContain("АВТОРСКИЙ ПРОЕКТ «БРАУН»");
    expect(html).toContain(proposalSiteHost(SITE_URL));
    expect(html).toContain("Дата печати:");
    expect(html).toContain("Опции и стоимость");
    expect(html).toContain("Стандарт*");
    expect(html.replace(/\u00a0/g, " ")).toContain("7 536 540");
    expect(html).not.toContain("Клиент:");
    expect(html).not.toContain("₽");
  });
});

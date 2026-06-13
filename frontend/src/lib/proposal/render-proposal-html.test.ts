import { describe, expect, it } from "vitest";
import { renderProposalHtml } from "@/lib/proposal/render-proposal-html";
import type { ProposalDocumentModel } from "@/lib/proposal/types";

describe("render-proposal-html", () => {
  it("renders package columns and row data", () => {
    const model: ProposalDocumentModel = {
      leadId: "lead-1",
      kind: "house-project-quote",
      title: "Проект Браун",
      leadName: "Иван",
      leadPhone: "+79990000000",
      leadEmail: null,
      createdAtIso: "2026-06-13T10:00:00.000Z",
      summary: [{ label: "Площадь", value: "114 м2" }],
      rows: [
        {
          key: "shell",
          group: "shell",
          label: "Коробка",
          amountRub: 100,
          included: { STANDARD: true, ENGINEERING: true, WHITE_BOX: true, CLIENT_CHOICE: true },
        },
      ],
      packageTotalsRub: { STANDARD: 100, ENGINEERING: 100, WHITE_BOX: 100, CLIENT_CHOICE: 100 },
      planImageUrl: null,
      notes: ["* test"],
    };
    const html = renderProposalHtml(model);
    expect(html).toContain("Проект Браун");
    expect(html).toContain("Стандарт");
    expect(html).toContain("White Box");
    expect(html).toContain("Коробка");
  });
});


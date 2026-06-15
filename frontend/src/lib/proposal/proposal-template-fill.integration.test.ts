import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { fillMasterProposalTemplate } from "@/lib/proposal/proposal-template-fill";
import type { ProposalDocumentModel } from "@/lib/proposal/types";

const model: ProposalDocumentModel = {
  leadId: "lead-template",
  kind: "house-project-quote",
  title: "Тиллит",
  leadName: "Павел",
  leadPhone: "+7 (921) 552-78-27",
  leadEmail: "test@example.com",
  createdAtIso: "2026-06-12T12:00:00.000Z",
  summary: [
    { label: "Площадь", value: "69 м2" },
    { label: "Этажность", value: "1 эт." },
    { label: "Количество спален", value: "2 шт." },
    { label: "Количество санузлов", value: "1 шт." },
  ],
  rows: [
    {
      key: "eng:electric",
      group: "engineering",
      label: "Электроснабжение",
      amountRub: 264_891,
      included: { STANDARD: false, ENGINEERING: true, WHITE_BOX: true, CLIENT_CHOICE: true },
    },
  ],
  packageTotalsRub: { STANDARD: 5_400_085, ENGINEERING: 7_251_081, WHITE_BOX: 8_298_849, CLIENT_CHOICE: 6_493_431 },
  templateFill: { wallMaterialLabel: "Газоблок", floorLabel: "Одноэтажный" },
  notes: [],
};

describe("fillMasterProposalTemplate integration", () => {
  it("produces 16-page PDF from master template", async () => {
    const bytes = await fillMasterProposalTemplate(model);
    expect(bytes.length).toBeGreaterThan(500_000);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(16);
  }, 30_000);
});

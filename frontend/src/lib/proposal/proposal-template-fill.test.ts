import { describe, expect, it } from "vitest";
import { buildTemplateFillFromModel } from "@/lib/proposal/proposal-template-fill";
import type { ProposalDocumentModel } from "@/lib/proposal/types";

function sampleModel(overrides: Partial<ProposalDocumentModel> = {}): ProposalDocumentModel {
  return {
    leadId: "lead-1",
    kind: "house-project-quote",
    title: "Тиллит",
    leadName: "Павел",
    leadPhone: "+7 (921) 552-78-27",
    leadEmail: null,
    createdAtIso: "2026-06-12T12:00:00.000Z",
    summary: [
      { label: "Площадь", value: "69 м2" },
      { label: "Этажность", value: "1 эт." },
      { label: "Количество спален", value: "2 шт." },
      { label: "Количество санузлов", value: "1 шт." },
    ],
    rows: [],
    packageTotalsRub: { STANDARD: 5_400_085, ENGINEERING: 7_251_081, WHITE_BOX: 8_298_849, CLIENT_CHOICE: 6_493_431 },
    templateFill: { wallMaterialLabel: "Газоблок", floorLabel: "Одноэтажный" },
    notes: [],
    ...overrides,
  };
}

describe("proposal-template-fill", () => {
  it("maps calculator totals to 3-tier template prices", () => {
    const fill = buildTemplateFillFromModel(sampleModel());
    expect(fill.priceStandardRub).toBe(5_400_085);
    expect(fill.priceComfortRub).toBe(7_251_081);
    expect(fill.priceComfortPlusRub).toBe(6_493_431);
    expect(fill.priceWithExtrasRub).toBe(6_493_431);
    expect(fill.wallMaterialLabel).toBe("Газоблок");
  });
});

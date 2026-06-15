import { describe, expect, it } from "vitest";
import { PROPOSAL_ROW_LABEL_OVERRIDES, proposalRowLabel } from "@/lib/proposal/proposal-row-labels";

describe("proposal-row-labels", () => {
  it("maps catalog labels to Braun wording", () => {
    expect(proposalRowLabel("Разводка воды")).toBe("Разводка воды по дому");
    expect(proposalRowLabel("Внутренняя штукатурка")).toBe("Штукатурка стен");
    expect(PROPOSAL_ROW_LABEL_OVERRIDES["Утепление кровли 250 мм"]).toBe("Утепление перекрестное");
  });
});

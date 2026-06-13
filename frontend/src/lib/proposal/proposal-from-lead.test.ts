import { describe, expect, it } from "vitest";
import { buildProposalModelFromLead } from "@/lib/proposal/proposal-from-lead";

describe("proposal-from-lead", () => {
  it("returns unsupported for unknown calc kind", async () => {
    const result = await buildProposalModelFromLead({
      id: "lead-1",
      name: "Иван",
      phone: "+79990000000",
      email: null,
      calcData: { kind: "unknown-kind" },
      createdAt: new Date("2026-06-13T10:00:00.000Z"),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("unsupported kind");
    }
  });
});


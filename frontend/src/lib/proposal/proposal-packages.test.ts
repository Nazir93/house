import { describe, expect, it } from "vitest";
import { packageIncludedByGroup, sumPackageTotals } from "@/lib/proposal/proposal-packages";

describe("proposal-packages", () => {
  it("maps shell to all package columns except custom by flag", () => {
    const inc = packageIncludedByGroup("shell", true);
    expect(inc.STANDARD).toBe(true);
    expect(inc.ENGINEERING).toBe(true);
    expect(inc.WHITE_BOX).toBe(true);
    expect(inc.CLIENT_CHOICE).toBe(true);
  });

  it("sums totals by inclusion matrix", () => {
    const rows = [
      { amountRub: 100, included: packageIncludedByGroup("shell", true) },
      { amountRub: 25, included: packageIncludedByGroup("engineering", true) },
      { amountRub: 10, included: packageIncludedByGroup("construction", false) },
    ];
    const totals = sumPackageTotals(rows);
    expect(totals.STANDARD).toBe(100);
    expect(totals.ENGINEERING).toBe(125);
    expect(totals.WHITE_BOX).toBe(135);
    expect(totals.CLIENT_CHOICE).toBe(125);
  });
});


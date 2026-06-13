import type { ProposalPackageKey } from "@/lib/proposal/types";

type PackageRule = {
  engineering: boolean;
  facade: boolean;
  construction: boolean;
};

const PACKAGE_RULES: Record<ProposalPackageKey, PackageRule> = {
  STANDARD: { engineering: false, facade: false, construction: false },
  ENGINEERING: { engineering: true, facade: false, construction: false },
  WHITE_BOX: { engineering: true, facade: true, construction: true },
  CLIENT_CHOICE: { engineering: false, facade: false, construction: false },
};

export function packageIncludedByGroup(
  group: "shell" | "engineering" | "facade" | "construction" | "other",
  inClientChoice: boolean
): Record<ProposalPackageKey, boolean> {
  return {
    STANDARD: group === "shell",
    ENGINEERING: group === "shell" || (group === "engineering" && PACKAGE_RULES.ENGINEERING.engineering),
    WHITE_BOX:
      group === "shell" ||
      (group === "engineering" && PACKAGE_RULES.WHITE_BOX.engineering) ||
      (group === "facade" && PACKAGE_RULES.WHITE_BOX.facade) ||
      (group === "construction" && PACKAGE_RULES.WHITE_BOX.construction),
    CLIENT_CHOICE: inClientChoice,
  };
}

export function sumPackageTotals(
  rows: Array<{ amountRub: number; included: Record<ProposalPackageKey, boolean> }>
): Record<ProposalPackageKey, number> {
  const out: Record<ProposalPackageKey, number> = {
    STANDARD: 0,
    ENGINEERING: 0,
    WHITE_BOX: 0,
    CLIENT_CHOICE: 0,
  };
  rows.forEach((r) => {
    (Object.keys(out) as ProposalPackageKey[]).forEach((k) => {
      if (r.included[k]) out[k] += Math.max(0, Math.round(r.amountRub));
    });
  });
  return out;
}


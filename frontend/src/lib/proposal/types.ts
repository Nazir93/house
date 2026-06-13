export type ProposalPackageKey = "STANDARD" | "ENGINEERING" | "WHITE_BOX" | "CLIENT_CHOICE";

export const PROPOSAL_PACKAGE_ORDER: ProposalPackageKey[] = [
  "STANDARD",
  "ENGINEERING",
  "WHITE_BOX",
  "CLIENT_CHOICE",
];

export const PROPOSAL_PACKAGE_LABELS: Record<ProposalPackageKey, string> = {
  STANDARD: "Стандарт",
  ENGINEERING: "С инженер. сетями",
  WHITE_BOX: "White Box",
  CLIENT_CHOICE: "Выбор клиента",
};

export type ProposalScopeKind =
  | "house-project-quote"
  | "house-construction-quote"
  | "design-project-quote"
  | "price-smeta";

export type ProposalSummaryField = { label: string; value: string };

export type ProposalPriceRow = {
  key: string;
  group: "shell" | "engineering" | "facade" | "construction" | "other";
  label: string;
  amountRub: number;
  included: Record<ProposalPackageKey, boolean>;
};

export type ProposalDocumentModel = {
  leadId: string;
  kind: ProposalScopeKind;
  title: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string | null;
  createdAtIso: string;
  summary: ProposalSummaryField[];
  rows: ProposalPriceRow[];
  packageTotalsRub: Record<ProposalPackageKey, number>;
  planImageUrl?: string | null;
  notes: string[];
};

